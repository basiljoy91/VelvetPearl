export const CHATBOT_NAME = 'Velvet Pearl Assistant';

export const SERVICE_OPTIONS = [
  { value: 'cab', label: 'Cab Booking' },
  { value: 'room', label: 'Room Booking' },
  { value: 'tour', label: 'Tour Enquiry' },
  { value: 'general', label: 'General Enquiry' },
];

export const FAQ_OPTIONS = [
  { value: 'airport_pickup', label: 'Airport Pickup' },
  { value: 'city_coverage', label: 'Cities Covered' },
  { value: 'family_trips', label: 'Family Trips' },
  { value: 'pricing', label: 'Pricing' },
];

export const FAQ_CONTENT = {
  airport_pickup: 'Yes, airport pickup and drop can be arranged based on route and availability. Share your travel details and our team will contact you.',
  city_coverage: 'We handle travel enquiries across India, with especially strong coverage around Chennai and Coimbatore. Share your route and our team will confirm the best available option.',
  family_trips: 'Yes, we support family and group trips. We can help with suitable vehicles, room arrangements, and tour planning based on your group size and destination.',
  pricing: 'Pricing depends on route distance, vehicle type, trip duration, pickup and drop locations, tolls, parking, timing, season demand, and any special travel requirements. Final pricing is shared after manual review.',
};

export const HANDOFF_CONTENT = {
  pricing: 'I can explain how pricing works, but I cannot confirm an exact final quote here. For an exact review, please continue on WhatsApp or submit the enquiry and our team will contact you shortly.',
  availability: 'I cannot confirm live availability inside the chatbot. Please continue on WhatsApp or submit your enquiry, and our team will review and contact you shortly.',
  urgent: 'For urgent or same-day requests, the fastest option is to continue on WhatsApp so our team can review the request directly.',
  human: 'A team member should take over from here. Please continue on WhatsApp, or I can still help you submit the enquiry details on this website.',
  custom: 'This sounds like a custom request that needs manual review. Please continue on WhatsApp, or I can capture the key details here and our team will contact you shortly.',
};

const contactFields = [
  {
    key: 'customer_name',
    type: 'text',
    required: true,
    prompt: 'What is your full name?',
    minLength: 2,
  },
  {
    key: 'phone_number',
    type: 'phone',
    required: true,
    prompt: 'What phone number should our team use?',
    hint: 'Enter digits with country code if available, for example `919876543210`.',
  },
  {
    key: 'whatsapp_number',
    type: 'phone',
    required: true,
    prompt: 'What WhatsApp number should we use?',
    hint: 'Type `same` if it is the same as your phone number.',
    allowSameAsPhone: true,
  },
  {
    key: 'email',
    type: 'email',
    required: false,
    prompt: 'Would you like to share an email address as well?',
    hint: 'Type an email address or `skip`.',
  },
  {
    key: 'preferred_contact_method',
    type: 'choice',
    required: true,
    prompt: 'How would you prefer our team to contact you?',
    options: [
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'phone', label: 'Phone Call' },
      { value: 'email', label: 'Email' },
    ],
  },
  {
    key: 'consent_to_contact',
    type: 'boolean',
    required: true,
    prompt: 'Do you agree to be contacted regarding this enquiry?',
    options: [
      { value: 'yes', label: 'Yes, I agree' },
      { value: 'no', label: 'No' },
    ],
  },
];

export const HANDOFF_FIELDS = [
  contactFields[0],
  contactFields[1],
  contactFields[2],
  contactFields[4],
  contactFields[5],
];

export const SERVICE_FLOWS = {
  cab: {
    label: 'Cab Booking',
    intro: 'I can help with a cab enquiry. I will collect the route, travel timing, and contact details, then submit it to our team for manual review.',
    sourcePage: 'chatbot:cab',
    fields: [
      {
        key: 'trip_type',
        type: 'choice',
        required: true,
        prompt: 'What kind of cab support do you need?',
        options: [
          { value: 'airport_pickup', label: 'Airport Pickup' },
          { value: 'airport_drop', label: 'Airport Drop' },
          { value: 'local_sightseeing', label: 'Local Sightseeing' },
          { value: 'outstation_trip', label: 'Outstation Trip' },
          { value: 'family_group_travel', label: 'Family / Group Travel' },
          { value: 'one_way_transfer', label: 'One-Way Transfer' },
          { value: 'round_trip', label: 'Round Trip' },
        ],
      },
      {
        key: 'pickup',
        type: 'text',
        required: true,
        prompt: 'What is the pickup location?',
      },
      {
        key: 'dropoff',
        type: 'text',
        required: true,
        prompt: 'What is the drop location?',
      },
      {
        key: 'pickup_date',
        type: 'date',
        required: true,
        prompt: 'What is the pickup date?',
        hint: 'Use the format `YYYY-MM-DD`.',
      },
      {
        key: 'pickup_time',
        type: 'time',
        required: true,
        prompt: 'What is the pickup time?',
        hint: 'Use the format `HH:MM`, for example `09:30`.',
      },
      {
        key: 'return_date',
        type: 'date',
        required: true,
        when: (data) => data.trip_type === 'round_trip',
        prompt: 'What is the return date for the round trip?',
        hint: 'Use the format `YYYY-MM-DD`.',
        minField: 'pickup_date',
      },
      {
        key: 'return_time',
        type: 'time',
        required: true,
        when: (data) => data.trip_type === 'round_trip',
        prompt: 'What is the return time?',
        hint: 'Use the format `HH:MM`.',
      },
      {
        key: 'passengers',
        type: 'integer',
        required: true,
        prompt: 'How many passengers will travel?',
        min: 1,
      },
      {
        key: 'luggage',
        type: 'text',
        required: false,
        prompt: 'Would you like to share luggage details?',
        hint: 'Type details or `skip`.',
      },
      {
        key: 'vehicle_preference',
        type: 'choice',
        required: false,
        prompt: 'Do you have a preferred vehicle type?',
        options: [
          { value: 'sedan', label: 'Sedan' },
          { value: 'suv', label: 'SUV' },
          { value: 'tempo_traveller', label: 'Tempo Traveller' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'special_requests',
        type: 'text',
        required: false,
        prompt: 'Any special requests or notes for this cab enquiry?',
        hint: 'Type your notes or `skip`.',
      },
      ...contactFields,
    ],
  },
  room: {
    label: 'Room Booking',
    intro: 'I can help with a room enquiry. I will collect the stay details and contact information, then send it to our team for manual review.',
    sourcePage: 'chatbot:room',
    fields: [
      {
        key: 'destination_city',
        type: 'text',
        required: true,
        prompt: 'Which destination or city do you need rooms in?',
      },
      {
        key: 'preferred_area',
        type: 'text',
        required: false,
        prompt: 'Do you have a preferred area?',
        hint: 'Type the area or `skip`.',
      },
      {
        key: 'check_in',
        type: 'date',
        required: true,
        prompt: 'What is the check-in date?',
        hint: 'Use the format `YYYY-MM-DD`.',
      },
      {
        key: 'check_out',
        type: 'date',
        required: true,
        prompt: 'What is the check-out date?',
        hint: 'Use the format `YYYY-MM-DD`.',
        minField: 'check_in',
      },
      {
        key: 'adults',
        type: 'integer',
        required: true,
        prompt: 'How many adults will stay?',
        min: 1,
      },
      {
        key: 'children',
        type: 'integer',
        required: false,
        prompt: 'How many children will stay?',
        hint: 'Enter a number or `skip`.',
        min: 0,
      },
      {
        key: 'room_count',
        type: 'integer',
        required: true,
        prompt: 'How many rooms do you need?',
        min: 1,
      },
      {
        key: 'room_type',
        type: 'choice',
        required: false,
        prompt: 'Do you have a room type preference?',
        options: [
          { value: 'budget', label: 'Budget' },
          { value: 'standard', label: 'Standard' },
          { value: 'deluxe', label: 'Deluxe' },
          { value: 'family_room', label: 'Family Room' },
          { value: 'resort', label: 'Resort' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'meal_preference',
        type: 'choice',
        required: false,
        prompt: 'Any meal preference?',
        options: [
          { value: 'no_meals', label: 'No Meals' },
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'breakfast_and_dinner', label: 'Breakfast + Dinner' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'budget',
        type: 'text',
        required: false,
        prompt: 'Would you like to share an approximate budget?',
        hint: 'Type your budget or `skip`.',
      },
      {
        key: 'pickup_required',
        type: 'choice',
        required: false,
        prompt: 'Do you also need pickup support?',
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
          { value: 'Not sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'special_requirements',
        type: 'text',
        required: false,
        prompt: 'Any special stay requirements?',
        hint: 'Type your notes or `skip`.',
      },
      ...contactFields,
    ],
  },
  tour: {
    label: 'Tour Enquiry',
    intro: 'I can help with a tour enquiry. I will collect the destination, dates, group details, and contact information, then submit it for manual review.',
    sourcePage: 'chatbot:tour',
    fields: [
      {
        key: 'destination',
        type: 'text',
        required: true,
        prompt: 'Which destination or package are you interested in?',
      },
      {
        key: 'travel_window_start',
        type: 'date',
        required: true,
        prompt: 'What is your travel start date?',
        hint: 'Use the format `YYYY-MM-DD`.',
      },
      {
        key: 'travel_window_end',
        type: 'date',
        required: true,
        prompt: 'What is your travel end date?',
        hint: 'Use the format `YYYY-MM-DD`.',
        minField: 'travel_window_start',
      },
      {
        key: 'adults',
        type: 'integer',
        required: true,
        prompt: 'How many adults are travelling?',
        min: 1,
      },
      {
        key: 'children',
        type: 'integer',
        required: false,
        prompt: 'How many children are travelling?',
        hint: 'Enter a number or `skip`.',
        min: 0,
      },
      {
        key: 'pickup_city',
        type: 'text',
        required: true,
        prompt: 'What is your pickup city or starting point?',
      },
      {
        key: 'cab_required',
        type: 'choice',
        required: false,
        prompt: 'Would you like cab support included?',
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
          { value: 'Not sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'hotel_preference',
        type: 'choice',
        required: false,
        prompt: 'Do you have a hotel level preference?',
        options: [
          { value: 'Budget', label: 'Budget' },
          { value: 'Standard', label: 'Standard' },
          { value: 'Premium', label: 'Premium' },
          { value: 'Resort', label: 'Resort' },
          { value: 'Not sure', label: 'Not Sure' },
        ],
      },
      {
        key: 'budget',
        type: 'text',
        required: false,
        prompt: 'Would you like to share an approximate budget?',
        hint: 'Type your budget or `skip`.',
      },
      {
        key: 'notes',
        type: 'text',
        required: false,
        prompt: 'Any special requests for this tour enquiry?',
        hint: 'Type your notes or `skip`.',
      },
      ...contactFields,
    ],
  },
  general: {
    label: 'General Enquiry',
    intro: 'I can help with a general enquiry. Share your topic and message, then I will send it to our team for manual follow-up.',
    sourcePage: 'chatbot:general',
    fields: [
      {
        key: 'topic',
        type: 'choice',
        required: true,
        prompt: 'What is this enquiry about?',
        options: [
          { value: 'General travel enquiry', label: 'General Travel Enquiry' },
          { value: 'Cab support', label: 'Cab Support' },
          { value: 'Room support', label: 'Room Support' },
          { value: 'Tour package support', label: 'Tour Package Support' },
          { value: 'Custom trip support', label: 'Custom Trip Support' },
        ],
      },
      {
        key: 'message',
        type: 'text',
        required: true,
        prompt: 'Please share your message or requirement.',
        minLength: 8,
      },
      ...contactFields,
    ],
  },
};

const normalizeText = (value = '') => String(value).trim().toLowerCase();

export function detectServiceFromText(value = '') {
  const text = normalizeText(value);

  if (/(cab|taxi|airport transfer|airport pickup|airport drop|transfer|outstation|round trip|one way|pickup|drop)/.test(text)) {
    return 'cab';
  }

  if (/(room|hotel|stay|resort|check-in|check out|check-in|check-out|check in|family room)/.test(text)) {
    return 'room';
  }

  if (/(tour|package|holiday|vacation|trip plan|sightseeing package|destination package)/.test(text)) {
    return 'tour';
  }

  if (/(general|support|contact|help)/.test(text)) {
    return 'general';
  }

  return null;
}

export function matchFaqId(value = '') {
  const text = normalizeText(value);

  if (/(which cities|cities do you cover|where do you cover|coverage|operate in|all india)/.test(text)) {
    return 'city_coverage';
  }

  if (/(family trip|family travel|group trip|book for family|family booking)/.test(text)) {
    return 'family_trips';
  }

  if (/(price|pricing|fare|rate|cost|how much|how is pricing decided)/.test(text)) {
    return 'pricing';
  }

  if (/(do you provide airport pickup|airport pickup|airport drop|airport transfer)/.test(text)) {
    return 'airport_pickup';
  }

  return null;
}

export function detectBookingIntent(value = '') {
  const text = normalizeText(value);
  const serviceKey = detectServiceFromText(text);

  if (!serviceKey) return null;

  if (/(book|booking|need|looking for|want|plan|arrange|reserve|travel|trip|support|help)/.test(text)) {
    return serviceKey;
  }

  return null;
}

export function detectHandoffReason(value = '') {
  const text = normalizeText(value);

  if (/(exact price|exact quote|final price|best quote|quote me|quote please|how much exactly|price confirmation)/.test(text)) {
    return 'pricing';
  }

  if (/(availability|available now|confirm availability|is it available|guarantee availability|confirm booking)/.test(text)) {
    return 'availability';
  }

  if (/(urgent|same day|today itself|today|right now|asap|immediately)/.test(text)) {
    return 'urgent';
  }

  if (/(human|agent|person|executive|team member|call me|talk to someone|speak to someone|whatsapp me)/.test(text)) {
    return 'human';
  }

  if (/(custom trip|custom plan|itinerary|multi city|multiple stops|special plan|tailor made)/.test(text)) {
    return 'custom';
  }

  return null;
}

const toPositiveNumber = (value) => Number.parseInt(String(value || '').trim(), 10);

export function buildEnquiryPayload(serviceKey, data = {}) {
  if (serviceKey === 'cab') {
    return {
      customer_name: data.customer_name,
      phone_number: data.phone_number,
      whatsapp_number: data.whatsapp_number,
      email: data.email || '',
      preferred_contact_method: data.preferred_contact_method,
      consent_to_contact: true,
      service_type: 'cab',
      source_page: SERVICE_FLOWS.cab.sourcePage,
      travel_date: data.pickup_date,
      travel_time: data.pickup_time,
      requirement_notes: data.special_requests || `${data.pickup} to ${data.dropoff}`,
      enquiry_details: {
        trip_type: data.trip_type,
        pickup: data.pickup,
        dropoff: data.dropoff,
        pickup_date: data.pickup_date,
        pickup_time: data.pickup_time,
        return_date: data.return_date || '',
        return_time: data.return_time || '',
        passengers: data.passengers,
        luggage: data.luggage || '',
        vehicle_preference: data.vehicle_preference || 'not_sure',
        notes: data.special_requests || '',
      },
    };
  }

  if (serviceKey === 'room') {
    return {
      customer_name: data.customer_name,
      phone_number: data.phone_number,
      whatsapp_number: data.whatsapp_number,
      email: data.email || '',
      preferred_contact_method: data.preferred_contact_method,
      consent_to_contact: true,
      service_type: 'room',
      source_page: SERVICE_FLOWS.room.sourcePage,
      travel_date: data.check_in,
      requirement_notes: data.special_requirements || `${data.destination_city} stay enquiry`,
      enquiry_details: {
        destination_city: data.destination_city,
        hotel_name: data.destination_city,
        location_preference: data.preferred_area || '',
        check_in: data.check_in,
        check_out: data.check_out,
        guests: String(toPositiveNumber(data.adults) + toPositiveNumber(data.children || 0)),
        adults: data.adults,
        children: data.children || '0',
        room_count: data.room_count,
        room_type: data.room_type || 'not_sure',
        meal_preference: data.meal_preference || 'not_sure',
        budget: data.budget || '',
        pickup_required: data.pickup_required || 'Not sure',
        notes: data.special_requirements || '',
      },
    };
  }

  if (serviceKey === 'tour') {
    return {
      customer_name: data.customer_name,
      phone_number: data.phone_number,
      whatsapp_number: data.whatsapp_number,
      email: data.email || '',
      preferred_contact_method: data.preferred_contact_method,
      consent_to_contact: true,
      service_type: 'tour',
      source_page: SERVICE_FLOWS.tour.sourcePage,
      travel_date: data.travel_window_start,
      requirement_notes: data.notes || `${data.destination} tour enquiry`,
      enquiry_details: {
        destination: data.destination,
        package_name: data.destination,
        travel_window_start: data.travel_window_start,
        travel_window_end: data.travel_window_end,
        adults: data.adults,
        children: data.children || '0',
        group_size: String(toPositiveNumber(data.adults) + toPositiveNumber(data.children || 0)),
        pickup_city: data.pickup_city,
        cab_required: data.cab_required || 'Not sure',
        hotel_preference: data.hotel_preference || 'Not sure',
        budget: data.budget || '',
        notes: data.notes || '',
      },
    };
  }

  return {
    customer_name: data.customer_name,
    phone_number: data.phone_number,
    whatsapp_number: data.whatsapp_number,
    email: data.email || '',
    preferred_contact_method: data.preferred_contact_method,
    consent_to_contact: true,
    service_type: 'general',
    source_page: SERVICE_FLOWS.general.sourcePage,
    requirement_notes: data.message,
    enquiry_details: {
      topic: data.topic,
      message: data.message,
    },
  };
}

export function buildFollowUpWhatsAppMessage(serviceKey, referenceId) {
  const flowLabel = SERVICE_FLOWS[serviceKey]?.label || 'travel enquiry';
  return `Hi, I submitted a ${flowLabel.toLowerCase()} through the website chatbot. My reference ID is ${referenceId || 'PENDING'}. Please help me with the next steps.`;
}

export function summarizeCollectedDetails(serviceKey, data = {}) {
  const details = [];

  if (serviceKey === 'cab') {
    if (data.trip_type) details.push(`Trip type: ${data.trip_type}`);
    if (data.pickup) details.push(`Pickup: ${data.pickup}`);
    if (data.dropoff) details.push(`Drop: ${data.dropoff}`);
    if (data.pickup_date) details.push(`Pickup date: ${data.pickup_date}`);
    if (data.pickup_time) details.push(`Pickup time: ${data.pickup_time}`);
    if (data.passengers) details.push(`Passengers: ${data.passengers}`);
    if (data.vehicle_preference) details.push(`Vehicle: ${data.vehicle_preference}`);
  } else if (serviceKey === 'room') {
    if (data.destination_city) details.push(`Destination: ${data.destination_city}`);
    if (data.check_in) details.push(`Check-in: ${data.check_in}`);
    if (data.check_out) details.push(`Check-out: ${data.check_out}`);
    if (data.adults) details.push(`Adults: ${data.adults}`);
    if (data.children) details.push(`Children: ${data.children}`);
    if (data.room_count) details.push(`Rooms: ${data.room_count}`);
    if (data.room_type) details.push(`Room type: ${data.room_type}`);
  } else if (serviceKey === 'tour') {
    if (data.destination) details.push(`Destination: ${data.destination}`);
    if (data.travel_window_start) details.push(`Start date: ${data.travel_window_start}`);
    if (data.travel_window_end) details.push(`End date: ${data.travel_window_end}`);
    if (data.adults) details.push(`Adults: ${data.adults}`);
    if (data.children) details.push(`Children: ${data.children}`);
    if (data.pickup_city) details.push(`Pickup city: ${data.pickup_city}`);
    if (data.hotel_preference) details.push(`Hotel preference: ${data.hotel_preference}`);
  } else {
    if (data.topic) details.push(`Topic: ${data.topic}`);
    if (data.message) details.push(`Message: ${data.message}`);
  }

  if (data.customer_name) details.push(`Customer: ${data.customer_name}`);
  if (data.phone_number) details.push(`Phone: ${data.phone_number}`);
  if (data.whatsapp_number) details.push(`WhatsApp: ${data.whatsapp_number}`);
  if (data.preferred_contact_method) details.push(`Preferred contact: ${data.preferred_contact_method}`);

  return details.join(' | ');
}

export function buildHandoffPayload(serviceKey, data = {}, reason = 'human', requestText = '') {
  const resolvedServiceKey = serviceKey && SERVICE_FLOWS[serviceKey] ? serviceKey : 'general';
  const handoffLabel = reason.replace(/_/g, ' ');
  const collectedSummary = summarizeCollectedDetails(resolvedServiceKey, data);
  const notes = [
    `Chatbot handoff requested (${handoffLabel}).`,
    requestText ? `Customer request: ${requestText}` : '',
    collectedSummary ? `Collected details: ${collectedSummary}` : '',
  ].filter(Boolean).join(' ');

  if (resolvedServiceKey === 'general') {
    return {
      customer_name: data.customer_name,
      phone_number: data.phone_number,
      whatsapp_number: data.whatsapp_number,
      email: data.email || '',
      preferred_contact_method: data.preferred_contact_method || 'whatsapp',
      consent_to_contact: true,
      service_type: 'general',
      source_page: 'chatbot:handoff:general',
      requirement_notes: notes,
      enquiry_details: {
        topic: 'Human handoff',
        message: notes,
      },
    };
  }

  const basePayload = buildEnquiryPayload(resolvedServiceKey, {
    ...data,
    message: data.message || notes,
  });

  return {
    ...basePayload,
    source_page: `chatbot:handoff:${resolvedServiceKey}`,
    requirement_notes: notes,
    enquiry_details: {
      ...basePayload.enquiry_details,
      handoff_reason: reason,
      handoff_summary: notes,
    },
  };
}
