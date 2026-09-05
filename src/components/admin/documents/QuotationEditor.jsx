import React, { useMemo, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';

const inputClassName = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';

const blankItem = () => ({
  description: '',
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

const parseDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const normalizeItems = (items = []) => (items.length ? items : [blankItem()]).map((item) => ({
  description: item.description || '',
  quantity: item.quantity ?? 1,
  unit_price: item.unit_price ?? item.rate ?? 0,
  tax_rate: item.tax_rate ?? 0,
}));

const getEnquiryDefaults = (enquiryId, enquiries = []) => {
  const enquiry = enquiries.find((entry) => String(entry.id) === String(enquiryId));
  if (!enquiry) return {};

  const details = parseDetails(enquiry.service_details_json || enquiry.enquiry_details);
  const pickup = details.pickup || details.pickup_location?.label || details.pickup_city || '';
  const dropoff = details.dropoff || details.drop_location?.label || details.destination || details.package_name || '';

  return {
    enquiry_id: enquiryId,
    client_name: enquiry.customer_name || '',
    client_phone: enquiry.phone_number || '',
    client_email: enquiry.email || '',
    subject: `${String(enquiry.enquiry_type || enquiry.service_type || 'Travel').toUpperCase()} enquiry ${enquiry.reference_id || ''}`.trim(),
    pickup,
    dropoff,
    service_summary: enquiry.requirement_notes || [pickup, dropoff].filter(Boolean).join(' to '),
    vehicle_type: details.vehicle_preference || '',
    items: [{
      description: enquiry.requirement_notes || 'Travel service quotation',
      quantity: 1,
      unit_price: enquiry.quote_amount || 0,
      tax_rate: 0,
    }],
  };
};

const buildInitialDraft = (quotation = null, enquiryId = '', enquiries = []) => {
  const defaults = quotation ? {} : getEnquiryDefaults(enquiryId, enquiries);

  return ({
  id: quotation?.id || null,
  enquiry_id: quotation?.enquiry_id || defaults.enquiry_id || enquiryId || '',
  quote_number: quotation?.quote_number || '',
  quote_date: quotation?.quote_date || today(),
  valid_until: quotation?.valid_until || '',
  client_name: quotation?.client_name || defaults.client_name || '',
  client_phone: quotation?.client_phone || defaults.client_phone || '',
  client_email: quotation?.client_email || defaults.client_email || '',
  client_address: quotation?.client_address || '',
  subject: quotation?.subject || defaults.subject || '',
  pickup: quotation?.pickup || defaults.pickup || '',
  dropoff: quotation?.dropoff || defaults.dropoff || '',
  service_summary: quotation?.service_summary || defaults.service_summary || '',
  vehicle_type: quotation?.vehicle_type || defaults.vehicle_type || '',
  discount_amount: quotation?.discount_amount || 0,
  status: quotation?.status || 'draft',
  notes: quotation?.notes || '',
  terms: quotation?.terms || 'Quotation is subject to vehicle availability, route review, tolls, parking, permits, and final confirmation.',
  items: normalizeItems(quotation?.items || defaults.items),
});
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateTotals = (items, discountAmount = 0) => {
  const totals = items.reduce((acc, item) => {
    const lineSubtotal = toNumber(item.quantity) * toNumber(item.unit_price);
    const lineTax = lineSubtotal * (toNumber(item.tax_rate) / 100);
    return {
      subtotal: acc.subtotal + lineSubtotal,
      tax: acc.tax + lineTax,
    };
  }, { subtotal: 0, tax: 0 });

  return {
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: Math.max(0, totals.subtotal + totals.tax - toNumber(discountAmount)),
  };
};

const money = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function QuotationEditor({
  quotation,
  enquiries = [],
  initialEnquiryId = '',
  onClose,
  onSave,
  isSaving = false,
  error = '',
}) {
  const [draft, setDraft] = useState(() => buildInitialDraft(quotation, initialEnquiryId, enquiries));
  const totals = useMemo(() => calculateTotals(draft.items, draft.discount_amount), [draft.items, draft.discount_amount]);

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const applyEnquiryDefaults = (enquiryId) => {
    const enquiry = enquiries.find((entry) => String(entry.id) === String(enquiryId));
    if (!enquiry) {
      updateField('enquiry_id', enquiryId);
      return;
    }

    const details = parseDetails(enquiry.service_details_json || enquiry.enquiry_details);
    const pickup = details.pickup || details.pickup_location?.label || details.pickup_city || '';
    const dropoff = details.dropoff || details.drop_location?.label || details.destination || details.package_name || '';
    const itemHasValues = draft.items.some((item) => item.description || toNumber(item.unit_price) > 0);

    setDraft((current) => ({
      ...current,
      enquiry_id: enquiryId,
      client_name: current.client_name || enquiry.customer_name || '',
      client_phone: current.client_phone || enquiry.phone_number || '',
      client_email: current.client_email || enquiry.email || '',
      subject: current.subject || `${String(enquiry.enquiry_type || enquiry.service_type || 'Travel').toUpperCase()} enquiry ${enquiry.reference_id || ''}`.trim(),
      pickup: current.pickup || pickup,
      dropoff: current.dropoff || dropoff,
      service_summary: current.service_summary || enquiry.requirement_notes || [pickup, dropoff].filter(Boolean).join(' to '),
      vehicle_type: current.vehicle_type || details.vehicle_preference || '',
      items: itemHasValues ? current.items : [{
        description: enquiry.requirement_notes || 'Travel service quotation',
        quantity: 1,
        unit_price: enquiry.quote_amount || 0,
        tax_rate: 0,
      }],
    }));
  };

  const updateItem = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => setDraft((current) => ({ ...current, items: [...current.items, blankItem()] }));
  const removeItem = (index) => {
    setDraft((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...draft,
      subtotal_amount: totals.subtotal,
      tax_amount: totals.tax,
      total_amount: totals.total,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur md:p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-white/10 bg-black/40 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EFBF04]">Quotation editor</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{quotation?.id ? draft.quote_number : 'Create quotation'}</h2>
            <p className="mt-1 text-sm text-gray-400">Prepare a Velvet Pearl quote with editable service, validity, and pricing rows.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2 text-xs font-bold text-black disabled:opacity-60">
              <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save quotation'}
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5">
          {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <section className="grid gap-4 lg:grid-cols-5">
            <div>
              <label className={labelClassName}>From enquiry</label>
              <select className={`${inputClassName} mt-2`} value={draft.enquiry_id} onChange={(event) => applyEnquiryDefaults(event.target.value)}>
                <option value="" className="bg-[#0A0A0A]">No linked enquiry</option>
                {enquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id} className="bg-[#0A0A0A]">
                    {enquiry.reference_id || enquiry.id} - {enquiry.customer_name || 'Customer'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClassName}>Quote number</label>
              <input className={`${inputClassName} mt-2`} value={draft.quote_number} onChange={(event) => updateField('quote_number', event.target.value)} placeholder="Auto if blank" />
            </div>
            <div>
              <label className={labelClassName}>Quote date</label>
              <input type="date" className={`${inputClassName} mt-2`} value={draft.quote_date} onChange={(event) => updateField('quote_date', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Valid until</label>
              <input type="date" className={`${inputClassName} mt-2`} value={draft.valid_until || ''} onChange={(event) => updateField('valid_until', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Status</label>
              <select className={`${inputClassName} mt-2`} value={draft.status} onChange={(event) => updateField('status', event.target.value)}>
                {['draft', 'sent', 'accepted', 'rejected', 'expired'].map((status) => <option key={status} value={status} className="bg-[#0A0A0A]">{status}</option>)}
              </select>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className={labelClassName}>Client name</label>
              <input className={`${inputClassName} mt-2`} value={draft.client_name} onChange={(event) => updateField('client_name', event.target.value)} required />
            </div>
            <div>
              <label className={labelClassName}>Phone</label>
              <input className={`${inputClassName} mt-2`} value={draft.client_phone} onChange={(event) => updateField('client_phone', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Email</label>
              <input type="email" className={`${inputClassName} mt-2`} value={draft.client_email} onChange={(event) => updateField('client_email', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Vehicle type</label>
              <input className={`${inputClassName} mt-2`} value={draft.vehicle_type || ''} onChange={(event) => updateField('vehicle_type', event.target.value)} />
            </div>
            <div className="lg:col-span-4">
              <label className={labelClassName}>Client address</label>
              <textarea rows="2" className={`${inputClassName} mt-2`} value={draft.client_address || ''} onChange={(event) => updateField('client_address', event.target.value)} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClassName}>Subject</label>
              <input className={`${inputClassName} mt-2`} value={draft.subject || ''} onChange={(event) => updateField('subject', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Pickup / drop</label>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <input className={inputClassName} value={draft.pickup || ''} onChange={(event) => updateField('pickup', event.target.value)} placeholder="Pickup" />
                <input className={inputClassName} value={draft.dropoff || ''} onChange={(event) => updateField('dropoff', event.target.value)} placeholder="Drop" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClassName}>Service summary</label>
              <textarea rows="2" className={`${inputClassName} mt-2`} value={draft.service_summary || ''} onChange={(event) => updateField('service_summary', event.target.value)} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Quote items</h3>
              <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/35 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Rate</th>
                    <th className="px-3 py-3 text-right">Tax %</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-3 py-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {draft.items.map((item, index) => {
                    const lineTotal = toNumber(item.quantity) * toNumber(item.unit_price) * (1 + toNumber(item.tax_rate) / 100);
                    return (
                      <tr key={`quotation-item-${index}`}>
                        <td className="min-w-[18rem] px-3 py-3">
                          <input className={inputClassName} value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} required />
                        </td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} /></td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.tax_rate} onChange={(event) => updateItem(index, 'tax_rate', event.target.value)} /></td>
                        <td className="px-3 py-3 text-right font-semibold text-white">{money(lineTotal)}</td>
                        <td className="px-3 py-3 text-right">
                          <button type="button" onClick={() => removeItem(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200" aria-label="Remove quote item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="grid gap-4">
              <div>
                <label className={labelClassName}>Notes</label>
                <textarea rows="2" className={`${inputClassName} mt-2`} value={draft.notes || ''} onChange={(event) => updateField('notes', event.target.value)} />
              </div>
              <div>
                <label className={labelClassName}>Terms</label>
                <textarea rows="3" className={`${inputClassName} mt-2`} value={draft.terms || ''} onChange={(event) => updateField('terms', event.target.value)} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <label className={labelClassName}>Discount</label>
              <input type="number" step="0.01" className={`${inputClassName} mt-2 text-right`} value={draft.discount_amount} onChange={(event) => updateField('discount_amount', event.target.value)} />
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex justify-between text-gray-300"><span>Subtotal</span><span>{money(totals.subtotal)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Tax</span><span>{money(totals.tax)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Discount</span><span>{money(draft.discount_amount)}</span></p>
                <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white"><span>Total</span><span>₹{money(totals.total)}</span></p>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
