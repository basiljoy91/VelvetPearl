const db = require('../config/db');

const ENQUIRY_TYPE_CONFIG = {
  cab: { prefix: 'CAB', table: 'cab_enquiry_details' },
  room: { prefix: 'ROOM', table: 'room_enquiry_details' },
  tour: { prefix: 'TOUR', table: 'tour_enquiry_details' },
  custom: { prefix: 'CUSTOM', table: 'custom_trip_details' },
  general: { prefix: 'GEN', table: null },
};

const normalizeEnquiryType = (value) => {
  const normalized = String(value || 'general').trim().toLowerCase();

  if (['cab', 'room', 'tour', 'general'].includes(normalized)) {
    return normalized;
  }

  if (['custom', 'custom_trip', 'event'].includes(normalized)) {
    return 'custom';
  }

  return 'general';
};

const buildReferenceId = (prefix, year, sequence) => (
  `${prefix}-${year}-${String(sequence).padStart(4, '0')}`
);

const serializeAuditValue = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const parseDurationDays = (value) => {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  const directNumber = normalized.match(/^(\d+)$/);
  if (directNumber) {
    return Number(directNumber[1]);
  }

  const numberMatches = [...normalized.matchAll(/\d+/g)].map(([match]) => Number(match));
  if (!numberMatches.length) return null;

  return numberMatches[0] > 0 ? numberMatches[0] : null;
};

const insertServiceDetails = async (client, enquiryId, enquiryType, details) => {
  if (enquiryType === 'cab') {
    await client.query(
      `
        INSERT INTO cab_enquiry_details (
          enquiry_id,
          pickup,
          dropoff,
          passengers,
          luggage,
          vehicle_preference,
          requirement_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        enquiryId,
        details.pickup || null,
        details.dropoff || null,
        details.passengers || null,
        details.luggage || null,
        details.vehicle_preference || null,
        details.notes || details.requirement_notes || null,
      ]
    );
  }

  if (enquiryType === 'room') {
    await client.query(
      `
        INSERT INTO room_enquiry_details (
          enquiry_id,
          check_in,
          check_out,
          guests,
          room_count,
          room_type,
          budget,
          preferred_area,
          preferred_hotel
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        enquiryId,
        details.check_in || null,
        details.check_out || null,
        details.guests || null,
        details.room_count || null,
        details.room_type || null,
        details.budget || null,
        details.location_preference || null,
        details.hotel_name || null,
      ]
    );
  }

  if (enquiryType === 'tour') {
    const durationLabel = details.duration_label || details.trip_duration || details.duration || null;
    const durationDays = parseDurationDays(details.duration_days ?? durationLabel);

    await client.query(
      `
        INSERT INTO tour_enquiry_details (
          enquiry_id,
          destination,
          travel_window_start,
          travel_window_end,
          duration_days,
          duration_label,
          group_size,
          pickup_required,
          hotel_preference,
          budget
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        enquiryId,
        details.destination || details.package_name || null,
        details.travel_window_start || null,
        details.travel_window_end || null,
        durationDays,
        durationLabel,
        details.group_size || null,
        details.pickup_required || details.cab_required || null,
        details.hotel_preference || null,
        details.budget || null,
      ]
    );
  }

  if (enquiryType === 'custom') {
    await client.query(
      `
        INSERT INTO custom_trip_details (
          enquiry_id,
          custom_category,
          location,
          travel_window_start,
          travel_window_end,
          group_size,
          budget,
          requirement_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        enquiryId,
        details.event_type || details.custom_category || null,
        details.location || null,
        details.travel_window_start || null,
        details.travel_window_end || null,
        details.guests || details.group_size || null,
        details.budget || null,
        details.notes || details.requirement_notes || null,
      ]
    );
  }
};

const updateServiceDetails = async (client, enquiryId, enquiryType, details) => {
  await client.query('DELETE FROM cab_enquiry_details WHERE enquiry_id = $1', [enquiryId]);
  await client.query('DELETE FROM room_enquiry_details WHERE enquiry_id = $1', [enquiryId]);
  await client.query('DELETE FROM tour_enquiry_details WHERE enquiry_id = $1', [enquiryId]);
  await client.query('DELETE FROM custom_trip_details WHERE enquiry_id = $1', [enquiryId]);
  await insertServiceDetails(client, enquiryId, enquiryType, details);
};

const baseSelect = `
  SELECT
    e.id,
    e.reference_id,
    e.enquiry_type,
    e.customer_name,
    e.phone_number,
    e.whatsapp_number,
    e.email,
    e.preferred_contact_method,
    e.source_page,
    e.status,
    e.priority,
    e.travel_date,
    e.travel_time,
    e.service_details_json,
    e.admin_notes,
    e.consent_to_contact,
    e.requirement_notes,
    e.assigned_driver_id,
    d.name AS assigned_driver_name,
    e.assigned_vehicle_id,
    e.assigned_room_id,
    e.assigned_package_id,
    e.assigned_hotel_option,
    e.assigned_owner_id,
    e.quote_amount,
    e.submitted_at,
    e.updated_at,
    e.last_contacted_at,
    e.follow_up_at,
    e.is_archived,
    e.archived_at,
    e.archived_reason,
    e.admin_whatsapp_notification_status,
    e.customer_whatsapp_notification_status,
    e.whatsapp_error_message,
    e.notification_sent_at,
    e.notification_status,
    e.notification_error
  FROM enquiries e
  LEFT JOIN drivers d ON d.id = e.assigned_driver_id
`;

const buildListFilters = (filters = {}) => {
  const clauses = [];
  const values = [];
  let index = 1;

  if (!filters.include_archived) {
    clauses.push('COALESCE(e.is_archived, false) = false');
  }

  if (filters.enquiry_type) {
    clauses.push(`e.enquiry_type = $${index++}`);
    values.push(normalizeEnquiryType(filters.enquiry_type));
  }

  if (filters.status) {
    clauses.push(`e.status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.date_from) {
    clauses.push(`DATE(e.submitted_at) >= $${index++}`);
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    clauses.push(`DATE(e.submitted_at) <= $${index++}`);
    values.push(filters.date_to);
  }

  if (filters.search) {
    clauses.push(`(
      LOWER(e.customer_name) LIKE $${index}
      OR LOWER(COALESCE(e.phone_number, '')) LIKE $${index}
      OR LOWER(COALESCE(e.whatsapp_number, '')) LIKE $${index}
      OR LOWER(COALESCE(e.reference_id, '')) LIKE $${index}
    )`);
    values.push(`%${String(filters.search).toLowerCase()}%`);
    index += 1;
  }

  if (filters.assigned_driver_id) {
    clauses.push(`e.assigned_driver_id = $${index++}`);
    values.push(filters.assigned_driver_id);
  }

  if (filters.assigned_vehicle_id) {
    clauses.push(`e.assigned_vehicle_id = $${index++}`);
    values.push(filters.assigned_vehicle_id);
  }

  if (filters.assigned_package_id) {
    clauses.push(`e.assigned_package_id = $${index++}`);
    values.push(filters.assigned_package_id);
  }

  if (filters.assigned_room_id) {
    clauses.push(`e.assigned_room_id = $${index++}`);
    values.push(filters.assigned_room_id);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
};

const Booking = {
  getAll: async (filters = {}) => {
    const { whereClause, values } = buildListFilters(filters);
    const query = `
      ${baseSelect}
      ${whereClause}
      ORDER BY e.submitted_at DESC, e.id DESC
    `;

    const { rows } = await db.query(query, values);
    return rows;
  },

  getById: async (id) => {
    const { rows } = await db.query(
      `
        ${baseSelect}
        WHERE e.id = $1
      `,
      [id]
    );
    return rows[0] || null;
  },

  getAuditTrail: async (id) => {
    const { rows } = await db.query(
      `
        SELECT
          id,
          enquiry_id,
          admin_id,
          admin_role,
          action_type,
          field_name,
          previous_value,
          next_value,
          metadata_json,
          created_at
        FROM enquiry_audit_log
        WHERE enquiry_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [id]
    );

    return rows;
  },

  create: async (enquiryData) => {
    const client = await db.connect();

    try {
      await client.beginTransaction();

      const enquiryType = normalizeEnquiryType(enquiryData.enquiry_type);
      const { prefix } = ENQUIRY_TYPE_CONFIG[enquiryType];
      const year = new Date().getFullYear();

      await client.query(
        `
          INSERT INTO enquiry_counters (enquiry_type, enquiry_year, last_number)
          VALUES ($1, $2, LAST_INSERT_ID(1))
          ON DUPLICATE KEY UPDATE last_number = LAST_INSERT_ID(last_number + 1)
        `,
        [enquiryType, year]
      );

      const counterResult = await client.query('SELECT LAST_INSERT_ID() AS last_number');
      const sequence = Number(counterResult.rows[0]?.last_number || 1);
      const referenceId = buildReferenceId(prefix, year, sequence);

      const insertResult = await client.query(
        `
          INSERT INTO enquiries (
            reference_id,
            enquiry_type,
            customer_name,
            phone_number,
            whatsapp_number,
            email,
            preferred_contact_method,
            source_page,
            status,
            priority,
            travel_date,
            travel_time,
            service_details_json,
            admin_notes,
            assigned_driver_id,
            assigned_vehicle_id,
            assigned_room_id,
            assigned_package_id,
            assigned_hotel_option,
            assigned_owner_id,
            quote_amount,
            last_contacted_at,
            follow_up_at,
            consent_to_contact,
            requirement_notes,
            is_archived,
            archived_at,
            archived_reason,
            admin_whatsapp_notification_status,
            customer_whatsapp_notification_status,
            whatsapp_error_message,
            notification_sent_at,
            notification_status,
            notification_error
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, false, NULL, NULL, $26, $27, $28, $29, 'pending', NULL
          )
        `,
        [
          referenceId,
          enquiryType,
          enquiryData.customer_name,
          enquiryData.phone_number,
          enquiryData.whatsapp_number,
          enquiryData.email || null,
          enquiryData.preferred_contact_method || 'whatsapp',
          enquiryData.source_page || enquiryType,
          enquiryData.status || 'New',
          enquiryData.priority || 'Normal',
          enquiryData.travel_date || null,
          enquiryData.travel_time || null,
          JSON.stringify(enquiryData.service_details_json || {}),
          enquiryData.admin_notes || null,
          enquiryData.assigned_driver_id || null,
          enquiryData.assigned_vehicle_id || null,
          enquiryData.assigned_room_id || null,
          enquiryData.assigned_package_id || null,
          enquiryData.assigned_hotel_option || null,
          enquiryData.assigned_owner_id || null,
          enquiryData.quote_amount || null,
          enquiryData.last_contacted_at || null,
          enquiryData.follow_up_at || null,
          enquiryData.consent_to_contact !== false,
          enquiryData.requirement_notes || null,
          enquiryData.admin_whatsapp_notification_status || 'not_enabled',
          enquiryData.customer_whatsapp_notification_status || 'not_enabled',
          enquiryData.whatsapp_error_message || null,
          enquiryData.notification_sent_at || null,
        ]
      );

      const enquiryId = insertResult.insertId;
      await insertServiceDetails(client, enquiryId, enquiryType, enquiryData.service_details_json || {});
      const createdResult = await client.query('SELECT * FROM enquiries WHERE id = $1', [enquiryId]);

      await client.commit();
      return createdResult.rows[0];
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  updateStatus: async (id, status) => db.query(
    'UPDATE enquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [status, id]
  ),

  updateNotes: async (id, adminNotes) => db.query(
    `
      UPDATE enquiries
      SET admin_notes = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [adminNotes, id]
  ),

  updateEnquiry: async (id, enquiryData) => {
    const client = await db.connect();

    try {
      await client.beginTransaction();

      const currentResult = await client.query(
        'SELECT enquiry_type, service_details_json FROM enquiries WHERE id = $1',
        [id]
      );

      if (currentResult.rowCount === 0) {
        await client.rollback();
        return { rowCount: 0 };
      }

      const current = currentResult.rows[0];
      const nextDetails = enquiryData.service_details_json || current.service_details_json || {};

      const result = await client.query(
        `
          UPDATE enquiries
          SET
            status = COALESCE($1, status),
            priority = COALESCE($2, priority),
            admin_notes = COALESCE($3, admin_notes),
            assigned_driver_id = COALESCE($4, assigned_driver_id),
            assigned_vehicle_id = COALESCE($5, assigned_vehicle_id),
            assigned_room_id = COALESCE($6, assigned_room_id),
            assigned_package_id = COALESCE($7, assigned_package_id),
            assigned_hotel_option = COALESCE($8, assigned_hotel_option),
            assigned_owner_id = COALESCE($9, assigned_owner_id),
            quote_amount = COALESCE($10, quote_amount),
            last_contacted_at = $11,
            follow_up_at = $12,
            service_details_json = $13,
            requirement_notes = COALESCE($14, requirement_notes),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $15
        `,
        [
          enquiryData.status || null,
          enquiryData.priority || null,
          enquiryData.admin_notes || null,
          enquiryData.assigned_driver_id || null,
          enquiryData.assigned_vehicle_id || null,
          enquiryData.assigned_room_id || null,
          enquiryData.assigned_package_id || null,
          enquiryData.assigned_hotel_option || null,
          enquiryData.assigned_owner_id || null,
          enquiryData.quote_amount || null,
          enquiryData.last_contacted_at || null,
          enquiryData.follow_up_at || null,
          JSON.stringify(nextDetails),
          enquiryData.requirement_notes || null,
          id,
        ]
      );

      await updateServiceDetails(
        client,
        id,
        normalizeEnquiryType(current.enquiry_type),
        nextDetails
      );

      await client.commit();
      return result;
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  assignDriver: async (id, driverId) => db.query(
    `
      UPDATE enquiries
      SET assigned_driver_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [driverId, id]
  ),

  assignVehicle: async (id, vehicleId) => db.query(
    `
      UPDATE enquiries
      SET assigned_vehicle_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [vehicleId, id]
  ),

  assignRoom: async (id, roomId, hotelOption = null) => db.query(
    `
      UPDATE enquiries
      SET assigned_room_id = $1,
          assigned_hotel_option = COALESCE($2, assigned_hotel_option),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
    [roomId, hotelOption, id]
  ),

  assignPackage: async (id, packageId) => db.query(
    `
      UPDATE enquiries
      SET assigned_package_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [packageId, id]
  ),

  updateQuote: async (id, quoteAmount) => db.query(
    `
      UPDATE enquiries
      SET quote_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [quoteAmount, id]
  ),

  archive: async (id, archivedReason = null) => db.query(
    `
      UPDATE enquiries
      SET is_archived = true,
          archived_at = CURRENT_TIMESTAMP,
          archived_reason = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [archivedReason, id]
  ),

  updateWhatsAppTracking: async (id, updates = {}) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (updates.admin_whatsapp_notification_status !== undefined) {
      fields.push(`admin_whatsapp_notification_status = $${index++}`);
      values.push(updates.admin_whatsapp_notification_status);
    }

    if (updates.customer_whatsapp_notification_status !== undefined) {
      fields.push(`customer_whatsapp_notification_status = $${index++}`);
      values.push(updates.customer_whatsapp_notification_status);
    }

    if (updates.whatsapp_error_message !== undefined) {
      fields.push(`whatsapp_error_message = $${index++}`);
      values.push(updates.whatsapp_error_message);
    }

    if (updates.notification_sent_at !== undefined) {
      fields.push(`notification_sent_at = $${index++}`);
      values.push(updates.notification_sent_at);
    }

    if (updates.notification_status !== undefined) {
      fields.push(`notification_status = $${index++}`);
      values.push(updates.notification_status);
    }

    if (updates.notification_error !== undefined) {
      fields.push(`notification_error = $${index++}`);
      values.push(updates.notification_error);
    }

    if (!fields.length) {
      return { rowCount: 0 };
    }

    values.push(id);

    return db.query(
      `
        UPDATE enquiries
        SET ${fields.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
      `,
      values
    );
  },

  updateNotificationStatus: async (id, status, errorMessage = null) => db.query(
    `
      UPDATE enquiries
      SET notification_status = $1,
          notification_error = $2,
          admin_whatsapp_notification_status = $1,
          whatsapp_error_message = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
    [status, errorMessage, id]
  ),

  delete: async (id) => db.query('DELETE FROM enquiries WHERE id = $1', [id]),

  addAuditLog: async ({
    enquiryId,
    adminId = null,
    adminRole = 'admin',
    actionType,
    fieldName = null,
    previousValue = null,
    nextValue = null,
    metadata = {},
  }) => db.query(
    `
      INSERT INTO enquiry_audit_log (
        enquiry_id,
        admin_id,
        admin_role,
        action_type,
        field_name,
        previous_value,
        next_value,
        metadata_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      enquiryId,
      adminId,
      adminRole,
      actionType,
      fieldName,
      serializeAuditValue(previousValue),
      serializeAuditValue(nextValue),
      JSON.stringify(metadata || {}),
    ]
  ),
};

module.exports = Booking;
