const Feedback = require('../models/feedbackModel');

exports.listPublicFeedback = async (req, res) => {
  try {
    const rows = await Feedback.getPublic({ limit: req.query.limit });
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Public feedback list error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load feedback right now.' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const created = await Feedback.create(req.body);
    return res.status(201).json({
      success: true,
      data: {
        id: created.id,
        reference_id: created.reference_id,
        customer_name: created.customer_name,
        city: created.city,
        service_used: created.service_used,
        rating: created.rating,
        status: created.status,
        created_at: created.created_at,
      },
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({ success: false, message: 'Unable to submit feedback right now.' });
  }
};

exports.listAdminFeedback = async (req, res) => {
  try {
    const rows = await Feedback.getAll(req.query);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

exports.getAdminFeedbackById = async (req, res) => {
  try {
    const row = await Feedback.getById(req.params.id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({ success: true, data: row });
  } catch (error) {
    console.error('Admin feedback detail error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

exports.updateAdminFeedback = async (req, res) => {
  try {
    const updated = await Feedback.updateReview(req.params.id, req.body, req.admin?.id || null);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin feedback update error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update feedback.' });
  }
};
