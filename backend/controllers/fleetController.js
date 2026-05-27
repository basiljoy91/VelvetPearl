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
    const { 
      model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
      insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_doc 
    } = req.body;
    
    if (!model || !plate) {
      return res.status(400).json({ success: false, message: 'Vehicle model and plate are required' });
    }

    let computed_insurance_status = 'Unknown';
    if (insurance_expiry) {
      const expiryDate = new Date(insurance_expiry);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      if (expiryDate < today) {
        computed_insurance_status = 'Expired';
      } else if (expiryDate <= thirtyDaysFromNow) {
        computed_insurance_status = 'Expiring Soon';
      } else {
        computed_insurance_status = 'Valid';
      }
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
      notes: notes || null,
      insurance_provider: insurance_provider || null,
      insurance_policy: insurance_policy || null,
      insurance_start: insurance_start || null,
      insurance_expiry: insurance_expiry || null,
      insurance_status: computed_insurance_status,
      insurance_doc: insurance_doc || null
    };

    await Fleet.create(fleetData);
    
    res.status(201).json({ success: true, data: fleetData });
  } catch (error) {
    console.error('Error creating fleet vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateFleet = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
      insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_doc
    } = req.body;

    if (!model || !plate) {
      return res.status(400).json({ success: false, message: 'Vehicle model and plate are required' });
    }

    let computed_insurance_status = 'Unknown';
    if (insurance_expiry) {
      const expiryDate = new Date(insurance_expiry);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      if (expiryDate < today) {
        computed_insurance_status = 'Expired';
      } else if (expiryDate <= thirtyDaysFromNow) {
        computed_insurance_status = 'Expiring Soon';
      } else {
        computed_insurance_status = 'Valid';
      }
    } else if (req.body.insurance_status) {
      computed_insurance_status = req.body.insurance_status;
    }

    const fleetData = {
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
      notes: notes || null,
      insurance_provider: insurance_provider || null,
      insurance_policy: insurance_policy || null,
      insurance_start: insurance_start || null,
      insurance_expiry: insurance_expiry || null,
      insurance_status: computed_insurance_status,
      insurance_doc: insurance_doc || null
    };

    const result = await Fleet.update(id, fleetData);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, data: { id, ...fleetData } });
  } catch (error) {
    console.error('Error updating fleet vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteFleet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Fleet.delete(id);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting fleet vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getFleet,
  createFleet,
  updateFleet,
  deleteFleet
};
