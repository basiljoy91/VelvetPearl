const Driver = require('../models/driverModel');

const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.getAll();
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createDriver = async (req, res) => {
  try {
    const { name, phone, rating, experience, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Driver name is required' });
    }

    const id = `DR-${Math.floor(Math.random() * 900) + 100}`;
    const driverData = {
      id,
      name,
      phone: phone || '',
      rating: rating || '5.0',
      experience: experience || 'New',
      status: status || 'Active'
    };

    await Driver.create(driverData);
    
    res.status(201).json({ success: true, data: driverData });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDrivers,
  createDriver
};
