const crypto = require('crypto');

/**
 * Normalizes a date string or object to YYYY-MM-DD format.
 */
const normalizeDate = (dateVal) => {
  if (!dateVal) return '';
  const str = String(dateVal).trim();
  if (!str) return '';
  
  // If it's already an ISO string or a Date object
  let d = new Date(dateVal);
  
  // If Date is invalid, attempt manual parsing
  if (isNaN(d.getTime())) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      
      let day, month, year = p2;
      
      // If first part > 12, it must be DD/MM/YYYY
      if (p0 > 12) {
        day = p0;
        month = p1;
      } 
      // If second part > 12, it must be MM/DD/YYYY
      else if (p1 > 12) {
        month = p0;
        day = p1;
      } 
      // Default fallback (assume DD/MM/YYYY as it's standard for Velvet Pearl in India)
      else {
        day = p0;
        month = p1;
      }
      
      d = new Date(year, month - 1, day);
    }
  }
  
  if (isNaN(d.getTime())) return str; // Fallback to raw string if completely unparseable
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
};

/**
 * Normalizes strings: trims and replaces multiple spaces with a single space.
 */
const normalizeString = (val) => {
  if (val == null) return '';
  return String(val).replace(/\s+/g, ' ').trim();
};

/**
 * Normalizes numbers: removes commas, currency symbols, and whitespace.
 */
const normalizeNumber = (val) => {
  if (val == null) return '';
  return String(val).replace(/[^\d.]/g, ''); // Keep only digits and decimal point
};

/**
 * Generates a consistent SHA-256 hash for a quotation based on its critical fields.
 * The order of fields in the canonical string MUST NEVER CHANGE.
 */
const generateQuotationHash = (data) => {
  // Normalize each field
  const normalizedData = {
    quotation_id: normalizeString(data.quotation_id),
    customer_name: normalizeString(data.customer_name),
    mobile_number: normalizeNumber(data.mobile_number),
    email: normalizeString(data.email),
    pickup_city: normalizeString(data.pickup_city),
    destination: normalizeString(data.destination),
    travel_date: normalizeDate(data.travel_date),
    return_date: normalizeDate(data.return_date),
    number_of_days: normalizeNumber(data.number_of_days),
    number_of_adults: normalizeNumber(data.number_of_adults),
    number_of_children: normalizeNumber(data.number_of_children),
    vehicle: normalizeString(data.vehicle),
    hotel: normalizeString(data.hotel),
    final_price: normalizeNumber(data.final_price),
    generated_date: normalizeDate(data.generated_date)
  };

  // Fixed order for canonical string
  const canonicalFields = [
    normalizedData.quotation_id,
    normalizedData.customer_name,
    normalizedData.mobile_number,
    normalizedData.email,
    normalizedData.pickup_city,
    normalizedData.destination,
    normalizedData.travel_date,
    normalizedData.return_date,
    normalizedData.number_of_days,
    normalizedData.number_of_adults,
    normalizedData.number_of_children,
    normalizedData.vehicle,
    normalizedData.hotel,
    normalizedData.final_price,
    normalizedData.generated_date
  ];

  const canonicalString = canonicalFields.join('|');
  const hash = crypto.createHash('sha256').update(canonicalString).digest('hex');
  
  return {
    canonicalString,
    canonicalFields,
    normalizedData,
    hash
  };
};

module.exports = {
  generateQuotationHash
};
