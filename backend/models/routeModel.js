const db = require('../config/db');

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const serializeEstimate = (row = {}) => ({
  id: row.id,
  pickup_location_id: row.pickup_location_id,
  drop_location_id: row.drop_location_id,
  pickup_snapshot: parseJson(row.pickup_snapshot_json, null),
  drop_snapshot: parseJson(row.drop_snapshot_json, null),
  distance_km: toNumberOrNull(row.distance_km) || 0,
  duration_minutes: Number(row.duration_minutes || 0),
  route_polyline: row.route_polyline || null,
  geometry: parseJson(row.geometry_json, null),
  provider: row.provider || 'fallback',
  raw_response_json: parseJson(row.raw_response_json, null),
  created_at: row.created_at,
});

const serializePopularRoute = (row = {}) => {
  const pickupSnapshot = parseJson(row.pickup_snapshot_json, null) || {
    id: row.pickup_location_id,
    label: row.pickup_label,
    address: row.pickup_address,
    latitude: toNumberOrNull(row.pickup_latitude),
    longitude: toNumberOrNull(row.pickup_longitude),
    city: row.pickup_city,
    state: row.pickup_state,
    country: row.pickup_country,
    provider: row.pickup_provider,
    provider_place_id: row.pickup_provider_place_id,
  };
  const dropSnapshot = parseJson(row.drop_snapshot_json, null) || {
    id: row.drop_location_id,
    label: row.drop_label,
    address: row.drop_address,
    latitude: toNumberOrNull(row.drop_latitude),
    longitude: toNumberOrNull(row.drop_longitude),
    city: row.drop_city,
    state: row.drop_state,
    country: row.drop_country,
    provider: row.drop_provider,
    provider_place_id: row.drop_provider_place_id,
  };

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    pickup_location_id: row.pickup_location_id,
    drop_location_id: row.drop_location_id,
    pickup_location: pickupSnapshot,
    drop_location: dropSnapshot,
    distance_km: toNumberOrNull(row.distance_km),
    duration_minutes: row.duration_minutes === null ? null : Number(row.duration_minutes || 0),
    vehicle_type: row.vehicle_type,
    pricing_note: row.pricing_note,
    route_estimate_id: row.route_estimate_id,
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 240);

const RouteModel = {
  serializeEstimate,
  serializePopularRoute,

  createEstimate: async ({
    pickupLocationId = null,
    dropLocationId = null,
    pickupSnapshot = null,
    dropSnapshot = null,
    distanceKm = 0,
    durationMinutes = 0,
    routePolyline = null,
    geometry = null,
    provider = 'fallback',
    rawResponse = null,
  }) => {
    const result = await db.query(
      `
        INSERT INTO route_estimates (
          pickup_location_id,
          drop_location_id,
          pickup_snapshot_json,
          drop_snapshot_json,
          distance_km,
          duration_minutes,
          route_polyline,
          geometry_json,
          provider,
          raw_response_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pickupLocationId,
        dropLocationId,
        pickupSnapshot,
        dropSnapshot,
        distanceKm,
        durationMinutes,
        routePolyline,
        geometry,
        provider,
        rawResponse,
      ]
    );

    const { rows } = await db.query('SELECT * FROM route_estimates WHERE id = ?', [result.insertId]);
    return rows[0] ? serializeEstimate(rows[0]) : null;
  },

  listPopular: async ({ includeInactive = false } = {}) => {
    const { rows } = await db.query(
      `
        SELECT
          r.*,
          p.label AS pickup_label,
          p.address AS pickup_address,
          p.provider AS pickup_provider,
          p.provider_place_id AS pickup_provider_place_id,
          p.latitude AS pickup_latitude,
          p.longitude AS pickup_longitude,
          p.city AS pickup_city,
          p.state AS pickup_state,
          p.country AS pickup_country,
          d.label AS drop_label,
          d.address AS drop_address,
          d.provider AS drop_provider,
          d.provider_place_id AS drop_provider_place_id,
          d.latitude AS drop_latitude,
          d.longitude AS drop_longitude,
          d.city AS drop_city,
          d.state AS drop_state,
          d.country AS drop_country
        FROM popular_routes r
        LEFT JOIN locations p ON p.id = r.pickup_location_id
        LEFT JOIN locations d ON d.id = r.drop_location_id
        ${includeInactive ? '' : 'WHERE r.is_active = 1'}
        ORDER BY r.sort_order ASC, r.title ASC
      `
    );

    return rows.map(serializePopularRoute);
  },

  createPopular: async (payload = {}) => {
    const title = String(payload.title || `${payload.pickup_label || 'Pickup'} to ${payload.drop_label || 'Drop'}`).trim();
    const slug = slugify(payload.slug || title);

    const result = await db.query(
      `
        INSERT INTO popular_routes (
          title,
          slug,
          pickup_location_id,
          drop_location_id,
          pickup_snapshot_json,
          drop_snapshot_json,
          distance_km,
          duration_minutes,
          vehicle_type,
          pricing_note,
          route_estimate_id,
          is_active,
          sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        payload.pickup_location_id || payload.pickup_location?.id || null,
        payload.drop_location_id || payload.drop_location?.id || null,
        payload.pickup_location || payload.pickup_snapshot_json || null,
        payload.drop_location || payload.drop_snapshot_json || null,
        payload.distance_km || null,
        payload.duration_minutes || null,
        payload.vehicle_type || null,
        payload.pricing_note || null,
        payload.route_estimate_id || null,
        payload.is_active === false ? 0 : 1,
        Number(payload.sort_order || 0),
      ]
    );

    const { rows } = await db.query('SELECT * FROM popular_routes WHERE id = ?', [result.insertId]);
    return rows[0] ? serializePopularRoute(rows[0]) : null;
  },

  updatePopular: async (id, payload = {}) => {
    const fields = [];
    const values = [];

    [
      ['title', payload.title],
      ['slug', payload.slug ? slugify(payload.slug) : undefined],
      ['pickup_location_id', payload.pickup_location_id ?? payload.pickup_location?.id],
      ['drop_location_id', payload.drop_location_id ?? payload.drop_location?.id],
      ['pickup_snapshot_json', payload.pickup_location],
      ['drop_snapshot_json', payload.drop_location],
      ['distance_km', payload.distance_km],
      ['duration_minutes', payload.duration_minutes],
      ['vehicle_type', payload.vehicle_type],
      ['pricing_note', payload.pricing_note],
      ['route_estimate_id', payload.route_estimate_id],
      ['is_active', payload.is_active === undefined ? undefined : (payload.is_active ? 1 : 0)],
      ['sort_order', payload.sort_order === undefined ? undefined : Number(payload.sort_order)],
    ].forEach(([column, value]) => {
      if (value === undefined) return;
      fields.push(`${column} = ?`);
      values.push(value === '' ? null : value);
    });

    if (!fields.length) {
      return { rowCount: 0 };
    }

    values.push(id);
    return db.query(
      `
        UPDATE popular_routes
        SET ${fields.join(', ')}
        WHERE id = ?
      `,
      values
    );
  },

  deletePopular: (id) => db.query('DELETE FROM popular_routes WHERE id = ?', [id]),
};

module.exports = RouteModel;
