const db = require('../config/db');

exports.createFeedback = async (feedbackData) => {
  const { name, feedback, rating } = feedbackData;
  const result = await db.query(
    `INSERT INTO feedbacks (name, feedback, rating, status) 
     VALUES ($1, $2, $3, 'pending') 
     RETURNING *`,
    [name, feedback, rating]
  );
  return result.rows[0];
};

exports.getAllFeedbacks = async () => {
  const result = await db.query('SELECT * FROM feedbacks ORDER BY created_at DESC');
  return result.rows;
};

exports.updateFeedbackStatus = async (id, status) => {
  const result = await db.query(
    'UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

exports.getFeedbackStats = async () => {
  const result = await db.query(` 
    SELECT 
      COUNT(*) as "totalReviews",
      COUNT(*) FILTER (WHERE status = 'accepted') as "totalAccepted",
      COUNT(*) FILTER (WHERE status = 'rejected') as "totalRejected",
      COALESCE(AVG(rating), 0) as "overallRating"
    FROM feedbacks
  `);
  return result.rows[0];
};


exports.getAcceptedFeedbacks = async () => {
  const result = await db.query("SELECT * FROM feedbacks WHERE status = 'accepted' ORDER BY created_at DESC");
  return result.rows;
};

