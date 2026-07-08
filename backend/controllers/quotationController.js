const quotationModel = require('../models/quotationModel');
const fs = require('fs');
const path = require('path');
const { generateQuotationHash } = require('../utils/hashGenerator');

const createQuotation = async (req, res) => {
  try {
    const data = req.body;
    if (!data.full_name || !data.mobile_number || !data.destination || !data.travel_date || !data.number_of_days || !data.number_of_adults) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const quotation = await quotationModel.createQuotation(data);
    res.status(201).json({ success: true, data: quotation, message: 'Quotation request submitted successfully' });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getQuotations = async (req, res) => {
  try {
    const quotations = await quotationModel.getQuotations();
    res.status(200).json({ success: true, data: quotations });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
    
    const quotation = await quotationModel.updateQuotationStatus(id, status, rejection_reason);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    
    res.status(200).json({ success: true, data: quotation, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const saveDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = req.body;
    
    // Fetch existing quotation to generate the verification hash
    const quotations = await quotationModel.getQuotations();
    const q = quotations.find(item => item.id === parseInt(id, 10));
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const qtId = `QT-${new Date(q.created_at || Date.now()).getFullYear()}-${String(q.id).padStart(6, '0')}`;
    
    const hashData = {
      quotation_id: qtId,
      customer_name: q.full_name,
      mobile_number: q.mobile_number,
      email: q.email || 'N/A',
      pickup_city: q.pickup_city || 'N/A',
      destination: q.destination,
      travel_date: q.travel_date,
      return_date: q.return_date,
      number_of_days: q.number_of_days,
      number_of_adults: q.number_of_adults,
      number_of_children: q.number_of_children,
      vehicle: details.vehicle || 'As requested',
      hotel: details.hotel || 'As requested',
      final_price: details.final_price || 0,
      generated_date: q.updated_at || q.created_at || new Date()
    };

    const { hash, canonicalString } = generateQuotationHash(hashData);
    console.log(`[GENERATING HASH] Generated hash for Quotation ID ${qtId}:`, hash);
    console.log(`[GENERATING HASH] Canonical String:`, canonicalString);

    const quotation = await quotationModel.saveQuotationDetails(id, details, hash);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    
    res.status(200).json({ success: true, data: quotation, message: 'Quotation details saved successfully' });
  } catch (error) {
    console.error('Error saving quotation details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Polyfill minimal DOM requirements to silence non-fatal pdfjs-dist warnings in Node
if (!global.DOMMatrix) global.DOMMatrix = class DOMMatrix {};
if (!global.Path2D) global.Path2D = class Path2D {};

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const parsePdfBuffer = async (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    standardFontDataUrl: require('path').join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts') + '/',
  });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  let fullText = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + ' \n';
  }
  
  return { text: fullText, numpages: numPages };
};

const verifyQuotation = async (req, res) => {
  try {
    console.log('[VERIFY API] Incoming verification request...');
    
    if (!req.file) {
      console.log('[VERIFY API] No file was uploaded in the request.');
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    console.log(`[VERIFY API] req.file object:`, req.file);
    console.log(`[VERIFY API] req.file.originalname:`, req.file.originalname);
    console.log(`[VERIFY API] req.file.mimetype:`, req.file.mimetype);
    console.log(`[VERIFY API] req.file.size:`, req.file.size);
    console.log(`[VERIFY API] req.file.buffer exists:`, !!req.file.buffer);

    const dataBuffer = fs.readFileSync(req.file.path);
    console.log(`[VERIFY API] dataBuffer length:`, dataBuffer.length);
    console.log(`[VERIFY API] First 20 bytes (hex):`, dataBuffer.slice(0, 20).toString('hex'));

    let pdfData;
    try {
      pdfData = await parsePdfBuffer(dataBuffer);
      console.log(`[VERIFY API] pdfParse success. Pages:`, pdfData.numpages, `Text length:`, pdfData.text.length);
      console.log(`[VERIFY API] Extracted text (first 300 chars):\n`, pdfData.text.substring(0, 300));
    } catch (parseError) {
      console.error('[VERIFY API] PDF parsing failed:', parseError);
      console.error('[VERIFY API] parseError stack:', parseError.stack);
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'The uploaded file is not a valid or readable PDF document.' });
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const text = pdfData.text;
    const match = text.match(/Quotation ID:\s*(QT-\d{4}-\d{6})/i);
    
    if (!match) {
      console.log('[VERIFY API] No Quotation ID matched in the document text.');
      return res.status(400).json({ success: false, message: 'Quotation ID not found in the document. This is not a valid Velvet Pearl quotation.' });
    }

    const quotationIdString = match[1];
    console.log(`[VERIFY API] Extracted Quotation ID: ${quotationIdString}`);

    const parts = quotationIdString.split('-');
    const dbId = parseInt(parts[2], 10);
    const dbYear = parseInt(parts[1], 10);

    console.log(`[VERIFY API] Database lookup for ID: ${dbId}`);
    const quotations = await quotationModel.getQuotations();
    const q = quotations.find(item => item.id === dbId);

    if (!q) {
      console.log('[VERIFY API] Verification Result: FAILED (Quotation ID does not exist in system)');
      return res.status(404).json({ success: false, message: 'Quotation ID does not exist in our system.' });
    }

    const createdYear = new Date(q.created_at || Date.now()).getFullYear();
    if (createdYear !== dbYear) {
      console.log(`[VERIFY API] Verification Result: FAILED (Year mismatch. Expected: ${dbYear}, Found: ${createdYear})`);
      return res.status(400).json({ success: false, message: 'Quotation ID mismatch. The document has been modified.' });
    }

    // Step 1: Extract remaining fields using PDF parsing logic
    const extract = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };
      
    const extractedData = {
      quotation_id: quotationIdString,
      customer_name: extract(/Name:\s*(.*?)(?=\s+Mobile:)/i),
      mobile_number: extract(/Mobile:\s*(\d+)/i),
      email: extract(/Email:\s*(.*?)(?=\s+(?:TRIP DETAILS|Destination|Pickup))/i),
      pickup_city: extract(/Pickup:\s*(.*?)(?=\s+Travel Date:)/i),
      destination: extract(/Destination:\s*(.*?)(?=\s+Pickup:)/i),
      travel_date: extract(/Travel Date:\s*(.*?)(?=\s+Duration:)/i),
      return_date: q.return_date, // Not in PDF
      number_of_days: extract(/Duration:\s*(\d+)/i),
      number_of_adults: q.number_of_adults, // Not in PDF
      number_of_children: q.number_of_children, // Not in PDF
      vehicle: extract(/Vehicle Provided\s+(.*?)(?=\s+Hotel Accommodation)/i),
      hotel: extract(/Hotel Accommodation\s+(.*?)(?=\s+(?:Sightseeing Plan|Driver Allowance|Total Amount|Final Price))/i),
      final_price: extract(/Final Price:\s*INR\s*([\d,]+)/i),
      generated_date: extract(/Date:\s*([\d\/]+)/i)
    };

    // Parse details from DB
    let details = {};
    try {
      details = typeof q.quotation_details === 'string' ? JSON.parse(q.quotation_details) : (q.quotation_details || {});
    } catch (e) {
      console.error('[VERIFY API] Failed to parse quotation_details:', e);
    }

    const dbData = {
      quotation_id: quotationIdString,
      customer_name: q.full_name,
      mobile_number: q.mobile_number,
      email: q.email || 'N/A',
      pickup_city: q.pickup_city || 'N/A',
      destination: q.destination,
      travel_date: q.travel_date,
      return_date: q.return_date,
      number_of_days: q.number_of_days,
      number_of_adults: q.number_of_adults,
      number_of_children: q.number_of_children,
      vehicle: details.vehicle || 'As requested',
      hotel: details.hotel || 'As requested',
      final_price: details.final_price || 0,
      generated_date: q.updated_at || q.created_at || new Date()
    };

    // Step 3: Generate NEW SHA-256 hash from extracted values and DB values
    const { hash: extractedHash, normalizedData: normExtracted, canonicalString: extractedCanonicalString } = generateQuotationHash(extractedData);
    const { hash: dbHash, normalizedData: normDb, canonicalString: dbCanonicalString } = generateQuotationHash(dbData);
    
    // Detailed field-by-field comparison output exactly as requested
    const fieldsToCompare = [
      'quotation_id', 'customer_name', 'mobile_number', 'email', 'pickup_city', 
      'destination', 'travel_date', 'return_date', 'number_of_days', 
      'number_of_adults', 'number_of_children', 'vehicle', 'hotel', 
      'final_price', 'generated_date'
    ];

    console.log('\n=============================================');
    console.log('--- START FIELD-BY-FIELD COMPARISON ---');
    console.log('=============================================\n');

    for (const field of fieldsToCompare) {
      console.log(field);
      console.log();
      console.log('Database:');
      console.log(normDb[field]);
      console.log();
      console.log('PDF:');
      console.log(normExtracted[field]);
      console.log();
      if (normDb[field] === normExtracted[field]) {
        console.log('MATCH');
      } else {
        console.log('MISMATCH');
      }
      console.log('\n------------------------\n');
    }

    console.log('Database Canonical String');
    console.log(dbCanonicalString);
    console.log();
    console.log('Verification Canonical String');
    console.log(extractedCanonicalString);
    console.log();
    console.log('Stored SHA-256');
    console.log(q.verification_hash || 'NOT FOUND');
    console.log();
    console.log('Calculated SHA-256');
    console.log(extractedHash);
    console.log('\n=============================================\n');

    // Step 4: Compare hashes
    if (!q.verification_hash || extractedHash !== q.verification_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification Failed\nThis quotation does not match the original quotation stored in Velvet Pearl\'s system or has been modified.' 
      });
    }

    console.log('[VERIFY API] Verification Result: SUCCESS (Document Verified)');
    res.status(200).json({
      success: true,
      message: 'Document Verified\nThis quotation is authentic and has not been modified.',
      quotation: {
        quotation_id: quotationIdString,
        customer_name: q.full_name,
        destination: q.destination,
        generated_date: q.updated_at || q.created_at,
        status: q.status
      }
    });

  } catch (err) {
    console.error('[VERIFY API] Caught exception during verification:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  updateStatus,
  saveDetails,
  verifyQuotation
};
