import React, { useState, useEffect, useMemo } from 'react';
import { getQuotations, updateQuotationStatus, saveQuotationDetails, verifyQuotationPdf } from '../../services/dataService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadLogo = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/og-cover.png';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

const buildPDFDoc = async (q, details) => {
  const doc = new jsPDF();
  const qtId = `QT-${new Date(q.created_at || Date.now()).getFullYear()}-${String(q.id).padStart(6, '0')}`;
  
  // Header background / styling
  doc.setFillColor(41, 128, 185); // Professional Blue
  doc.rect(0, 0, 210, 45, 'F');
  
  // Try to load logo
  const logo = await loadLogo();
  if (logo) {
    // Aspect ratio of og-cover.png (typically 1200x630)
    doc.addImage(logo, 'PNG', 14, 10, 45, 24);
  }
  
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL QUOTATION', 196, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 240);
  doc.text('Velvet Pearl', 196, 26, { align: 'right' });
  doc.text(`Date: ${new Date(q.updated_at || q.created_at || Date.now()).toLocaleDateString()}`, 196, 31, { align: 'right' });
  doc.text(`Valid for: ${details.validity_days || 7} days`, 196, 36, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Quotation ID: ${qtId}`, 196, 41, { align: 'right' });

  // Customer Information & Trip Details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER INFORMATION', 14, 60);
  doc.text('TRIP DETAILS', 110, 60);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 63, 95, 63);
  doc.line(110, 63, 196, 63);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${q.full_name}`, 14, 70);
  doc.text(`Mobile: ${q.mobile_number}`, 14, 75);
  doc.text(`Email: ${q.email || 'N/A'}`, 14, 80);

  doc.text(`Destination: ${q.destination}`, 110, 70);
  doc.text(`Pickup: ${q.pickup_city || 'N/A'}`, 110, 75);
  doc.text(`Travel Date: ${new Date(q.travel_date).toLocaleDateString()}`, 110, 80);
  doc.text(`Duration: ${q.number_of_days} Days`, 110, 85);

  // Quotation Details Table
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION DETAILS', 14, 100);

  const tableData = [
    ['Vehicle Provided', details.vehicle || 'As requested'],
    ['Hotel Accommodation', details.hotel || 'As requested'],
    ['Sightseeing Plan', details.sightseeing || 'As per itinerary'],
    ['Driver Allowance', details.driver_allowance],
    ['Fuel Charges', details.fuel],
    ['Toll & Parking', details.toll_charges],
  ];

  autoTable(doc, {
    startY: 105,
    head: [['Particulars', 'Details']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6, textColor: [60, 60, 60] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: [40, 40, 40] } }
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  // Pricing Summary (Right Aligned Table)
  const priceData = [
    ['Total Amount:', `INR ${details.total_price || 0}`]
  ];
  if (details.discount) {
    priceData.push(['Discount:', `- INR ${details.discount}`]);
  }
  priceData.push(['Final Price:', `INR ${details.final_price || 0}`]);

  autoTable(doc, {
    startY: finalY,
    body: priceData,
    theme: 'plain',
    margin: { left: 120 },
    styles: { fontSize: 11, cellPadding: 3, halign: 'right' },
    columnStyles: { 
      0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 40 },
      1: { fontStyle: 'bold', textColor: [40, 40, 40], cellWidth: 35 } 
    },
    didParseCell: function(data) {
      if (data.row.index === priceData.length - 1) { 
        data.cell.styles.fontSize = 14;
        data.cell.styles.textColor = [41, 128, 185]; // Highlighted blue
        data.cell.styles.fillColor = [240, 247, 255]; // Light blue background
      }
    }
  });

  // Additional Notes
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('ADDITIONAL NOTES', 14, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const splitNotes = doc.splitTextToSize(details.notes || 'None', 100);
  doc.text(splitNotes, 14, finalY + 7);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 25, 196, pageHeight - 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('Thank you for choosing Velvet Pearl!', 105, pageHeight - 15, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated quotation and does not require a physical signature.', 105, pageHeight - 10, { align: 'center' });

  return doc;
};

export default function QuotationTab({ searchQuery = '' }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Customer Not Interested');
  const [rejectOtherReason, setRejectOtherReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    vehicle: '',
    hotel: '',
    sightseeing: '',
    driver_allowance: 'Included',
    fuel: 'Included',
    toll_charges: 'Included',
    total_price: '',
    discount: '',
    final_price: '',
    validity_days: '7',
    notes: ''
  });

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleRejectConfirm = async () => {
    setIsRejecting(true);
    const finalReason = rejectReason === 'Other' ? rejectOtherReason : rejectReason;
    try {
      await updateQuotationStatus(selectedQuotation.id, 'Rejected', finalReason);
      setQuotations(prev => prev.map(q => q.id === selectedQuotation.id ? { ...q, status: 'Rejected', rejection_reason: finalReason } : q));
      setSelectedQuotation({ ...selectedQuotation, status: 'Rejected', rejection_reason: finalReason });
      setShowRejectModal(false);
      setToastMessage({ title: 'Quotation Rejected Successfully', message: 'The quotation has been marked as rejected and saved in the quotation history.', type: 'success' });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (error) {
      setToastMessage({ title: 'Rejection Failed', message: 'An error occurred while updating the status.', type: 'error' });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsRejecting(false);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await getQuotations();
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = useMemo(() => {
    if (!searchQuery) return quotations;
    const lower = searchQuery.toLowerCase();
    return quotations.filter(q => 
      (q.full_name && q.full_name.toLowerCase().includes(lower)) ||
      (q.mobile_number && q.mobile_number.toLowerCase().includes(lower)) ||
      (q.destination && q.destination.toLowerCase().includes(lower))
    );
  }, [quotations, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: quotations.length,
      pending: quotations.filter(q => q.status === 'Pending').length,
      successful: quotations.filter(q => q.status === 'Completed').length
    };
  }, [quotations]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateQuotationStatus(id, newStatus);
      setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
      if (selectedQuotation && selectedQuotation.id === id) {
        setSelectedQuotation({ ...selectedQuotation, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleQuoteFormChange = (e) => {
    setQuoteForm({ ...quoteForm, [e.target.name]: e.target.value });
  };

  const downloadExistingPDF = async (q, e) => {
    if (e) e.stopPropagation();
    if (!q.quotation_details) return;
    
    try {
      const details = typeof q.quotation_details === 'string' ? JSON.parse(q.quotation_details) : q.quotation_details;
      const doc = await buildPDFDoc(q, details);
      doc.save(`Quotation_${q.full_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error downloading existing PDF:', err);
      if (setToastMessage) {
        setToastMessage({ title: 'Download Failed', message: 'Could not generate the PDF from saved details.', type: 'error' });
        setTimeout(() => setToastMessage(null), 5000);
      }
    }
  };

  const generatePDF = async () => {
    setPdfGenerating(true);
    
    try {
      const q = selectedQuotation;
      const doc = await buildPDFDoc(q, quoteForm);
      doc.save(`Quotation_${q.full_name.replace(/\s+/g, '_')}.pdf`);

      // Save to database
      await saveQuotationDetails(q.id, quoteForm);
      setQuotations(prev => prev.map(item => item.id === q.id ? { ...item, status: 'Quotation Generated', quotation_details: quoteForm } : item));
      setSelectedQuotation(prev => ({ ...prev, status: 'Quotation Generated', quotation_details: quoteForm }));
      setIsCreating(false);

    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Quotation Generated': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Confirmed Booking': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Completed': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (selectedQuotation) {
    const q = selectedQuotation;
    return (
      <div className="space-y-6">
        <button 
          onClick={() => { setSelectedQuotation(null); setIsCreating(false); }}
          className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span>
          Back to Quotations
        </button>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Quotation Details</h2>
          <span className={`whitespace-nowrap px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(q.status)}`}>
            {q.status}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Customer Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Name</span>
                <span className="font-medium text-white">{q.full_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Mobile Number</span>
                <span className="font-medium text-white">{q.mobile_number}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Email</span>
                <span className="font-medium text-white">{q.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Trip Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Destination</span>
                <span className="font-medium text-white">{q.destination}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Pickup City</span>
                <span className="font-medium text-white">{q.pickup_city || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Travel Date</span>
                <span className="font-medium text-white">{new Date(q.travel_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-white">{q.number_of_days} Days</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Guests</span>
                <span className="font-medium text-white">{q.number_of_adults} Adults, {q.number_of_children} Children</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Budget</span>
                <span className="font-medium text-white">₹{q.approximate_budget || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Vehicle Preference</span>
                <span className="font-medium text-white">{q.vehicle_preference || 'Any'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-400">Hotel Required</span>
                <span className="font-medium text-white">{q.hotel_required}</span>
              </div>
            </div>
          </div>
          
          {q.additional_requirements && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl md:col-span-2">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Additional Requirements</h3>
              <p className="text-sm text-white">{q.additional_requirements}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isCreating && (
          <div className="flex gap-4 border-t border-white/10 pt-6">
            {q.status === 'Pending' && (
              <>
                <button onClick={() => handleStatusUpdate(q.id, 'Accepted')} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-110">
                  Accept Quotation
                </button>
                <button onClick={() => handleStatusUpdate(q.id, 'Rejected')} className="rounded-xl border border-red-500/50 text-red-400 px-6 py-3 text-sm font-bold transition-all hover:bg-red-500/10">
                  Reject Quotation
                </button>
              </>
            )}

            {q.status === 'Accepted' && (
              <button onClick={() => setIsCreating(true)} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-110">
                Create Quotation
              </button>
            )}

            {q.status === 'Quotation Generated' && (
              <>
                <button onClick={() => setIsCreating(true)} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-110">
                  Regenerate Quotation
                </button>
                <button onClick={() => handleStatusUpdate(q.id, 'Completed')} className="rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110">
                  Mark Completed
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)} 
                  className="rounded-xl border border-red-500/50 text-red-500 px-6 py-3 text-sm font-bold transition-all hover:bg-red-500/10"
                >
                  Quotation Rejected
                </button>
              </>
            )}
          </div>
        )}

        {/* Create Quotation Form */}
        {isCreating && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl border-t-4 border-t-secondary mt-6">
            <h3 className="mb-6 text-xl font-bold text-white">Generate Quotation PDF</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Vehicle Provided</label>
                <input name="vehicle" value={quoteForm.vehicle} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="e.g. Innova Crysta" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Hotel Provided</label>
                <input name="hotel" value={quoteForm.hotel} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="e.g. 3 Star Premium" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Sightseeing/Itinerary Brief</label>
                <input name="sightseeing" value={quoteForm.sightseeing} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="e.g. Ooty Local Sightseeing" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Driver Allowance</label>
                  <select name="driver_allowance" value={quoteForm.driver_allowance} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none [&>option]:bg-gray-900">
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Fuel</label>
                  <select name="fuel" value={quoteForm.fuel} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none [&>option]:bg-gray-900">
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Toll & Parking</label>
                  <select name="toll_charges" value={quoteForm.toll_charges} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none [&>option]:bg-gray-900">
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Total Price (₹) *</label>
                <input type="number" required name="total_price" value={quoteForm.total_price} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="e.g. 15000" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Discount (Optional)</label>
                <input type="number" name="discount" value={quoteForm.discount} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="e.g. 1000" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-secondary">Final Price (₹) *</label>
                <input type="number" required name="final_price" value={quoteForm.final_price} onChange={handleQuoteFormChange} className="w-full rounded-xl border border-secondary/50 bg-secondary/10 px-4 py-3 text-lg font-bold text-white focus:border-secondary focus:outline-none" placeholder="e.g. 14000" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-400">Additional Notes / Terms</label>
                <textarea name="notes" value={quoteForm.notes} onChange={handleQuoteFormChange} rows="2" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-secondary focus:outline-none" placeholder="Any specific inclusions or exclusions..."></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={generatePDF}
                disabled={pdfGenerating || !quoteForm.total_price || !quoteForm.final_price}
                className="flex items-center justify-center rounded-xl bg-secondary px-8 py-3 text-sm font-bold text-black transition-all hover:brightness-110 disabled:opacity-50"
              >
                {pdfGenerating ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate & Download PDF'
                )}
              </button>
              <button onClick={() => setIsCreating(false)} className="rounded-xl border border-white/10 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1A1A1A] p-6 shadow-2xl animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Reject Quotation</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1">Are you sure you want to reject this quotation?</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                This action indicates that the customer is no longer interested in the quotation. The quotation will be marked as "Rejected" and will remain available in the quotation history for future reference.
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Reason for Rejection *</label>
                  <select 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 [&>option]:bg-gray-900"
                  >
                    <option value="Customer Not Interested">Customer Not Interested</option>
                    <option value="Budget Issue">Budget Issue</option>
                    <option value="Customer Chose Another Provider">Customer Chose Another Provider</option>
                    <option value="Trip Cancelled">Trip Cancelled</option>
                    <option value="Unable to Contact Customer">Unable to Contact Customer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {rejectReason === 'Other' && (
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Please specify the reason *</label>
                    <textarea 
                      required
                      value={rejectOtherReason}
                      onChange={(e) => setRejectOtherReason(e.target.value)}
                      rows="3"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Type the exact reason here..."
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                  className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRejectConfirm}
                  disabled={isRejecting || (rejectReason === 'Other' && !rejectOtherReason.trim())}
                  className="flex items-center justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                >
                  {isRejecting ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
            <div className={`flex items-start gap-4 rounded-xl border p-4 shadow-2xl ${
              toastMessage.type === 'success' 
                ? 'border-green-500/20 bg-green-500/10 text-green-500' 
                : 'border-red-500/20 bg-red-500/10 text-red-500'
            }`}>
              <span className="material-symbols-outlined shrink-0 mt-0.5">
                {toastMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">{toastMessage.title}</h4>
                <p className="mt-1 text-xs font-medium text-gray-300 max-w-[250px]">{toastMessage.message}</p>
              </div>
              <button onClick={() => setToastMessage(null)} className="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleVerifySubmit = async () => {
    if (!verifyFile) return;
    setVerifyStatus('loading');
    setVerifyResult(null);

    const formData = new FormData();
    formData.append('pdf', verifyFile);

    try {
      const data = await verifyQuotationPdf(formData);
      if (data.success) {
        setVerifyStatus('success');
        setVerifyResult(data.quotation);
      } else {
        setVerifyStatus('error');
        setVerifyResult({ message: data.message || 'This quotation could not be verified.' });
      }
    } catch (err) {
      setVerifyStatus('error');
      setVerifyResult({ message: err.message || 'Network error or backend failure.' });
    }
  };

  const closeVerifyModal = () => {
    setShowVerifyModal(false);
    setVerifyFile(null);
    setVerifyStatus(null);
    setVerifyResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Verify Quotation Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowVerifyModal(true)}
          className="flex items-center gap-2 rounded-full bg-[#EFBF04] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_15px_rgba(239,191,4,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(239,191,4,0.5)]"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          Verify Quotation
        </button>
      </div>

      {/* Dashboard Summary Cards */}
      <section>
        <h2 className="text-xl font-semibold text-white">Quotation Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-400">Total Quotations</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-[#EFBF04]">
              <span className="material-symbols-outlined text-sm">request_quote</span> All Requests
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-400">Pending Quotations</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stats.pending}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-[#EFBF04]">
              <span className="material-symbols-outlined text-sm">pending_actions</span> Needs Action
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition-transform hover:-translate-y-1">
            <h3 className="text-sm font-medium text-gray-400">Successful</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stats.successful}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-[#EFBF04]">
              <span className="material-symbols-outlined text-sm">check_circle</span> Processed
            </div>
          </div>
        </div>
      </section>

      {/* Quotation Listing */}
      <section className="rounded-2xl border border-white/10 bg-white/5 shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quotation Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/5 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Mobile</th>
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Budget</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Download</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading quotations...</td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No quotation requests found.</td>
                  </tr>
                ) : (
                  filteredQuotations.map((q) => (
                    <tr key={q.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-white">{q.full_name}</td>
                      <td className="px-6 py-4">{q.mobile_number}</td>
                      <td className="px-6 py-4">{q.destination}</td>
                      <td className="px-6 py-4">{new Date(q.travel_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">₹{q.approximate_budget}</td>
                      <td className="px-6 py-4">
                        <span className={`whitespace-nowrap px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(q.status)}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {q.quotation_details ? (
                          <button
                            onClick={(e) => downloadExistingPDF(q, e)}
                            title="Download PDF"
                            className="rounded-lg p-2 text-white hover:text-secondary transition-colors hover:bg-white/10"
                          >
                            <span className="material-symbols-outlined text-lg">download</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Quotation PDF was never generated."
                            className="rounded-lg p-2 text-gray-600 cursor-not-allowed group relative"
                          >
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                              Quotation PDF was never generated.
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Verify Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl relative">
              <button 
                onClick={closeVerifyModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">Verify Quotation</h2>
              <p className="text-sm text-gray-400 mb-6">Upload a quotation PDF to verify whether it is authentic.</p>

              {!verifyStatus && (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center hover:bg-white/10 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setVerifyFile(e.target.files[0])}
                      className="hidden" 
                      id="pdf-upload" 
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">upload_file</span>
                      <span className="text-sm font-medium text-white">
                        {verifyFile ? verifyFile.name : 'Click or Drag & Drop PDF here'}
                      </span>
                    </label>
                  </div>
                  <button 
                    onClick={handleVerifySubmit}
                    disabled={!verifyFile}
                    className="w-full rounded-xl bg-[#EFBF04] py-3 font-bold text-black transition-all hover:bg-[#d4a803] disabled:opacity-50"
                  >
                    Submit & Verify
                  </button>
                </div>
              )}

              {verifyStatus === 'loading' && (
                <div className="py-12 flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#EFBF04]"></div>
                  <p className="mt-4 text-sm text-gray-400">Verifying document authenticity...</p>
                </div>
              )}

              {verifyStatus === 'success' && verifyResult && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                  <span className="material-symbols-outlined text-5xl text-green-400 mb-2">verified</span>
                  <h3 className="text-lg font-bold text-green-400">Document Verified</h3>
                  <p className="text-sm text-gray-300 mt-2 mb-4">This quotation is authentic and has not been modified.</p>
                  
                  <div className="space-y-2 text-left bg-black/20 p-4 rounded-lg text-sm text-gray-300">
                    <p><strong className="text-white">Quotation ID:</strong> {verifyResult.quotation_id}</p>
                    <p><strong className="text-white">Customer:</strong> {verifyResult.customer_name}</p>
                    <p><strong className="text-white">Destination:</strong> {verifyResult.destination}</p>
                    <p><strong className="text-white">Generated Date:</strong> {new Date(verifyResult.generated_date).toLocaleDateString()}</p>
                    <p><strong className="text-white">Status:</strong> {verifyResult.status}</p>
                  </div>
                </div>
              )}

              {verifyStatus === 'error' && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                  <span className="material-symbols-outlined text-5xl text-red-400 mb-2">error</span>
                  <h3 className="text-lg font-bold text-red-400">Verification Failed</h3>
                  <p className="text-sm text-gray-300 mt-2">{verifyResult?.message || 'This quotation does not match the original quotation stored in Velvet Pearl\'s system or has been modified.'}</p>
                  <button 
                    onClick={() => { setVerifyStatus(null); setVerifyFile(null); }}
                    className="mt-6 w-full rounded-xl bg-white/10 py-2.5 font-semibold text-white transition-all hover:bg-white/20"
                  >
                    Try Another File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
