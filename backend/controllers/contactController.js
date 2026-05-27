const { sendSupportNotification } = require('../services/whatsappService');

const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    // Try sending WhatsApp notification
    // We don't await/block the response entirely on success, but we can wait for it to finish
    // so we know if it succeeded, but we won't throw an error to the user if WhatsApp fails.
    // Actually, the requirements state: "Ensure WhatsApp failures do not break form submission flow"
    // Since we don't store contacts in DB right now based on requirements, 
    // the whatsapp notification IS the main action. 
    // Let's send it.
    const whatsappResult = await sendSupportNotification({ name, email, phone, message });

    // Even if WhatsApp fails, we return success to the user so they don't get a scary error,
    // or we can log it. 
    // "Ensure WhatsApp failures do not break form submission flow"
    // So we just return success true regardless.

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      whatsappSent: whatsappResult.success
    });

  } catch (error) {
    console.error('Contact Submission Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact form.' });
  }
};

module.exports = {
  submitContact
};
