import React, { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import DocumentServiceFields, { getServiceLabel } from './DocumentServiceFields';
import {
  blankItem,
  BottomSaveBar,
  calculateTotals,
  editorInputClassName,
  editorLabelClassName,
  getEnquiryDefaults,
  LineItemsEditor,
  money,
  normalizeItems,
  parseDetails,
  today,
} from './DocumentEditorParts';

const buildInitialDraft = (quotation = null, enquiryId = '', enquiries = []) => {
  const defaults = quotation ? {} : getEnquiryDefaults(enquiryId, enquiries);
  const serviceType = quotation?.service_type || defaults.service_type || 'cab';
  return {
    id: quotation?.id || null,
    enquiry_id: quotation?.enquiry_id || defaults.enquiry_id || enquiryId || '',
    service_type: serviceType,
    quote_number: quotation?.quote_number || '',
    quote_date: quotation?.quote_date || today(),
    valid_until: quotation?.valid_until || '',
    status: quotation?.status || 'draft',
    client_name: quotation?.client_name || defaults.customer_name || '',
    client_phone: quotation?.client_phone || defaults.customer_phone || '',
    client_email: quotation?.client_email || defaults.customer_email || '',
    client_address: quotation?.client_address || '',
    subject: quotation?.subject || `${getServiceLabel(serviceType)} quotation`,
    pickup: quotation?.pickup || defaults.pickup || '',
    dropoff: quotation?.dropoff || defaults.dropoff || '',
    service_summary: quotation?.service_summary || defaults.summary || '',
    vehicle_type: quotation?.vehicle_type || defaults.vehicle || '',
    service_details_json: parseDetails(quotation?.service_details_json || defaults.service_details_json),
    discount_amount: quotation?.discount_amount || 0,
    total_in_words: quotation?.total_in_words || '',
    notes: quotation?.notes || '',
    terms: quotation?.terms || 'Rates are valid until the date shown and remain subject to availability. Any excluded tolls, parking, permits, or additional usage will be confirmed before service.',
    items: normalizeItems(quotation?.items || defaults.items),
  };
};

export default function QuotationEditor({ quotation, enquiries = [], initialEnquiryId = '', onClose, onSave, isSaving = false, error = '' }) {
  const [draft, setDraft] = useState(() => buildInitialDraft(quotation, initialEnquiryId, enquiries));
  const totals = useMemo(() => calculateTotals(draft.items, draft.discount_amount), [draft.discount_amount, draft.items]);

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
        client_name: current.client_name || defaults.customer_name,
        client_phone: current.client_phone || defaults.customer_phone,
        client_email: current.client_email || defaults.customer_email,
        pickup: current.pickup || defaults.pickup,
        dropoff: current.dropoff || defaults.dropoff,
        service_summary: current.service_summary || defaults.summary,
        vehicle_type: current.vehicle_type || defaults.vehicle,
        subject: current.subject || `${getServiceLabel(defaults.service_type)} quotation`,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({ ...draft, subtotal_amount: totals.subtotal, tax_amount: totals.tax, total_amount: totals.total });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur md:p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-white/10 bg-black/40 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EFBF04]">Quotation editor</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{quotation?.id ? draft.quote_number : 'Create quotation'}</h2>
            <p className="mt-1 text-sm text-gray-400">Prepare a clear service-specific offer that the customer can understand without extra explanation.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white"><X className="h-4 w-4" /> Cancel</button>
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2 text-xs font-bold text-black disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save quotation'}</button>
          </div>
        </header>

        <div className="space-y-7 p-4 md:p-5">
          {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className={editorLabelClassName}>Create from enquiry</label>
              <select className={`${editorInputClassName} mt-2`} value={draft.enquiry_id} onChange={(event) => applyEnquiryDefaults(event.target.value)}>
                <option value="" className="bg-[#0A0A0A]">Manual quotation</option>
                {enquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id} className="bg-[#0A0A0A]">{enquiry.reference_id || enquiry.id} - {enquiry.customer_name || 'Customer'}</option>)}
              </select>
            </div>
            <div><label className={editorLabelClassName}>Quote number</label><input className={`${editorInputClassName} mt-2`} value={draft.quote_number} onChange={(event) => updateField('quote_number', event.target.value)} placeholder="Generated if blank" /></div>
            <div><label className={editorLabelClassName}>Quote date</label><input type="date" className={`${editorInputClassName} mt-2`} value={draft.quote_date} onChange={(event) => updateField('quote_date', event.target.value)} /></div>
            <div><label className={editorLabelClassName}>Valid until</label><input type="date" className={`${editorInputClassName} mt-2`} value={draft.valid_until || ''} onChange={(event) => updateField('valid_until', event.target.value)} /></div>
          </section>

          <section>
            <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFBF04]">Client</p><h3 className="mt-1 text-lg font-semibold text-white">Contact and proposal details</h3></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div><label className={editorLabelClassName}>Client name</label><input required className={`${editorInputClassName} mt-2`} value={draft.client_name} onChange={(event) => updateField('client_name', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Phone</label><input className={`${editorInputClassName} mt-2`} value={draft.client_phone} onChange={(event) => updateField('client_phone', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Email</label><input type="email" className={`${editorInputClassName} mt-2`} value={draft.client_email} onChange={(event) => updateField('client_email', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Status</label><select className={`${editorInputClassName} mt-2`} value={draft.status} onChange={(event) => updateField('status', event.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="expired">Expired</option></select></div>
              <div className="md:col-span-2"><label className={editorLabelClassName}>Subject</label><input className={`${editorInputClassName} mt-2`} value={draft.subject || ''} onChange={(event) => updateField('subject', event.target.value)} /></div>
              <div className="md:col-span-2"><label className={editorLabelClassName}>Client address</label><textarea rows="2" className={`${editorInputClassName} mt-2`} value={draft.client_address || ''} onChange={(event) => updateField('client_address', event.target.value)} /></div>
            </div>
          </section>

          <DocumentServiceFields draft={draft} documentType="quotation" onFieldChange={updateField} onDetailChange={updateDetail} />

          <LineItemsEditor items={draft.items} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />

          <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="grid gap-4">
              <div><label className={editorLabelClassName}>Notes for customer</label><textarea rows="2" className={`${editorInputClassName} mt-2`} value={draft.notes || ''} onChange={(event) => updateField('notes', event.target.value)} /></div>
              <div><label className={editorLabelClassName}>Terms, inclusions, and exclusions</label><textarea rows="5" className={`${editorInputClassName} mt-2`} value={draft.terms || ''} onChange={(event) => updateField('terms', event.target.value)} /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <label className={editorLabelClassName}>Discount</label>
              <input type="number" min="0" step="0.01" className={`${editorInputClassName} mt-2 text-right`} value={draft.discount_amount} onChange={(event) => updateField('discount_amount', event.target.value)} />
              <div className="mt-5 space-y-2 text-sm">
                <p className="flex justify-between text-gray-300"><span>Subtotal</span><span>₹{money(totals.subtotal)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Tax</span><span>₹{money(totals.tax)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Discount</span><span>-₹{money(draft.discount_amount)}</span></p>
                <p className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"><span>Total</span><span>₹{money(totals.total)}</span></p>
              </div>
              <div className="mt-5"><label className={editorLabelClassName}>Total in words</label><textarea rows="3" className={`${editorInputClassName} mt-2`} value={draft.total_in_words || ''} onChange={(event) => updateField('total_in_words', event.target.value)} placeholder="Generated automatically if blank" /></div>
            </div>
          </section>
        </div>

        <BottomSaveBar label="Save quotation" isSaving={isSaving} onClose={onClose} />
      </form>
    </div>
  );
}
