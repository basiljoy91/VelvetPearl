import React, { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import InvoiceActions from './InvoiceActions';
import InvoicePreview from './InvoicePreview';

const missing = (value) => (value === undefined || value === null || value === '' ? undefined : value);
const parseDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
};
const first = (...values) => values.find((item) => missing(item) !== undefined);
const money = (value) => {
  if (missing(value) === undefined) return undefined;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};
const displayDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};
const resolvePaymentStatus = (...values) => {
  const value = first(...values);
  if (!value) return undefined;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'complete' || normalized === 'completed') return 'Complete';
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'pending') return 'Pending';
  return undefined;
};

function toInvoice(enquiry) {
  const details = parseDetails(enquiry?.service_details_json || enquiry?.enquiry_details);
  const baseFare = money(first(enquiry?.quote_amount, details.quote_amount));
  const extraCharges = money(first(enquiry?.extra_charges, details.extra_charges));
  const gst = money(first(enquiry?.gst, details.gst));
  const advancePayment = money(first(enquiry?.advance_payment, details.advance_payment));
  const subtotal = baseFare !== undefined && extraCharges !== undefined ? baseFare + extraCharges : undefined;
  const grandTotal = subtotal !== undefined && gst !== undefined ? subtotal + gst : undefined;
  const balanceDue = grandTotal !== undefined && advancePayment !== undefined ? grandTotal - advancePayment : undefined;

  return {
    invoiceNumber: first(enquiry?.invoice_number, enquiry?.reference_id),
    invoiceDate: displayDate(first(enquiry?.invoice_date, enquiry?.submitted_at, enquiry?.created_at)),
    bookingId: first(enquiry?.reference_id, enquiry?.booking_id),
    paymentStatus: resolvePaymentStatus(
      enquiry?.payment_status,
      enquiry?.paymentStatus,
      details.payment_status,
      details.paymentStatus,
      enquiry?.status,
    ),
    dueDate: displayDate(first(enquiry?.due_date, details.due_date)),
    customerName: first(enquiry?.customer_name, enquiry?.customer),
    phoneNumber: first(enquiry?.phone_number, enquiry?.phone),
    email: enquiry?.email,
    pickupLocation: first(enquiry?.pickup_location, details.pickup, details.pickup_location),
    dropLocation: first(enquiry?.drop_location, details.dropoff, details.drop_location),
    travelDate: displayDate(first(enquiry?.travel_date, details.pickup_date, details.travel_window_start, details.check_in)),
    vehicleType: first(enquiry?.vehicle_type, details.vehicle_preference, enquiry?.assigned_vehicle_id),
    serviceType: first(enquiry?.service_type, enquiry?.enquiry_type),
    passengers: first(enquiry?.passenger_count, details.passengers, details.group_size, details.guests),
    baseFare, extraCharges, gst, subtotal, grandTotal, advancePayment, balanceDue,
    notes: first(enquiry?.requirement_notes, details.requirement_notes, details.notes),
    terms: first(enquiry?.terms, details.terms),
    paymentMethods: first(enquiry?.payment_methods, details.payment_methods),
    companyAddress: first(enquiry?.company_address, details.company_address),
    companyPhone: first(enquiry?.company_phone, details.company_phone),
    companyEmail: first(enquiry?.company_email, details.company_email),
    companyWebsite: first(enquiry?.company_website, details.company_website),
  };
}

export default function InvoiceModal({ enquiry, isOpen, onClose }) {
  const invoice = useMemo(() => toInvoice(enquiry), [enquiry]);
  const invoiceRef = useRef(null);
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 7;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const naturalHeight = (canvas.height * usableWidth) / canvas.width;
    const scale = Math.min(1, usableHeight / naturalHeight);
    const imageWidth = usableWidth * scale;
    const imageHeight = naturalHeight * scale;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pageWidth - imageWidth) / 2, margin, imageWidth, imageHeight, undefined, 'FAST');
    pdf.save(`Invoice-${invoice.invoiceNumber || 'booking'}.pdf`);
  };
  if (!isOpen || !enquiry) return null;
  return <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm"><div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="font-semibold text-slate-900">Invoice Preview</p><p className="text-sm text-slate-500">Review and download this database-driven invoice.</p></div><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Close</button></div><div className="bg-slate-100 p-3 sm:p-5"><div id="invoice-print-area" ref={invoiceRef} className="mx-auto w-full max-w-[195mm] bg-white"><InvoicePreview invoice={invoice} /></div></div><div className="border-t border-slate-200 px-5 py-4"><InvoiceActions onDownloadPdf={handleDownloadPdf} onClose={onClose} /></div></div></div>;
}
