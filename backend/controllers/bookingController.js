const Booking = require('../models/bookingModel');
const {
  getInitialWhatsAppTracking,
  sendAdminNotification,
  sendCustomerAcknowledgement,
} = require('../services/whatsappService');

const VALID_STATUSES = [
  'New',
  'Contacted',
  'Quoted',
  'Awaiting Customer',
  'Assigned',
  'Confirmed',
  'Completed',
  'Rejected',
  'Cancelled',
];

const summarizeRequirementNotes = (enquiryType, details = {}) => {
  switch (enquiryType) {
    case 'cab':
      return [details.pickup, details.dropoff, details.vehicle_preference].filter(Boolean).join(' • ');
    case 'room':
      return [details.location_preference || details.hotel_name, details.room_count && `${details.room_count} room(s)`, details.guests && `${details.guests} guest(s)`].filter(Boolean).join(' • ');
    case 'tour':
      return [details.destination, details.group_size && `${details.group_size} traveler(s)`, details.budget].filter(Boolean).join(' • ');
    case 'custom':
      return [details.custom_category, details.location, details.group_size && `${details.group_size} traveler(s)`].filter(Boolean).join(' • ');
    default:
      return details.message || details.summary || 'General travel enquiry';
  }
};

const normalizeEnquiryType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (['cab', 'room', 'tour', 'general'].includes(normalized)) {
    return normalized;
  }

  if (['custom', 'custom_trip', 'event'].includes(normalized)) {
    return 'custom';
  }

  return 'general';
};

const buildTravelDate = (enquiryType, body, details) => {
  if (body.travel_date) return body.travel_date;
  if (enquiryType === 'room') return details.check_in || null;
  if (enquiryType === 'tour') return details.travel_window_start || null;
  return null;
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return false;
};

const buildPublicCreatePayload = (body = {}) => {
  const enquiryType = normalizeEnquiryType(body.enquiry_type || body.service_type || body.service);
  const details = body.service_details_json || body.enquiry_details || {};
  const phone = body.phone_number || body.phone || '';
  const whatsappNumber = body.whatsapp_number || phone;

  return {
    enquiry_type: enquiryType,
    customer_name: body.customer_name || body.customer || body.full_name || '',
    phone_number: phone,
    whatsapp_number: whatsappNumber,
    email: body.email || '',
    preferred_contact_method: body.preferred_contact_method || (whatsappNumber ? 'whatsapp' : 'phone'),
    source_page: body.source_page || enquiryType,
    status: 'New',
    priority: body.priority || 'Normal',
    travel_date: buildTravelDate(enquiryType, body, details),
    travel_time: body.travel_time || null,
    service_details_json: details,
    admin_notes: null,
    assigned_driver_id: null,
    assigned_vehicle_id: null,
    assigned_room_id: null,
    assigned_package_id: null,
    assigned_hotel_option: null,
    assigned_owner_id: null,
    quote_amount: null,
    last_contacted_at: null,
    follow_up_at: null,
    consent_to_contact: body.consent_to_contact !== false,
    requirement_notes: body.requirement_notes || body.details || summarizeRequirementNotes(enquiryType, details),
    ...getInitialWhatsAppTracking(),
  };
};

const normalizeUpdatePayload = (body = {}) => ({
  status: body.status && VALID_STATUSES.includes(body.status) ? body.status : undefined,
  priority: hasOwn(body, 'priority') ? body.priority : undefined,
  admin_notes: hasOwn(body, 'admin_notes') ? body.admin_notes : undefined,
  assigned_driver_id: hasOwn(body, 'assigned_driver_id') ? body.assigned_driver_id : (hasOwn(body, 'driver_id') ? body.driver_id : undefined),
  assigned_vehicle_id: hasOwn(body, 'assigned_vehicle_id') ? body.assigned_vehicle_id : (hasOwn(body, 'vehicle_id') ? body.vehicle_id : undefined),
  assigned_room_id: hasOwn(body, 'assigned_room_id') ? body.assigned_room_id : (hasOwn(body, 'room_id') ? body.room_id : undefined),
  assigned_package_id: hasOwn(body, 'assigned_package_id') ? body.assigned_package_id : (hasOwn(body, 'package_id') ? body.package_id : undefined),
  assigned_hotel_option: hasOwn(body, 'assigned_hotel_option') ? body.assigned_hotel_option : (hasOwn(body, 'hotel_option') ? body.hotel_option : undefined),
  assigned_owner_id: hasOwn(body, 'assigned_owner_id') ? body.assigned_owner_id : undefined,
  quote_amount: hasOwn(body, 'quote_amount') ? body.quote_amount : (hasOwn(body, 'amount') ? body.amount : undefined),
  last_contacted_at: hasOwn(body, 'last_contacted_at') ? (body.last_contacted_at || null) : undefined,
  follow_up_at: hasOwn(body, 'follow_up_at') ? (body.follow_up_at || null) : undefined,
  service_details_json: hasOwn(body, 'service_details_json') ? body.service_details_json : (hasOwn(body, 'enquiry_details') ? body.enquiry_details : undefined),
  requirement_notes: hasOwn(body, 'requirement_notes') ? body.requirement_notes : (hasOwn(body, 'details') ? body.details : undefined),
});

const serializeEnquiry = (row) => ({
  id: row.id,
  reference_id: row.reference_id,
  enquiry_type: row.enquiry_type,
  service_type: row.enquiry_type,
  customer_name: row.customer_name,
  customer: row.customer_name,
  phone_number: row.phone_number,
  phone: row.phone_number,
  whatsapp_number: row.whatsapp_number,
  email: row.email,
  preferred_contact_method: row.preferred_contact_method,
  source_page: row.source_page,
  status: row.status,
  priority: row.priority,
  travel_date: row.travel_date,
  travel_time: row.travel_time,
  service_details_json: row.service_details_json,
  enquiry_details: row.service_details_json,
  admin_notes: row.admin_notes,
  consent_to_contact: row.consent_to_contact,
  requirement_notes: row.requirement_notes,
  details: row.requirement_notes,
  assigned_driver_id: row.assigned_driver_id,
  driver_id: row.assigned_driver_id,
  assigned_driver_name: row.assigned_driver_name,
  driver_name: row.assigned_driver_name,
  assigned_vehicle_id: row.assigned_vehicle_id,
  assigned_room_id: row.assigned_room_id,
  assigned_package_id: row.assigned_package_id,
  assigned_hotel_option: row.assigned_hotel_option,
  assigned_owner_id: row.assigned_owner_id,
  quote_amount: row.quote_amount,
  amount: row.quote_amount || 'TBD',
  submitted_at: row.submitted_at,
  created_at: row.submitted_at,
  updated_at: row.updated_at,
  last_contacted_at: row.last_contacted_at,
  follow_up_at: row.follow_up_at,
  is_archived: row.is_archived,
  archived_at: row.archived_at,
  archived_reason: row.archived_reason,
  notification_status: row.notification_status,
  notification_error: row.notification_error,
  admin_whatsapp_notification_status: row.admin_whatsapp_notification_status,
  customer_whatsapp_notification_status: row.customer_whatsapp_notification_status,
  whatsapp_error_message: row.whatsapp_error_message,
  notification_sent_at: row.notification_sent_at,
  service: `${String(row.enquiry_type || 'general').toUpperCase()} Enquiry`,
  schedule: [row.travel_date, row.travel_time].filter(Boolean).join(' '),
  audit_trail: Array.isArray(row.audit_trail) ? row.audit_trail : undefined,
});

const serializeAuditEntry = (row = {}) => ({
  id: row.id,
  enquiry_id: row.enquiry_id,
  admin_id: row.admin_id,
  admin_role: row.admin_role,
  action_type: row.action_type,
  field_name: row.field_name,
  previous_value: row.previous_value,
  next_value: row.next_value,
  metadata_json: row.metadata_json || {},
  created_at: row.created_at,
});

const createAuditLogger = (req) => async ({
  enquiryId,
  actionType,
  fieldName = null,
  previousValue = null,
  nextValue = null,
  metadata = {},
}) => Booking.addAuditLog({
  enquiryId,
  adminId: req.admin?.id || null,
  adminRole: req.admin?.role || 'admin',
  actionType,
  fieldName,
  previousValue,
  nextValue,
  metadata,
});

const queueWhatsAppNotifications = (enquiry) => {
  setImmediate(async () => {
    const nextTracking = {};
    const errorMessages = [];

    try {
      const adminResult = await sendAdminNotification(enquiry);
      nextTracking.admin_whatsapp_notification_status = adminResult.status;

      if (adminResult.success) {
        nextTracking.notification_sent_at = new Date().toISOString();
      } else if (adminResult.error) {
        errorMessages.push(`admin: ${adminResult.error}`);
      }

      const customerResult = await sendCustomerAcknowledgement(enquiry);
      nextTracking.customer_whatsapp_notification_status = customerResult.status;

      if (!nextTracking.notification_sent_at && customerResult.success) {
        nextTracking.notification_sent_at = new Date().toISOString();
      } else if (customerResult.error) {
        errorMessages.push(`customer: ${customerResult.error}`);
      }

      if (adminResult.success || customerResult.success) {
        nextTracking.notification_status = 'sent';
        nextTracking.notification_error = null;
      } else if (errorMessages.length) {
        nextTracking.notification_status = 'failed';
        nextTracking.notification_error = errorMessages.join(' | ');
      } else {
        nextTracking.notification_status = 'not_enabled';
        nextTracking.notification_error = null;
      }

      nextTracking.whatsapp_error_message = errorMessages.length ? errorMessages.join(' | ') : null;
      await Booking.updateWhatsAppTracking(enquiry.id, nextTracking);
    } catch (error) {
      console.error('Async WhatsApp notification failure:', error.message);
      try {
        await Booking.updateWhatsAppTracking(enquiry.id, {
          admin_whatsapp_notification_status: 'failed',
          notification_status: 'failed',
          notification_error: error.message,
          whatsapp_error_message: error.message,
        });
      } catch (secondaryError) {
        console.error('Failed to persist notification failure:', secondaryError.message);
      }
    }
  });
};

const listEnquiries = async (req, res) => {
  try {
    const enquiries = await Booking.getAll({
      enquiry_type: req.query.enquiry_type,
      status: req.query.status,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      search: req.query.search,
      assigned_driver_id: req.query.assigned_driver,
      assigned_vehicle_id: req.query.assigned_vehicle,
      assigned_package_id: req.query.assigned_package,
      assigned_room_id: req.query.assigned_room,
      include_archived: parseBoolean(req.query.include_archived),
    });

    res.status(200).json({ success: true, data: enquiries.map(serializeEnquiry) });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Booking.getById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const auditTrail = await Booking.getAuditTrail(req.params.id);

    res.status(200).json({
      success: true,
      data: serializeEnquiry({
        ...enquiry,
        audit_trail: auditTrail.map(serializeAuditEntry),
      }),
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitEnquiry = async (req, res) => {
  try {
    const enquiry = await Booking.create(buildPublicCreatePayload(req.body));
    const responseData = serializeEnquiry(enquiry);

    res.status(201).json({ success: true, data: responseData });
    queueWhatsAppNotifications(responseData);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.',
    });
  }
};

const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const current = await Booking.getById(id);

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid enquiry status' });
    }

    const result = await Booking.updateStatus(id, status);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'status_changed',
      fieldName: 'status',
      previousValue: current.status,
      nextValue: status,
    });

    res.status(200).json({ success: true, message: 'Enquiry status updated' });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateEnquiryNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const current = await Booking.getById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    const result = await Booking.updateNotes(id, admin_notes || '');

    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'notes_updated',
      fieldName: 'admin_notes',
      previousValue: current.admin_notes,
      nextValue: admin_notes || '',
    });

    res.status(200).json({ success: true, message: 'Admin notes updated' });
  } catch (error) {
    console.error('Error updating admin notes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;
    const current = await Booking.getById(id);

    if (!driver_id) {
      return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const result = await Booking.assignDriver(id, driver_id);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'assignment_updated',
      fieldName: 'assigned_driver_id',
      previousValue: current.assigned_driver_id,
      nextValue: driver_id,
    });

    res.status(200).json({ success: true, message: 'Driver assigned successfully' });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const assignVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id } = req.body;
    const current = await Booking.getById(id);

    if (!vehicle_id) {
      return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
    }

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const result = await Booking.assignVehicle(id, vehicle_id);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'assignment_updated',
      fieldName: 'assigned_vehicle_id',
      previousValue: current.assigned_vehicle_id,
      nextValue: vehicle_id,
    });

    res.status(200).json({ success: true, message: 'Vehicle assigned successfully' });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const assignRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id, hotel_option } = req.body;
    const current = await Booking.getById(id);

    if (!room_id && !hotel_option) {
      return res.status(400).json({ success: false, message: 'Room ID or hotel option is required' });
    }

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const result = await Booking.assignRoom(id, room_id || null, hotel_option || null);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'assignment_updated',
      fieldName: 'assigned_room_id',
      previousValue: current.assigned_room_id,
      nextValue: room_id || null,
      metadata: {
        previous_hotel_option: current.assigned_hotel_option,
        next_hotel_option: hotel_option || null,
      },
    });

    res.status(200).json({ success: true, message: 'Room or stay option assigned successfully' });
  } catch (error) {
    console.error('Error assigning room/stay:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const assignPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { package_id } = req.body;
    const current = await Booking.getById(id);

    if (!package_id) {
      return res.status(400).json({ success: false, message: 'Package ID is required' });
    }

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const result = await Booking.assignPackage(id, package_id);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'assignment_updated',
      fieldName: 'assigned_package_id',
      previousValue: current.assigned_package_id,
      nextValue: package_id,
    });

    res.status(200).json({ success: true, message: 'Package assigned successfully' });
  } catch (error) {
    console.error('Error assigning package:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quote_amount } = req.body;
    const current = await Booking.getById(id);

    if (!quote_amount) {
      return res.status(400).json({ success: false, message: 'Quote amount is required' });
    }

    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const result = await Booking.updateQuote(id, quote_amount);
    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'quote_updated',
      fieldName: 'quote_amount',
      previousValue: current.quote_amount,
      nextValue: quote_amount,
    });

    res.status(200).json({ success: true, message: 'Quote amount updated' });
  } catch (error) {
    console.error('Error updating quote amount:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const archiveEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { archived_reason } = req.body;
    const current = await Booking.getById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    const result = await Booking.archive(id, archived_reason || null);

    await createAuditLogger(req)({
      enquiryId: id,
      actionType: 'enquiry_archived',
      fieldName: 'is_archived',
      previousValue: current.is_archived,
      nextValue: true,
      metadata: { archived_reason: archived_reason || null },
    });

    res.status(200).json({ success: true, message: 'Enquiry archived successfully' });
  } catch (error) {
    console.error('Error archiving enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const current = await Booking.getById(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const nextPayload = normalizeUpdatePayload(req.body);
    const result = await Booking.updateEnquiry(req.params.id, nextPayload);

    await createAuditLogger(req)({
      enquiryId: req.params.id,
      actionType: 'enquiry_updated',
      metadata: {
        previous: {
          status: current.status,
          admin_notes: current.admin_notes,
          assigned_driver_id: current.assigned_driver_id,
          assigned_vehicle_id: current.assigned_vehicle_id,
          assigned_room_id: current.assigned_room_id,
          assigned_package_id: current.assigned_package_id,
          assigned_owner_id: current.assigned_owner_id,
          quote_amount: current.quote_amount,
        },
        next: nextPayload,
      },
    });

    res.status(200).json({ success: true, message: 'Enquiry updated successfully' });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const result = await Booking.archive(req.params.id, req.body?.archived_reason || 'Archived via legacy delete route');

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.status(200).json({ success: true, message: 'Enquiry archived successfully' });
  } catch (error) {
    console.error('Error archiving enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  VALID_STATUSES,
  listEnquiries,
  getEnquiryById,
  submitEnquiry,
  updateEnquiryStatus,
  updateEnquiryNotes,
  assignDriver,
  assignVehicle,
  assignRoom,
  assignPackage,
  updateQuote,
  archiveEnquiry,
  updateEnquiry,
  deleteEnquiry,
  serializeEnquiry,
  normalizeUpdatePayload,
  normalizeEnquiryType,
  getBookings: listEnquiries,
  createBooking: submitEnquiry,
  updateBookingStatus: updateEnquiryStatus,
  updateBookingEnquiry: updateEnquiry,
  deleteBooking: deleteEnquiry,
};
