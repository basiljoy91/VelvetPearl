const toCoordinate = (location = {}) => ({
  latitude: Number(location.latitude ?? location.lat),
  longitude: Number(location.longitude ?? location.lng ?? location.lon),
});

const hasCoordinates = (location) => {
  const coordinate = toCoordinate(location);
  return Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude);
};

const haversineKm = (from, to) => {
  const radiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLat = (from.latitude * Math.PI) / 180;
  const toLat = (to.latitude * Math.PI) / 180;

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
};

const getFallbackEstimate = (pickup, drop) => {
  const from = toCoordinate(pickup);
  const to = toCoordinate(drop);
  const straightLineKm = haversineKm(from, to);
  const roadDistanceKm = Math.max(straightLineKm * 1.24, straightLineKm);
  const averageSpeedKmh = roadDistanceKm > 120 ? 58 : 42;
  const durationMinutes = Math.max(10, Math.round((roadDistanceKm / averageSpeedKmh) * 60));

  return {
    distanceKm: Number(roadDistanceKm.toFixed(2)),
    durationMinutes,
    routePolyline: null,
    geometry: {
      type: 'LineString',
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
      ],
    },
    provider: 'fallback',
    rawResponse: {
      note: 'Fallback estimate based on straight-line distance. Configure a route provider for road-network distance.',
    },
  };
};

const estimateMapbox = async (pickup, drop) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const from = toCoordinate(pickup);
  const to = toCoordinate(drop);
  const endpoint = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}`);
  endpoint.searchParams.set('access_token', token);
  endpoint.searchParams.set('geometries', 'geojson');
  endpoint.searchParams.set('overview', 'full');

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Mapbox directions failed with ${response.status}`);
  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) return null;

  return {
    distanceKm: Number((Number(route.distance || 0) / 1000).toFixed(2)),
    durationMinutes: Math.round(Number(route.duration || 0) / 60),
    routePolyline: null,
    geometry: route.geometry,
    provider: 'mapbox',
    rawResponse: data,
  };
};

const estimateOpenRouteService = async (pickup, drop) => {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) return null;

  const from = toCoordinate(pickup);
  const to = toCoordinate(drop);
  const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    method: 'POST',
    headers: {
      Authorization: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenRouteService directions failed with ${response.status}`);
  const data = await response.json();
  const feature = data.features?.[0];
  const summary = feature?.properties?.summary;
  if (!summary) return null;

  return {
    distanceKm: Number((Number(summary.distance || 0) / 1000).toFixed(2)),
    durationMinutes: Math.round(Number(summary.duration || 0) / 60),
    routePolyline: null,
    geometry: feature.geometry,
    provider: 'openrouteservice',
    rawResponse: data,
  };
};

const estimateGoogleRoutes = async (pickup, drop) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_ROUTES_API_KEY;
  if (!key) return null;

  const from = toCoordinate(pickup);
  const to = toCoordinate(drop);
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.latitude, longitude: from.longitude } } },
      destination: { location: { latLng: { latitude: to.latitude, longitude: to.longitude } } },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
    }),
  });

  if (!response.ok) throw new Error(`Google Routes failed with ${response.status}`);
  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) return null;

  return {
    distanceKm: Number((Number(route.distanceMeters || 0) / 1000).toFixed(2)),
    durationMinutes: Math.round(Number(String(route.duration || '0s').replace('s', '')) / 60),
    routePolyline: route.polyline?.encodedPolyline || null,
    geometry: null,
    provider: 'google',
    rawResponse: data,
  };
};

const estimateRoute = async (pickup, drop) => {
  if (!hasCoordinates(pickup) || !hasCoordinates(drop)) {
    const error = new Error('Both pickup and drop locations must include latitude and longitude.');
    error.status = 400;
    error.expose = true;
    throw error;
  }

  const provider = String(process.env.MAP_ROUTE_PROVIDER || process.env.MAP_PROVIDER || '').trim().toLowerCase();

  try {
    if (provider === 'mapbox') {
      return await estimateMapbox(pickup, drop) || getFallbackEstimate(pickup, drop);
    }
    if (provider === 'openrouteservice') {
      return await estimateOpenRouteService(pickup, drop) || getFallbackEstimate(pickup, drop);
    }
    if (provider === 'google') {
      return await estimateGoogleRoutes(pickup, drop) || getFallbackEstimate(pickup, drop);
    }
  } catch (error) {
    console.warn('Route provider failed; using fallback route estimate:', error.message);
  }

  return getFallbackEstimate(pickup, drop);
};

module.exports = {
  estimateRoute,
  getFallbackEstimate,
};
