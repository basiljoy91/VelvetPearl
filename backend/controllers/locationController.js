const { reverseGeocode, searchLocations } = require('../services/locationProviderService');

const search = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();

    if (query.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const results = await searchLocations(query);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return next(error);
  }
};

const reverse = async (req, res, next) => {
  try {
    const location = await reverseGeocode({
      latitude: req.query.lat,
      longitude: req.query.lng,
    });
    return res.status(200).json({ success: true, data: location });
  } catch (error) {
    if (error.message === 'Invalid map coordinates.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

module.exports = {
  search,
  reverse,
};
