const userProfileModel = require('../models/userProfileModel');

const getUserStats = async (req, res) => {
  try {
    const stats = await userProfileModel.getUserStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userProfileModel.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const profile = await userProfileModel.getUserProfile(phoneNumber);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const { phoneNumber, type } = req.params;
    const bookings = await userProfileModel.getUserBookings(phoneNumber, type);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getUserStats,
  getAllUsers,
  getUserProfile,
  getUserBookings
};
