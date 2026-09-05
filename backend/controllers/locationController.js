const { searchLocations } = require('../services/locationProviderService');

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

module.exports = {
  search,
};
