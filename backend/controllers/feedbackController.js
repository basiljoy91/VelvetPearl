const feedbackModel = require('../models/feedbackModel');

exports.submitFeedback = async (req, res) => {
  try {
    const { name, feedback, rating } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!feedback || typeof feedback !== 'string' || feedback.trim() === '') {
      return res.status(400).json({ success: false, error: 'Feedback is required' });
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Valid rating between 1 and 5 is required' });
    }

    const savedFeedback = await feedbackModel.createFeedback({
      name: name.trim(),
      feedback: feedback.trim(),
      rating
    });

    res.status(201).json({ success: true, data: savedFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: 'Server error while submitting feedback' });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedbackModel.getAllFeedbacks();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching feedbacks' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await feedbackModel.getFeedbackStats();
    res.status(200).json({
      success: true,
      data: {
        totalReviews: parseInt(stats.totalReviews) || 0,
        totalAccepted: parseInt(stats.totalAccepted) || 0,
        totalRejected: parseInt(stats.totalRejected) || 0,
        overallRating: parseFloat(stats.overallRating) || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching feedback stats' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const updatedFeedback = await feedbackModel.updateFeedbackStatus(id, status);
    if (!updatedFeedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    res.status(200).json({ success: true, data: updatedFeedback });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, error: 'Server error while updating feedback' });
  }
};


exports.getAccepted = async (req, res) => {
  try {
    const feedbacks = await feedbackModel.getAcceptedFeedbacks();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Error fetching accepted feedbacks:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching accepted feedbacks' });
  }
};

