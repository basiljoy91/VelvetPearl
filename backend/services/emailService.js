const nodemailer = require('nodemailer');

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

const createTransport = () => {
  if (!hasSmtpConfig()) {
    const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.');
    error.status = 503;
    error.expose = true;
    throw error;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendDocumentEmail = async ({
  to,
  subject,
  text,
  html,
  attachmentPath,
  attachmentName,
}) => {
  const recipient = String(to || '').trim();
  if (!recipient) {
    const error = new Error('Recipient email is required.');
    error.status = 400;
    error.expose = true;
    throw error;
  }

  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject,
    text,
    html,
    attachments: attachmentPath ? [{
      filename: attachmentName,
      path: attachmentPath,
      contentType: 'application/pdf',
    }] : [],
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
};

module.exports = {
  hasSmtpConfig,
  sendDocumentEmail,
};
