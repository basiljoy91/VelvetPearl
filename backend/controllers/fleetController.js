const Fleet = require('../models/fleetModel');

const getFleet = async (req, res) => {
  try {
    const fleet = await Fleet.getAll();
    res.status(200).json({ success: true, data: fleet });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createFleet = async (req, res) => {
  try {
    const { model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes } = req.body;
    
    if (!model || !plate) {
      return res.status(400).json({ success: false, message: 'Vehicle model and plate are required' });
    }

    const id = `FL-${Math.floor(Math.random() * 900) + 100}`;
    const fleetData = {
      id,
      model,
      plate,
      type: type || 'Sedan',
      status: status || 'Available',
      lastService: lastService || new Date().toISOString().split('T')[0],
      photo: photo || null,
      age: (age !== undefined && age !== '') ? parseInt(age, 10) : 0,
      fuel_status: (fuel_status !== undefined && fuel_status !== '') ? parseInt(fuel_status, 10) : 100,
      next_service: next_service || null,
      condition: condition || 'Good',
      notes: notes || null
    };

    await Fleet.create(fleetData);
    
    res.status(201).json({ success: true, data: fleetData });
  } catch (error) {
    console.error('Error creating fleet vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getFleet,
  createFleet
};
