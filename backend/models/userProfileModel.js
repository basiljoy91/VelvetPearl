const db = require('../config/db');

const getUserStats = async () => {
  const result = await db.query(`
    SELECT
      COUNT(DISTINCT phone_number) as total_users,
      SUM(CASE WHEN enquiry_type IN ('cab', 'room', 'tour', 'custom') THEN 1 ELSE 0 END) as total_bookings,
      SUM(CASE WHEN enquiry_type = 'cab' THEN 1 ELSE 0 END) as cab_bookings,
      SUM(CASE WHEN enquiry_type = 'room' THEN 1 ELSE 0 END) as room_bookings,
      SUM(CASE WHEN enquiry_type = 'tour' THEN 1 ELSE 0 END) as tour_bookings,
      SUM(CASE WHEN enquiry_type = 'custom' THEN 1 ELSE 0 END) as event_bookings
    FROM public.enquiries
    WHERE is_archived = false
  `);
  
  return result.rows[0] || {
    total_users: 0,
    total_bookings: 0,
    cab_bookings: 0,
    room_bookings: 0,
    tour_bookings: 0,
    event_bookings: 0
  };
};

const getAllUsers = async () => {
  const result = await db.query(`
    SELECT 
      MAX(customer_name) as customer_name,
      phone_number,
      MAX(email) as email,
      SUM(CASE WHEN enquiry_type IN ('cab', 'room', 'tour', 'custom') THEN 1 ELSE 0 END) as total_bookings,
      SUM(CASE WHEN enquiry_type = 'cab' THEN 1 ELSE 0 END) as cab_bookings,
      SUM(CASE WHEN enquiry_type = 'room' THEN 1 ELSE 0 END) as room_bookings,
      SUM(CASE WHEN enquiry_type = 'tour' THEN 1 ELSE 0 END) as tour_bookings,
      SUM(CASE WHEN enquiry_type = 'custom' THEN 1 ELSE 0 END) as event_bookings,
      MIN(submitted_at) as registration_date,
      MAX(submitted_at) as last_booking_date
    FROM public.enquiries
    WHERE is_archived = false
    GROUP BY phone_number
    ORDER BY total_bookings DESC
  `);
  return result.rows;
};

const getUserProfile = async (phoneNumber) => {
  const result = await db.query(`
    SELECT 
      MAX(customer_name) as customer_name,
      phone_number,
      MAX(email) as email,
      SUM(CASE WHEN enquiry_type IN ('cab', 'room', 'tour', 'custom') THEN 1 ELSE 0 END) as total_bookings,
      SUM(CASE WHEN enquiry_type = 'cab' THEN 1 ELSE 0 END) as cab_bookings,
      SUM(CASE WHEN enquiry_type = 'room' THEN 1 ELSE 0 END) as room_bookings,
      SUM(CASE WHEN enquiry_type = 'tour' THEN 1 ELSE 0 END) as tour_bookings,
      SUM(CASE WHEN enquiry_type = 'custom' THEN 1 ELSE 0 END) as event_bookings,
      MIN(submitted_at) as registration_date,
      MAX(submitted_at) as last_interaction_date
    FROM public.enquiries
    WHERE phone_number = $1 AND is_archived = false
    GROUP BY phone_number
  `, [phoneNumber]);
  return result.rows[0];
};

const getUserBookings = async (phoneNumber, type) => {
  const normType = type === 'event' ? 'custom' : type;
  const result = await db.query(`
    SELECT *
    FROM public.enquiries
    WHERE phone_number = $1 AND enquiry_type = $2 AND is_archived = false
    ORDER BY submitted_at DESC
  `, [phoneNumber, normType]);
  return result.rows;
};

module.exports = {
  getUserStats,
  getAllUsers,
  getUserProfile,
  getUserBookings
};
