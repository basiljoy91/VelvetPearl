const Feedback = require('../models/feedbackModel');

const serializeFeedback = (row = {}) => ({
  id: row.id,
  customer_name: row.customer_name,
  location: row.location,
  rating: Number(row.rating || 5),
  message: row.message,
  status: row.status,
  admin_notes: row.admin_notes,
  submitted_at: row.submitted_at,
  reviewed_at: row.reviewed_at,
  updated_at: row.updated_at,
});

const validateFeedbackPayload = (body = {}) => {
  const customerName = String(body.customer_name || body.name || '').trim();
  const message = String(body.message || '').trim();
  const location = String(body.location || '').trim();
  const rating = Number(body.rating || 5);

  if (customerName.length < 2) {
    return { error: 'Please enter your name.' };
  }

  if (message.length < 10) {
    return { error: 'Please enter feedback with at least 10 characters.' };
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: 'Please choose a rating from 1 to 5.' };
  }

  return {
    data: {
      customer_name: customerName.slice(0, 120),
      location: location.slice(0, 120),
      rating: Math.round(rating),
      message: message.slice(0, 700),
    },
  };
};

const submitFeedback = async (req, res) => {
  try {
    const { data, error } = validateFeedbackPayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const feedback = await Feedback.create(data);
    return res.status(201).json({ success: true, data: serializeFeedback(feedback) });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({ success: false, message: 'Sorry, we could not submit your feedback. Please try again.' });
  }
};

const listApprovedFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.getPublicApproved();
    return res.status(200).json({ success: true, data: feedback.map(serializeFeedback) });
  } catch (error) {
    console.error('Error fetching approved feedback:', error);
    return res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

const listAdminFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.getAll();
    return res.status(200).json({ success: true, data: feedback.map(serializeFeedback) });
  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    return res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

const reviewFeedback = async (req, res) => {
  try {
    const status = String(req.body.status || '').trim().toLowerCase();

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Feedback status must be accepted or rejected.' });
    }

    const feedback = await Feedback.updateStatus(req.params.id, status, req.body.admin_notes);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({ success: true, data: serializeFeedback(feedback) });
  } catch (error) {
    console.error('Error reviewing feedback:', error);
    return res.status(500).json({ success: false, message: 'Unable to review feedback.' });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.deleteById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    return res.status(200).json({ success: true, data: serializeFeedback(feedback) });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete feedback.' });
  }
};

module.exports = {
  submitFeedback,
  listApprovedFeedback,
  listAdminFeedback,
  reviewFeedback,
  deleteFeedback,
};
