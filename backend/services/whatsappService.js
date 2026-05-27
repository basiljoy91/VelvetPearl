/**
 * Twilio WhatsApp Notification Service
 * 
 * Production-ready implementation for sending WhatsApp notifications via Twilio.
 * Ensure all required environment variables are set before use.
 */

// Required ENV Variables:
// TWILIO_ACCOUNT_SID
// TWILIO_AUTH_TOKEN
// TWILIO_WHATSAPP_NUMBER (Format: +14155238886)
// ADMIN_WHATSAPP_NUMBER (Format: +919876543210 - must include country code)

const sendAdminNotification = async (bookingData) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !twilioNumber || !adminNumber) {
      console.error('[WHATSAPP CRITICAL ERROR] Missing required Twilio environment variables. Notification aborted.');
      return { success: false, error: 'Missing Credentials' };
    }

    // 1. Format the message content
    // Note: bookingData.service typically contains "Cab: Pickup -> Dropoff" or similar
    const messageBody = `🚨 *New Booking Received* 🚨
    
*Customer Name:* ${bookingData.customer || 'N/A'}
*Phone Number:* ${bookingData.phone || 'N/A'}
*Booking ID:* ${bookingData.id || 'N/A'}
*Service/Vehicle:* ${bookingData.details || bookingData.service || 'N/A'}
*Travel Date:* ${bookingData.schedule || 'N/A'}
*Payment Status:* Pending

_Please check the Admin Dashboard for full details._`;

    // 2. Extract strictly 10-15 digits from adminNumber to build foolproof "To" number
    const adminDigitsOnly = adminNumber.replace(/\D/g, '');
    const toFormatted = `whatsapp:+${adminDigitsOnly}`;

    // 3. Initialize Twilio client using official sample method
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    // 4. Send message using free-form text (Requires active 24h Sandbox session)
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: messageBody,
      to: toFormatted
    });

    console.log(`[WHATSAPP API SUCCESS] Booking notification delivered to admin for ${bookingData.id} via Twilio. SID: ${message.sid}`);
    return { success: true, sid: message.sid };

  } catch (error) {
    // Catch-all to prevent API failures from breaking the booking flow
    console.error(`[WHATSAPP DELIVERY FAILURE] Twilio API Error:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendSupportNotification = async (contactData) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !twilioNumber || !adminNumber) {
      console.error('[WHATSAPP CRITICAL ERROR] Missing required Twilio environment variables. Notification aborted.');
      return { success: false, error: 'Missing Credentials' };
    }

    const messageBody = `📞 *New Contact Support Request* 📞
    
*Name:* ${contactData.name || 'N/A'}
*Email:* ${contactData.email || 'N/A'}
*Phone:* ${contactData.phone || 'N/A'}

*Message:*
${contactData.message || 'N/A'}`;

    const adminDigitsOnly = adminNumber.replace(/\D/g, '');
    const toFormatted = `whatsapp:+${adminDigitsOnly}`;

    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: messageBody,
      to: toFormatted
    });

    console.log(`[WHATSAPP API SUCCESS] Support notification delivered to admin. SID: ${message.sid}`);
    return { success: true, sid: message.sid };

  } catch (error) {
    console.error(`[WHATSAPP DELIVERY FAILURE] Twilio API Error (Support):`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAdminNotification,
  sendSupportNotification
};
