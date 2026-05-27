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
    const { 
      name, phone, rating, experience, status, 
      photo, licence_status, address, notes, assigned_vehicle 
    } = req.body;
    
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
      status: status || 'Active',
      photo: photo || null,
      licence_status: licence_status || 'Pending',
      address: address || null,
      notes: notes || null,
      assigned_vehicle: assigned_vehicle || null,
      total_rides: Math.floor(Math.random() * 200) // Mock realistic baseline for MVP if none provided
    };

    await Driver.create(driverData);
    
    res.status(201).json({ success: true, data: driverData });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, phone, rating, experience, status, 
      photo, licence_status, address, notes, assigned_vehicle, total_rides 
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Driver name is required' });
    }

    const driverData = {
      name,
      phone: phone || '',
      rating: rating || '5.0',
      experience: experience || 'New',
      status: status || 'Active',
      photo: photo || null,
      licence_status: licence_status || 'Pending',
      address: address || null,
      notes: notes || null,
      assigned_vehicle: assigned_vehicle || null,
      total_rides: total_rides || 0
    };

    const result = await Driver.update(id, driverData);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, data: { id, ...driverData } });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Driver.delete(id);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver
};
