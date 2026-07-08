const db = require('../config/db');

const createQuotation = async (data) => {
  const query = `
    INSERT INTO public.quotations (
      full_name, mobile_number, email, pickup_city, destination,
      travel_date, return_date, number_of_days, number_of_adults,
      number_of_children, approximate_budget, vehicle_preference,
      hotel_required, additional_requirements, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *;
  `;
  const values = [
    data.full_name, data.mobile_number, data.email, data.pickup_city,
    data.destination, data.travel_date, data.return_date || null,
    data.number_of_days, data.number_of_adults, data.number_of_children || 0,
    data.approximate_budget || 0, data.vehicle_preference, data.hotel_required,
    data.additional_requirements, 'Pending'
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getQuotations = async () => {
  const query = 'SELECT * FROM public.quotations ORDER BY created_at DESC;';
  const result = await db.query(query);
  return result.rows;
};

const updateQuotationStatus = async (id, status, rejection_reason = null) => {
  let updatedQuotation;
  
  if (rejection_reason) {
    const query = 'UPDATE public.quotations SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;';
    const result = await db.query(query, [status, rejection_reason, id]);
    updatedQuotation = result.rows[0];
  } else {
    const query = 'UPDATE public.quotations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;';
    const result = await db.query(query, [status, id]);
    updatedQuotation = result.rows[0];
  }

  // Seamless User Profile Integration: Treat completed quotation as a tour booking
  if (status === 'Completed' && updatedQuotation) {
    try {
      // Prevent duplicates if marked completed multiple times
      const checkQuery = `SELECT id FROM public.enquiries WHERE source_page = 'Quotation' AND requirement_notes LIKE $1`;
      const checkResult = await db.query(checkQuery, [`%[Quotation ID: ${id}]%`]);
      
      if (checkResult.rows.length === 0) {
        let details = {};
        if (updatedQuotation.quotation_details) {
          try {
            details = typeof updatedQuotation.quotation_details === 'string' 
              ? JSON.parse(updatedQuotation.quotation_details) 
              : updatedQuotation.quotation_details;
          } catch (e) {}
        }
        
        const insertQuery = `
          INSERT INTO public.enquiries (
            enquiry_type,
            customer_name,
            phone_number,
            email,
            status,
            source_page,
            travel_date,
            requirement_notes,
            service_details_json,
            quote_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        
        const quoteAmount = details.final_price || details.total_price || updatedQuotation.approximate_budget || 0;
        
        const insertValues = [
          'tour',
          updatedQuotation.full_name,
          updatedQuotation.mobile_number,
          updatedQuotation.email || null,
          'Completed',
          'Quotation',
          updatedQuotation.travel_date || null,
          `Quotation converted to booking. [Quotation ID: ${id}] \nDestination: ${updatedQuotation.destination}`,
          JSON.stringify(details),
          quoteAmount
        ];
        
        await db.query(insertQuery, insertValues);
      }
    } catch (err) {
      console.error('Error syncing completed quotation to enquiries for User Profile:', err);
    }
  }

  return updatedQuotation;
};

const saveQuotationDetails = async (id, details, verificationHash) => {
  const query = `
    UPDATE public.quotations 
    SET quotation_details = $1, status = 'Quotation Generated', updated_at = CURRENT_TIMESTAMP, verification_hash = $3 
    WHERE id = $2 RETURNING *;
  `;
  const result = await db.query(query, [JSON.stringify(details), id, verificationHash]);
  return result.rows[0];
};

module.exports = {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
  saveQuotationDetails
};
