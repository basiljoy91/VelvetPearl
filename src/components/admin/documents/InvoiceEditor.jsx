import React, { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import DocumentServiceFields from './DocumentServiceFields';
import {
  AdjustmentEditor,
  blankAdjustment,
  blankItem,
  BottomSaveBar,
  calculateTotals,
  editorInputClassName,
  editorLabelClassName,
  getEnquiryDefaults,
  LineItemsEditor,
  money,
  normalizeAdjustments,
  normalizeItems,
  parseDetails,
  today,
} from './DocumentEditorParts';

const buildInitialDraft = (invoice = null, enquiryId = '', enquiries = []) => {
  const defaults = invoice ? {} : getEnquiryDefaults(enquiryId, enquiries);
  return {
    id: invoice?.id || null,
    enquiry_id: invoice?.enquiry_id || defaults.enquiry_id || enquiryId || '',
    service_type: invoice?.service_type || defaults.service_type || 'cab',
    invoice_number: invoice?.invoice_number || '',
    invoice_date: invoice?.invoice_date || today(),
    due_date: invoice?.due_date || '',
    customer_name: invoice?.customer_name || defaults.customer_name || '',
    customer_phone: invoice?.customer_phone || defaults.customer_phone || '',
    customer_email: invoice?.customer_email || defaults.customer_email || '',
    customer_address: invoice?.customer_address || '',
    booking_reference: invoice?.booking_reference || defaults.booking_reference || '',
    pickup: invoice?.pickup || defaults.pickup || '',
    dropoff: invoice?.dropoff || defaults.dropoff || '',
    trip_details: invoice?.trip_details || defaults.summary || '',
    vehicle_details: invoice?.vehicle_details || defaults.vehicle || '',
    driver_details: invoice?.driver_details || defaults.driver || '',
    service_details_json: parseDetails(invoice?.service_details_json || defaults.service_details_json),
    discount_amount: invoice?.discount_amount || 0,
    tax_rows: normalizeAdjustments(invoice?.tax_rows),
    additional_charges: normalizeAdjustments(invoice?.additional_charges),
    payment_status: invoice?.payment_status || 'unpaid',
    status: invoice?.status || 'draft',
    notes: invoice?.notes || '',
    terms: invoice?.terms || 'Payment is due by the date shown. Tolls, parking, permits, and extra usage are charged only when included above or agreed separately.',
    items: normalizeItems(invoice?.items || defaults.items),
  };
};

export default function InvoiceEditor({ invoice, enquiries = [], initialEnquiryId = '', onClose, onSave, isSaving = false, error = '' }) {
  const [draft, setDraft] = useState(() => buildInitialDraft(invoice, initialEnquiryId, enquiries));
  const totals = useMemo(() => calculateTotals(draft.items, draft.discount_amount, draft.tax_rows, draft.additional_charges), [draft.additional_charges, draft.discount_amount, draft.items, draft.tax_rows]);

  const updateField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const updateDetail = (field, value) => setDraft((current) => ({
    ...current,
    service_details_json: { ...current.service_details_json, [field]: value },
  }));

  const applyEnquiryDefaults = (enquiryId) => {
    const defaults = getEnquiryDefaults(enquiryId, enquiries);
    if (!defaults.enquiry_id) {
      updateField('enquiry_id', enquiryId);
      return;
    }

    setDraft((current) => {
      const hasLineItem = current.items.some((item) => item.description || Number(item.unit_price) > 0);
      return {
        ...current,
        enquiry_id: enquiryId,
        service_type: defaults.service_type,
        customer_name: current.customer_name || defaults.customer_name,
        customer_phone: current.customer_phone || defaults.customer_phone,
        customer_email: current.customer_email || defaults.customer_email,
        booking_reference: current.booking_reference || defaults.booking_reference,
        pickup: current.pickup || defaults.pickup,
        dropoff: current.dropoff || defaults.dropoff,
        trip_details: current.trip_details || defaults.summary,
        vehicle_details: current.vehicle_details || defaults.vehicle,
        driver_details: current.driver_details || defaults.driver,
        service_details_json: { ...defaults.service_details_json, ...current.service_details_json },
        items: hasLineItem ? current.items : normalizeItems(defaults.items),
      };
    });
  };

  const updateItem = (index, field, value) => setDraft((current) => ({
    ...current,
    items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
  }));
  const addItem = () => setDraft((current) => ({ ...current, items: [...current.items, blankItem()] }));
  const removeItem = (index) => setDraft((current) => ({
    ...current,
    items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
  }));
  const updateAdjustment = (field, index, key, value) => setDraft((current) => ({
    ...current,
    [field]: current[field].map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
  }));
  const addAdjustment = (field) => setDraft((current) => ({ ...current, [field]: [...current[field], blankAdjustment()] }));
  const removeAdjustment = (field, index) => setDraft((current) => ({
    ...current,
    [field]: current[field].filter((_, rowIndex) => rowIndex !== index),
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({ ...draft, subtotal_amount: totals.subtotal, tax_amount: totals.tax, total_amount: totals.total });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur md:p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-white/10 bg-black/40 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EFBF04]">Invoice editor</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{invoice?.id ? draft.invoice_number : 'Create invoice'}</h2>
            <p className="mt-1 text-sm text-gray-400">Choose the service first, then record only the details that belong on the customer document.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white"><X className="h-4 w-4" /> Cancel</button>
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2 text-xs font-bold text-black disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save invoice'}</button>
          </div>
        </header>

        <div className="space-y-7 p-4 md:p-5">
          {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className={editorLabelClassName}>Create from enquiry</label>
              <select className={`${editorInputClassName} mt-2`} value={draft.enquiry_id} onChange={(event) => applyEnquiryDefaults(event.target.value)}>
                <option value="" className="bg-[#0A0A0A]">Manual invoice</option>
                {enquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id} className="bg-[#0A0A0A]">{enquiry.reference_id || enquiry.id} - {enquiry.customer_name || 'Customer'}</option>)}
              </select>
            </div>
            <div><label className={editorLabelClassName}>Invoice number</label><input className={`${editorInputClassName} mt-2`} value={draft.invoice_number} onChange={(event) => updateField('invoice_number', event.target.value)} placeholder="Generated if blank" /></div>
            <div><label className={editorLabelClassName}>Invoice date</label><input type="date" className={`${editorInputClassName} mt-2`} value={draft.invoice_date} onChange={(event) => updateField('invoice_date', event.target.value)} /></div>
            <div><label className={editorLabelClassName}>Due date</label><input type="date" className={`${editorInputClassName} mt-2`} value={draft.due_date || ''} onChange={(event) => updateField('due_date', event.target.value)} /></div>
          </section>

          <section>
            <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFBF04]">Customer</p><h3 className="mt-1 text-lg font-semibold text-white">Billing details</h3></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div><label className={editorLabelClassName}>Customer name</label><input required className={`${editorInputClassName} mt-2`} value={draft.customer_name} onChange={(event) => updateField('customer_name', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Phone</label><input className={`${editorInputClassName} mt-2`} value={draft.customer_phone} onChange={(event) => updateField('customer_phone', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Email</label><input type="email" className={`${editorInputClassName} mt-2`} value={draft.customer_email} onChange={(event) => updateField('customer_email', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Booking reference</label><input className={`${editorInputClassName} mt-2`} value={draft.booking_reference} onChange={(event) => updateField('booking_reference', event.target.value)} /></div>
              <div className="md:col-span-2 lg:col-span-4"><label className={editorLabelClassName}>Billing address</label><textarea rows="2" className={`${editorInputClassName} mt-2`} value={draft.customer_address || ''} onChange={(event) => updateField('customer_address', event.target.value)} /></div>
            </div>
          </section>

          <DocumentServiceFields draft={draft} documentType="invoice" onFieldChange={updateField} onDetailChange={updateDetail} />

          <section className="grid gap-4 md:grid-cols-3">
            <div><label className={editorLabelClassName}>Invoice status</label><select className={`${editorInputClassName} mt-2`} value={draft.status} onChange={(event) => updateField('status', event.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></div>
            <div><label className={editorLabelClassName}>Payment status</label><select className={`${editorInputClassName} mt-2`} value={draft.payment_status} onChange={(event) => updateField('payment_status', event.target.value)}><option value="unpaid">Unpaid</option><option value="partial">Part paid</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select></div>
          </section>

          <LineItemsEditor items={draft.items} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />

          <section className="grid gap-4 lg:grid-cols-2">
            <AdjustmentEditor title="Tax rows" rows={draft.tax_rows} onAdd={() => addAdjustment('tax_rows')} onUpdate={(index, key, value) => updateAdjustment('tax_rows', index, key, value)} onRemove={(index) => removeAdjustment('tax_rows', index)} />
            <AdjustmentEditor title="Additional charges" rows={draft.additional_charges} onAdd={() => addAdjustment('additional_charges')} onUpdate={(index, key, value) => updateAdjustment('additional_charges', index, key, value)} onRemove={(index) => removeAdjustment('additional_charges', index)} />
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="grid gap-4">
              <div><label className={editorLabelClassName}>Customer note</label><textarea rows="2" className={`${editorInputClassName} mt-2`} value={draft.notes || ''} onChange={(event) => updateField('notes', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Terms and payment notes</label><textarea rows="4" className={`${editorInputClassName} mt-2`} value={draft.terms || ''} onChange={(event) => updateField('terms', event.target.value)} /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <label className={editorLabelClassName}>Discount</label>
              <input type="number" min="0" step="0.01" className={`${editorInputClassName} mt-2 text-right`} value={draft.discount_amount} onChange={(event) => updateField('discount_amount', event.target.value)} />
              <div className="mt-5 space-y-2 text-sm">
                <p className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{money(totals.subtotal)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Tax</span><span>₹{money(totals.tax)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Other charges</span><span>₹{money(totals.charges)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Discount</span><span>-₹{money(draft.discount_amount)}</span></p>
                <p className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"><span>Total</span><span>₹{money(totals.total)}</span></p>
              </div>
            </div>
          </section>
        </div>

        <BottomSaveBar label="Save invoice" isSaving={isSaving} onClose={onClose} />
      </form>
    </div>
  );
}
