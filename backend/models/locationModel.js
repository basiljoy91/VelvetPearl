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

const serializeLocation = (row = {}) => ({
  id: row.id,
  label: row.label,
  address: row.address,
  provider: row.provider,
  provider_place_id: row.provider_place_id,
  latitude: toNumberOrNull(row.latitude),
  longitude: toNumberOrNull(row.longitude),
  city: row.city,
  state: row.state,
  country: row.country,
  postal_code: row.postal_code,
  raw_response_json: parseJson(row.raw_response_json, null),
});

const normalizeLocationPayload = (location = {}) => ({
  label: String(location.label || location.name || location.address || '').trim().slice(0, 255),
  address: String(location.address || location.label || '').trim().slice(0, 600) || null,
  provider: String(location.provider || 'manual').trim().slice(0, 80),
  provider_place_id: String(location.provider_place_id || location.id || '').trim().slice(0, 255) || null,
  latitude: toNumberOrNull(location.latitude ?? location.lat),
  longitude: toNumberOrNull(location.longitude ?? location.lng ?? location.lon),
  city: String(location.city || '').trim().slice(0, 120) || null,
  state: String(location.state || '').trim().slice(0, 120) || null,
  country: String(location.country || '').trim().slice(0, 120) || null,
  postal_code: String(location.postal_code || location.postcode || '').trim().slice(0, 30) || null,
  raw_response_json: location.raw_response_json || location.raw || null,
});

const Location = {
  serialize: serializeLocation,

  search: async (query, limit = 8) => {
    const normalized = `%${String(query || '').trim().toLowerCase()}%`;
    const { rows } = await db.query(
      `
        SELECT *
        FROM locations
        WHERE LOWER(label) LIKE ?
          OR LOWER(COALESCE(address, '')) LIKE ?
          OR LOWER(COALESCE(city, '')) LIKE ?
        ORDER BY
          CASE WHEN LOWER(label) = LOWER(?) THEN 0 ELSE 1 END,
          label ASC
        LIMIT ?
      `,
      [normalized, normalized, normalized, String(query || '').trim(), Number(limit)]
    );

    return rows.map(serializeLocation);
  },

  upsert: async (location) => {
    const payload = normalizeLocationPayload(location);

    if (!payload.label || payload.latitude === null || payload.longitude === null) {
      return null;
    }

    if (!payload.provider_place_id) {
      payload.provider_place_id = `${payload.provider}:${payload.latitude.toFixed(6)},${payload.longitude.toFixed(6)}`;
    }

    await db.query(
      `
        INSERT INTO locations (
          label,
          address,
          provider,
          provider_place_id,
          latitude,
          longitude,
          city,
          state,
          country,
          postal_code,
          raw_response_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          label = VALUES(label),
          address = VALUES(address),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          city = VALUES(city),
          state = VALUES(state),
          country = VALUES(country),
          postal_code = VALUES(postal_code),
          raw_response_json = VALUES(raw_response_json)
      `,
      [
        payload.label,
        payload.address,
        payload.provider,
        payload.provider_place_id,
        payload.latitude,
        payload.longitude,
        payload.city,
        payload.state,
        payload.country,
        payload.postal_code,
        payload.raw_response_json,
      ]
    );

    const { rows } = await db.query(
      'SELECT * FROM locations WHERE provider = ? AND provider_place_id = ? LIMIT 1',
      [payload.provider, payload.provider_place_id]
    );

    return rows[0] ? serializeLocation(rows[0]) : null;
  },
};

module.exports = Location;
