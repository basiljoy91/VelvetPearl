const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Today's Bookings
    const { rows: todayBookingsRes } = await db.query(
      `SELECT COUNT(*)::int AS count FROM bookings WHERE DATE(created_at) = CURRENT_DATE`
    );
    const todayBookings = todayBookingsRes[0].count;

    // 2. Active Drivers
    const { rows: activeDriversRes } = await db.query(
      `SELECT COUNT(*)::int AS count FROM drivers WHERE status = 'Active'`
    );
    const activeDrivers = activeDriversRes[0].count;

    // 3. Utilization
    const { rows: activeVehiclesRes } = await db.query(
      `SELECT COUNT(*)::int AS count FROM fleet WHERE status = 'On Trip'`
    );
    const { rows: totalVehiclesRes } = await db.query(
      `SELECT COUNT(*)::int AS count FROM fleet`
    );
    const activeVehicles = activeVehiclesRes[0].count;
    const totalVehicles = totalVehiclesRes[0].count;
    let utilization = 0;
    if (totalVehicles > 0) {
      utilization = (activeVehicles / totalVehicles) * 100;
    }

    // 4. Pending Payments
    const { rows: pendingPaymentsRes } = await db.query(
      `SELECT amount FROM bookings WHERE status = 'Pending' AND amount != 'TBD'`
    );

    let pendingPayments = 0;
    pendingPaymentsRes.forEach(row => {
      // Try to extract numeric value from amount string (e.g., '₹14k', '14000', '150.50')
      let numStr = row.amount.replace(/[^0-9.-]+/g, "");
      let num = parseFloat(numStr);
      if (!isNaN(num)) {
        pendingPayments += num;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        todayBookings,
        activeDrivers,
        utilization,
        pendingPayments
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};
