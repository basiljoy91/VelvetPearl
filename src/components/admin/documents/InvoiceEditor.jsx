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

const blankAdjustment = () => ({
  label: '',
  amount: 0,
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

const normalizeAdjustments = (rows = []) => (Array.isArray(rows) ? rows : []).map((row) => ({
  label: row.label || row.name || '',
  amount: row.amount ?? 0,
}));

const getEnquiryDefaults = (enquiryId, enquiries = []) => {
  const enquiry = enquiries.find((entry) => String(entry.id) === String(enquiryId));
  if (!enquiry) return {};

  const details = parseDetails(enquiry.service_details_json || enquiry.enquiry_details);
  const pickup = details.pickup || details.pickup_location?.label || '';
  const dropoff = details.dropoff || details.drop_location?.label || '';

  return {
    enquiry_id: enquiryId,
    customer_name: enquiry.customer_name || '',
    customer_phone: enquiry.phone_number || '',
    customer_email: enquiry.email || '',
    booking_reference: enquiry.reference_id || '',
    pickup,
    dropoff,
    trip_details: [details.trip_type, details.pickup_date || enquiry.travel_date, details.pickup_time || enquiry.travel_time].filter(Boolean).join(' | ') || enquiry.requirement_notes || '',
    vehicle_details: details.vehicle_preference || enquiry.assigned_vehicle_id || '',
    driver_details: enquiry.assigned_driver_name || enquiry.assigned_driver_id || '',
    items: [{
      description: enquiry.requirement_notes || 'Cab booking service',
      quantity: 1,
      unit_price: enquiry.quote_amount || 0,
      tax_rate: 0,
    }],
  };
};

const buildInitialDraft = (invoice = null, enquiryId = '', enquiries = []) => {
  const defaults = invoice ? {} : getEnquiryDefaults(enquiryId, enquiries);

  return ({
  id: invoice?.id || null,
  enquiry_id: invoice?.enquiry_id || defaults.enquiry_id || enquiryId || '',
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
  trip_details: invoice?.trip_details || defaults.trip_details || '',
  vehicle_details: invoice?.vehicle_details || defaults.vehicle_details || '',
  driver_details: invoice?.driver_details || defaults.driver_details || '',
  discount_amount: invoice?.discount_amount || 0,
  tax_rows: normalizeAdjustments(invoice?.tax_rows),
  additional_charges: normalizeAdjustments(invoice?.additional_charges),
  payment_status: invoice?.payment_status || 'unpaid',
  status: invoice?.status || 'draft',
  notes: invoice?.notes || '',
  terms: invoice?.terms || 'Final invoice is subject to agreed route, tolls, parking, permits, and service details.',
  items: normalizeItems(invoice?.items || defaults.items),
});
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateTotals = (items, discountAmount = 0, taxRows = [], additionalCharges = []) => {
  const totals = items.reduce((acc, item) => {
    const lineSubtotal = toNumber(item.quantity) * toNumber(item.unit_price);
    const lineTax = lineSubtotal * (toNumber(item.tax_rate) / 100);
    return {
      subtotal: acc.subtotal + lineSubtotal,
      tax: acc.tax + lineTax,
    };
  }, { subtotal: 0, tax: 0 });

  const taxRowsTotal = taxRows.reduce((total, row) => total + toNumber(row.amount), 0);
  const additionalChargesTotal = additionalCharges.reduce((total, row) => total + toNumber(row.amount), 0);

  return {
    subtotal: totals.subtotal,
    tax: totals.tax + taxRowsTotal,
    additionalCharges: additionalChargesTotal,
    total: Math.max(0, totals.subtotal + totals.tax + taxRowsTotal + additionalChargesTotal - toNumber(discountAmount)),
  };
};

function AdjustmentEditor({ title, rows, onAdd, onUpdate, onRemove }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white">
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.length === 0 && <p className="text-xs text-gray-500">No rows added.</p>}
        {rows.map((row, index) => (
          <div key={`${title}-${index}`} className="grid grid-cols-[1fr_7rem_auto] gap-2">
            <input className={inputClassName} value={row.label} onChange={(event) => onUpdate(index, 'label', event.target.value)} placeholder="Label" />
            <input type="number" step="0.01" className={`${inputClassName} text-right`} value={row.amount} onChange={(event) => onUpdate(index, 'amount', event.target.value)} placeholder="Amount" />
            <button type="button" onClick={() => onRemove(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200" aria-label={`Remove ${title.toLowerCase()} row`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const money = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function InvoiceEditor({
  invoice,
  enquiries = [],
  initialEnquiryId = '',
  onClose,
  onSave,
  isSaving = false,
  error = '',
}) {
  const [draft, setDraft] = useState(() => buildInitialDraft(invoice, initialEnquiryId, enquiries));
  const totals = useMemo(() => calculateTotals(
    draft.items,
    draft.discount_amount,
    draft.tax_rows,
    draft.additional_charges,
  ), [draft.additional_charges, draft.discount_amount, draft.items, draft.tax_rows]);

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
    const pickup = details.pickup || details.pickup_location?.label || '';
    const dropoff = details.dropoff || details.drop_location?.label || '';
    const itemHasValues = draft.items.some((item) => item.description || toNumber(item.unit_price) > 0);

    setDraft((current) => ({
      ...current,
      enquiry_id: enquiryId,
      customer_name: current.customer_name || enquiry.customer_name || '',
      customer_phone: current.customer_phone || enquiry.phone_number || '',
      customer_email: current.customer_email || enquiry.email || '',
      booking_reference: current.booking_reference || enquiry.reference_id || '',
      pickup: current.pickup || pickup,
      dropoff: current.dropoff || dropoff,
      trip_details: current.trip_details || [details.trip_type, details.pickup_date || enquiry.travel_date, details.pickup_time || enquiry.travel_time].filter(Boolean).join(' | ') || enquiry.requirement_notes || '',
      vehicle_details: current.vehicle_details || details.vehicle_preference || enquiry.assigned_vehicle_id || '',
      driver_details: current.driver_details || enquiry.assigned_driver_name || enquiry.assigned_driver_id || '',
      items: itemHasValues ? current.items : [{
        description: enquiry.requirement_notes || 'Cab booking service',
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

  const addItem = () => {
    setDraft((current) => ({ ...current, items: [...current.items, blankItem()] }));
  };

  const removeItem = (index) => {
    setDraft((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateAdjustment = (field, index, key, value) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }));
  };

  const addAdjustment = (field) => {
    setDraft((current) => ({ ...current, [field]: [...current[field], blankAdjustment()] }));
  };

  const removeAdjustment = (field, index) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].filter((_row, rowIndex) => rowIndex !== index),
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
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EFBF04]">Invoice editor</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{invoice?.id ? draft.invoice_number : 'Create invoice'}</h2>
            <p className="mt-1 text-sm text-gray-400">Build a saved invoice with editable customer, route, tax, and payment details.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2 text-xs font-bold text-black disabled:opacity-60">
              <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save invoice'}
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <section className="grid gap-4 lg:grid-cols-4">
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
              <label className={labelClassName}>Invoice number</label>
              <input className={`${inputClassName} mt-2`} value={draft.invoice_number} onChange={(event) => updateField('invoice_number', event.target.value)} placeholder="Auto if blank" />
            </div>
            <div>
              <label className={labelClassName}>Invoice date</label>
              <input type="date" className={`${inputClassName} mt-2`} value={draft.invoice_date} onChange={(event) => updateField('invoice_date', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Due date</label>
              <input type="date" className={`${inputClassName} mt-2`} value={draft.due_date || ''} onChange={(event) => updateField('due_date', event.target.value)} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className={labelClassName}>Customer name</label>
              <input className={`${inputClassName} mt-2`} value={draft.customer_name} onChange={(event) => updateField('customer_name', event.target.value)} required />
            </div>
            <div>
              <label className={labelClassName}>Phone</label>
              <input className={`${inputClassName} mt-2`} value={draft.customer_phone} onChange={(event) => updateField('customer_phone', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Email</label>
              <input type="email" className={`${inputClassName} mt-2`} value={draft.customer_email} onChange={(event) => updateField('customer_email', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Booking reference</label>
              <input className={`${inputClassName} mt-2`} value={draft.booking_reference} onChange={(event) => updateField('booking_reference', event.target.value)} />
            </div>
            <div className="lg:col-span-4">
              <label className={labelClassName}>Customer address</label>
              <textarea rows="2" className={`${inputClassName} mt-2`} value={draft.customer_address || ''} onChange={(event) => updateField('customer_address', event.target.value)} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className={labelClassName}>Pickup</label>
              <input className={`${inputClassName} mt-2`} value={draft.pickup || ''} onChange={(event) => updateField('pickup', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Drop</label>
              <input className={`${inputClassName} mt-2`} value={draft.dropoff || ''} onChange={(event) => updateField('dropoff', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Payment status</label>
              <select className={`${inputClassName} mt-2`} value={draft.payment_status} onChange={(event) => updateField('payment_status', event.target.value)}>
                {['unpaid', 'partial', 'paid', 'refunded'].map((status) => <option key={status} value={status} className="bg-[#0A0A0A]">{status}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClassName}>Vehicle details</label>
              <input className={`${inputClassName} mt-2`} value={draft.vehicle_details || ''} onChange={(event) => updateField('vehicle_details', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Driver details</label>
              <input className={`${inputClassName} mt-2`} value={draft.driver_details || ''} onChange={(event) => updateField('driver_details', event.target.value)} />
            </div>
            <div>
              <label className={labelClassName}>Status</label>
              <select className={`${inputClassName} mt-2`} value={draft.status} onChange={(event) => updateField('status', event.target.value)}>
                {['draft', 'sent', 'paid', 'cancelled'].map((status) => <option key={status} value={status} className="bg-[#0A0A0A]">{status}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3">
              <label className={labelClassName}>Trip details</label>
              <textarea rows="2" className={`${inputClassName} mt-2`} value={draft.trip_details || ''} onChange={(event) => updateField('trip_details', event.target.value)} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Line items</h3>
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
                    <th className="px-3 py-3 text-right">Line total</th>
                    <th className="px-3 py-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {draft.items.map((item, index) => {
                    const lineTotal = toNumber(item.quantity) * toNumber(item.unit_price) * (1 + toNumber(item.tax_rate) / 100);
                    return (
                      <tr key={`invoice-item-${index}`}>
                        <td className="min-w-[18rem] px-3 py-3">
                          <input className={inputClassName} value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} required />
                        </td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} /></td>
                        <td className="px-3 py-3"><input type="number" step="0.01" className={`${inputClassName} text-right`} value={item.tax_rate} onChange={(event) => updateItem(index, 'tax_rate', event.target.value)} /></td>
                        <td className="px-3 py-3 text-right font-semibold text-white">{money(lineTotal)}</td>
                        <td className="px-3 py-3 text-right">
                          <button type="button" onClick={() => removeItem(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200" aria-label="Remove line item">
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

          <section className="grid gap-4 lg:grid-cols-2">
            <AdjustmentEditor
              title="Tax rows"
              rows={draft.tax_rows}
              onAdd={() => addAdjustment('tax_rows')}
              onUpdate={(index, key, value) => updateAdjustment('tax_rows', index, key, value)}
              onRemove={(index) => removeAdjustment('tax_rows', index)}
            />
            <AdjustmentEditor
              title="Additional charges"
              rows={draft.additional_charges}
              onAdd={() => addAdjustment('additional_charges')}
              onUpdate={(index, key, value) => updateAdjustment('additional_charges', index, key, value)}
              onRemove={(index) => removeAdjustment('additional_charges', index)}
            />
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
                <p className="flex justify-between text-gray-300"><span>Additional</span><span>{money(totals.additionalCharges)}</span></p>
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
