const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Today's Enquiries
    const { rows: todayBookingsRes } = await db.query(
      `SELECT COUNT(*) AS count FROM enquiries WHERE DATE(submitted_at) = CURRENT_DATE`
    );
    const todayBookings = Number(todayBookingsRes[0]?.count || 0);

    // 2. Active Drivers
    const { rows: activeDriversRes } = await db.query(
      `SELECT COUNT(*) AS count FROM drivers WHERE status = 'Active'`
    );
    const activeDrivers = Number(activeDriversRes[0]?.count || 0);

    // 3. Utilization
    const { rows: activeVehiclesRes } = await db.query(
      `SELECT COUNT(*) AS count FROM fleet WHERE status = 'On Trip'`
    );
    const { rows: totalVehiclesRes } = await db.query(
      `SELECT COUNT(*) AS count FROM fleet`
    );
    const activeVehicles = Number(activeVehiclesRes[0]?.count || 0);
    const totalVehicles = Number(totalVehiclesRes[0]?.count || 0);
    let utilization = 0;
    if (totalVehicles > 0) {
      utilization = (activeVehicles / totalVehicles) * 100;
    }

    // 4. Pending Payments
    const { rows: pendingPaymentsRes } = await db.query(
      `SELECT quote_amount FROM enquiries WHERE status IN ('Quoted', 'Awaiting Customer', 'Confirmed') AND quote_amount IS NOT NULL AND quote_amount != ''`
    );

    let pendingPayments = 0;
    pendingPaymentsRes.forEach(row => {
      const numStr = String(row.quote_amount || '').replace(/[^0-9.-]+/g, "");
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
