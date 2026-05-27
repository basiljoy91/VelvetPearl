const Booking = require('../models/bookingModel');
const { sendAdminNotification } = require('../services/whatsappService');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const { customer, phone, service, details, schedule } = req.body;
    
    if (!customer || !service) {
      return res.status(400).json({ success: false, message: 'Customer name and service are required' });
    }

    // Generate unique ID
    const id = `VP-${Math.floor(Math.random() * 9000) + 1000}`;
    const bookingData = { id, customer, phone, service, details, schedule };

    await Booking.create(bookingData);
    
    // Fire and forget WhatsApp notification (non-blocking)
    sendAdminNotification(bookingData);
    
    res.status(201).json({ success: true, data: bookingData });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Booking.updateStatus(id, status);
    res.status(200).json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.delete(id);
    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Assign driver to a booking
// @route   PUT /api/bookings/:id/assign-driver
// @access  Private (Admin only)
const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id, driver_name } = req.body;

    if (!driver_id || !driver_name) {
      return res.status(400).json({ success: false, message: 'Driver ID and Name are required' });
    }

    await Booking.assignDriver(id, driver_id, driver_name);
    res.status(200).json({ success: true, message: 'Driver assigned successfully' });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  assignDriver
};
