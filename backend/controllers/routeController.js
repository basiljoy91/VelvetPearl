const Location = require('../models/locationModel');
const RouteModel = require('../models/routeModel');
const { estimateRoute: estimateRouteWithProvider } = require('../services/routeProviderService');

const normalizeRouteLocation = (value = {}) => ({
  id: value.id || null,
  label: value.label || value.name || value.address || '',
  address: value.address || value.label || '',
  provider: value.provider || 'manual',
  provider_place_id: value.provider_place_id || value.id || '',
  latitude: value.latitude ?? value.lat,
  longitude: value.longitude ?? value.lng ?? value.lon,
  city: value.city || '',
  state: value.state || '',
  country: value.country || '',
  postal_code: value.postal_code || '',
  raw_response_json: value.raw_response_json || value.raw || null,
});

const requireLocation = (value, fieldName) => {
  const location = normalizeRouteLocation(value);
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);

  if (!location.label || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    const error = new Error(`${fieldName} must include label, latitude, and longitude.`);
    error.status = 400;
    error.expose = true;
    throw error;
  }

  return {
    ...location,
    latitude: lat,
    longitude: lng,
  };
};

const estimateRoute = async (req, res, next) => {
  try {
    const pickupInput = requireLocation(req.body?.pickup || req.body?.pickup_location, 'Pickup location');
    const dropInput = requireLocation(req.body?.drop || req.body?.drop_location, 'Drop location');

    const pickupLocation = await Location.upsert(pickupInput);
    const dropLocation = await Location.upsert(dropInput);
    const providerEstimate = await estimateRouteWithProvider(pickupLocation || pickupInput, dropLocation || dropInput);
    const savedEstimate = await RouteModel.createEstimate({
      pickupLocationId: pickupLocation?.id || null,
      dropLocationId: dropLocation?.id || null,
      pickupSnapshot: pickupLocation || pickupInput,
      dropSnapshot: dropLocation || dropInput,
      distanceKm: providerEstimate.distanceKm,
      durationMinutes: providerEstimate.durationMinutes,
      routePolyline: providerEstimate.routePolyline,
      geometry: providerEstimate.geometry,
      provider: providerEstimate.provider,
      rawResponse: providerEstimate.rawResponse,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...savedEstimate,
        pickup_location: pickupLocation || pickupInput,
        drop_location: dropLocation || dropInput,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const listPopularRoutes = async (req, res, next) => {
  try {
    const routes = await RouteModel.listPopular({ includeInactive: req.query.include_inactive === 'true' });
    return res.status(200).json({ success: true, data: routes });
  } catch (error) {
    return next(error);
  }
};

const createPopularRoute = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.pickup_location) {
      const pickupLocation = await Location.upsert(requireLocation(payload.pickup_location, 'Pickup location'));
      payload.pickup_location_id = pickupLocation?.id || null;
      payload.pickup_location = pickupLocation || payload.pickup_location;
    }

    if (payload.drop_location) {
      const dropLocation = await Location.upsert(requireLocation(payload.drop_location, 'Drop location'));
      payload.drop_location_id = dropLocation?.id || null;
      payload.drop_location = dropLocation || payload.drop_location;
    }

    const route = await RouteModel.createPopular(payload);
    return res.status(201).json({ success: true, data: route });
  } catch (error) {
    return next(error);
  }
};

const updatePopularRoute = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.pickup_location) {
      const pickupLocation = await Location.upsert(requireLocation(payload.pickup_location, 'Pickup location'));
      payload.pickup_location_id = pickupLocation?.id || null;
      payload.pickup_location = pickupLocation || payload.pickup_location;
    }

    if (payload.drop_location) {
      const dropLocation = await Location.upsert(requireLocation(payload.drop_location, 'Drop location'));
      payload.drop_location_id = dropLocation?.id || null;
      payload.drop_location = dropLocation || payload.drop_location;
    }

    const result = await RouteModel.updatePopular(req.params.id, payload);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Popular route not found or no changes were provided.' });
    }

    const routes = await RouteModel.listPopular({ includeInactive: true });
    const route = routes.find((item) => String(item.id) === String(req.params.id));
    return res.status(200).json({ success: true, data: route || null });
  } catch (error) {
    return next(error);
  }
};

const deletePopularRoute = async (req, res, next) => {
  try {
    const result = await RouteModel.deletePopular(req.params.id);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Popular route not found.' });
    }

    return res.status(200).json({ success: true, message: 'Popular route deleted.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  estimateRoute,
  listPopularRoutes,
  createPopularRoute,
  updatePopularRoute,
  deletePopularRoute,
};
