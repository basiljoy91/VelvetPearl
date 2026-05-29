const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';

const isCloudApiEnabled = () => String(process.env.WHATSAPP_CLOUD_API_ENABLED || '').toLowerCase() === 'true';

const hasBaseCloudConfig = () => Boolean(
  process.env.WHATSAPP_ACCESS_TOKEN
  && process.env.WHATSAPP_PHONE_NUMBER_ID
);

const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

const isMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim() !== '';
};

const formatLabel = (value) => (
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const buildTravelSchedule = (enquiry = {}) => {
  const date = enquiry.travel_date || enquiry.schedule || '';
  const time = enquiry.travel_time || '';
  return [date, time].filter(Boolean).join(' ') || 'Not shared';
};

const buildDetailLines = (enquiry = {}) => {
  const details = enquiry.enquiry_details || enquiry.service_details_json || {};
  const sharedLines = [
    ['Reference', enquiry.reference_id || enquiry.id || 'N/A'],
    ['Name', enquiry.customer_name || enquiry.customer || 'N/A'],
    ['Phone', enquiry.phone_number || enquiry.phone || 'N/A'],
    ['WhatsApp', enquiry.whatsapp_number || enquiry.phone_number || enquiry.phone || 'N/A'],
    ['Email', enquiry.email || 'Not shared'],
  ];

  if (enquiry.enquiry_type === 'cab' || enquiry.service_type === 'cab') {
    return [
      ...sharedLines,
      ['Pickup', details.pickup || 'Not shared'],
      ['Drop', details.dropoff || 'Not shared'],
      ['Date', details.pickup_date || enquiry.travel_date || 'Not shared'],
      ['Time', details.pickup_time || enquiry.travel_time || 'Not shared'],
      ['Passengers', details.passengers || 'Not shared'],
      ['Vehicle', formatLabel(details.vehicle_preference) || 'Not shared'],
      ['Luggage', details.luggage || 'Not shared'],
      ['Status', enquiry.status || 'New'],
    ];
  }

  if (enquiry.enquiry_type === 'room' || enquiry.service_type === 'room') {
    return [
      ...sharedLines,
      ['Destination', details.destination_city || details.hotel_name || 'Not shared'],
      ['Preferred Area', details.location_preference || 'Not shared'],
      ['Check-In', details.check_in || enquiry.travel_date || 'Not shared'],
      ['Check-Out', details.check_out || 'Not shared'],
      ['Guests', details.guests || 'Not shared'],
      ['Rooms', details.room_count || 'Not shared'],
      ['Budget', details.budget || 'Not shared'],
      ['Status', enquiry.status || 'New'],
    ];
  }

  if (enquiry.enquiry_type === 'tour' || enquiry.service_type === 'tour') {
    return [
      ...sharedLines,
      ['Destination', details.destination || details.package_name || 'Not shared'],
      ['Start Date', details.travel_window_start || enquiry.travel_date || 'Not shared'],
      ['End Date', details.travel_window_end || 'Not shared'],
      ['Group Size', details.group_size || 'Not shared'],
      ['Cab Required', details.cab_required || 'Not shared'],
      ['Hotel Level', details.hotel_preference || 'Not shared'],
      ['Budget', details.budget || 'Not shared'],
      ['Status', enquiry.status || 'New'],
    ];
  }

  if (enquiry.enquiry_type === 'custom' || enquiry.service_type === 'custom') {
    return [
      ...sharedLines,
      ['Requirement Type', details.custom_category || 'Not shared'],
      ['Destination', details.location || 'Not shared'],
      ['Travel Window', details.travel_window || enquiry.travel_date || 'Not shared'],
      ['People', details.group_size || 'Not shared'],
      ['Budget', details.budget || 'Not shared'],
      ['Status', enquiry.status || 'New'],
    ];
  }

  return [
    ...sharedLines,
    ['Topic', details.topic || enquiry.requirement_notes || 'General travel enquiry'],
    ['Travel Schedule', buildTravelSchedule(enquiry)],
    ['Status', enquiry.status || 'New'],
  ];
};

const buildAdminNotificationMessage = (enquiry = {}) => {
  const enquiryType = formatLabel(enquiry.enquiry_type || enquiry.service_type || 'General');
  const detailLines = buildDetailLines(enquiry)
    .filter(([, value]) => isMeaningfulValue(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  return `New ${enquiryType} Enquiry\n\n${detailLines}`;
};

const postCloudApiMessage = async (payload) => {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || `WhatsApp Cloud API request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  return data;
};

const getInitialWhatsAppTracking = () => {
  const cloudEnabled = isCloudApiEnabled();
  const adminNumber = normalizePhone(process.env.ADMIN_WHATSAPP_NUMBER);
  const customerTemplateName = String(process.env.WHATSAPP_CUSTOMER_ACK_TEMPLATE_NAME || '').trim();

  return {
    admin_whatsapp_notification_status: cloudEnabled && adminNumber ? 'pending' : 'not_enabled',
    customer_whatsapp_notification_status: cloudEnabled && customerTemplateName ? 'pending' : 'not_enabled',
    whatsapp_error_message: null,
    notification_sent_at: null,
  };
};

const sendAdminNotification = async (enquiry = {}) => {
  if (!isCloudApiEnabled()) {
    return { success: false, status: 'not_enabled', error: null };
  }

  if (!hasBaseCloudConfig()) {
    return { success: false, status: 'failed', error: 'Missing WhatsApp Cloud API credentials.' };
  }

  const adminNumber = normalizePhone(process.env.ADMIN_WHATSAPP_NUMBER);
  if (!adminNumber) {
    return { success: false, status: 'not_enabled', error: null };
  }

  try {
    const data = await postCloudApiMessage({
      messaging_product: 'whatsapp',
      to: adminNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: buildAdminNotificationMessage(enquiry),
      },
    });

    return {
      success: true,
      status: 'sent',
      data,
    };
  } catch (error) {
    console.error('[WHATSAPP ADMIN NOTIFICATION FAILED]', error.message);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
};

const sendCustomerAcknowledgement = async (enquiry = {}) => {
  if (!isCloudApiEnabled()) {
    return { success: false, status: 'not_enabled', error: null };
  }

  if (!hasBaseCloudConfig()) {
    return { success: false, status: 'failed', error: 'Missing WhatsApp Cloud API credentials.' };
  }

  const templateName = String(process.env.WHATSAPP_CUSTOMER_ACK_TEMPLATE_NAME || '').trim();
  if (!templateName) {
    return { success: false, status: 'not_enabled', error: null };
  }

  const customerNumber = normalizePhone(enquiry.whatsapp_number || enquiry.phone_number || enquiry.phone);
  if (!customerNumber) {
    return { success: false, status: 'not_enabled', error: null };
  }

  const languageCode = String(process.env.WHATSAPP_CUSTOMER_ACK_TEMPLATE_LANGUAGE || 'en_US').trim();

  try {
    const data = await postCloudApiMessage({
      messaging_product: 'whatsapp',
      to: customerNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: enquiry.reference_id || enquiry.id || 'Pending',
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      status: 'sent',
      data,
    };
  } catch (error) {
    console.error('[WHATSAPP CUSTOMER ACK FAILED]', error.message);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
};

module.exports = {
  getInitialWhatsAppTracking,
  sendAdminNotification,
  sendCustomerAcknowledgement,
};
