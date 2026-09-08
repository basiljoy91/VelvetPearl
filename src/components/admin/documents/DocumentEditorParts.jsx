import React from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { getServiceLabel, normalizeServiceType } from './DocumentServiceFields';

export const editorInputClassName = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50';
export const editorLabelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';

export const blankItem = () => ({ description: '', quantity: 1, unit_price: 0, tax_rate: 0 });
export const blankAdjustment = () => ({ label: '', amount: 0 });
export const today = () => new Date().toISOString().slice(0, 10);

export const parseDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const normalizeItems = (items = []) => (items.length ? items : [blankItem()]).map((item) => ({
  description: item.description || '',
  quantity: item.quantity ?? 1,
  unit_price: item.unit_price ?? item.rate ?? 0,
  tax_rate: item.tax_rate ?? 0,
}));

export const normalizeAdjustments = (rows = []) => (Array.isArray(rows) ? rows : []).map((row) => ({
  label: row.label || row.name || '',
  amount: row.amount ?? 0,
}));

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateTotals = (items, discountAmount = 0, taxRows = [], additionalCharges = []) => {
  const totals = items.reduce((acc, item) => {
    const lineSubtotal = toNumber(item.quantity) * toNumber(item.unit_price);
    return {
      subtotal: acc.subtotal + lineSubtotal,
      tax: acc.tax + (lineSubtotal * (toNumber(item.tax_rate) / 100)),
    };
  }, { subtotal: 0, tax: 0 });

  const explicitTax = taxRows.reduce((total, row) => total + toNumber(row.amount), 0);
  const charges = additionalCharges.reduce((total, row) => total + toNumber(row.amount), 0);
  return {
    subtotal: totals.subtotal,
    tax: totals.tax + explicitTax,
    charges,
    total: Math.max(0, totals.subtotal + totals.tax + explicitTax + charges - toNumber(discountAmount)),
  };
};

export const money = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const getEnquiryDefaults = (enquiryId, enquiries = []) => {
  const enquiry = enquiries.find((entry) => String(entry.id) === String(enquiryId));
  if (!enquiry) return {};

  const details = parseDetails(enquiry.service_details_json || enquiry.enquiry_details);
  const serviceType = normalizeServiceType(enquiry.enquiry_type || enquiry.service_type);
  const pickup = details.pickup || details.pickup_location?.label || details.pickup_city || '';
  const dropoff = details.dropoff || details.drop_location?.label || '';
  const serviceLabel = getServiceLabel(serviceType);

  return {
    enquiry_id: enquiryId,
    service_type: serviceType,
    customer_name: enquiry.customer_name || '',
    customer_phone: enquiry.phone_number || '',
    customer_email: enquiry.email || '',
    booking_reference: enquiry.reference_id || '',
    pickup,
    dropoff,
    summary: enquiry.requirement_notes || [pickup, dropoff].filter(Boolean).join(' to '),
    vehicle: details.vehicle_preference || enquiry.assigned_vehicle_id || '',
    driver: enquiry.assigned_driver_name || enquiry.assigned_driver_id || '',
    service_details_json: details,
    items: [{
      description: enquiry.requirement_notes || `${serviceLabel} service`,
      quantity: 1,
      unit_price: enquiry.quote_amount || 0,
      tax_rate: 0,
    }],
  };
};

export function AdjustmentEditor({ title, rows, onAdd, onUpdate, onRemove }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
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
            <input className={editorInputClassName} value={row.label} onChange={(event) => onUpdate(index, 'label', event.target.value)} placeholder="Label" />
            <input type="number" step="0.01" className={`${editorInputClassName} text-right`} value={row.amount} onChange={(event) => onUpdate(index, 'amount', event.target.value)} placeholder="Amount" />
            <button type="button" onClick={() => onRemove(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200" aria-label={`Remove ${title.toLowerCase()} row`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineItemsEditor({ items, onAdd, onUpdate, onRemove }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFBF04]">Charges</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Line items</h3>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[780px] w-full text-left text-sm">
          <thead className="bg-black/45 text-[10px] uppercase tracking-[0.16em] text-gray-500">
            <tr>
              <th className="px-3 py-3">Description</th>
              <th className="w-28 px-3 py-3">Qty</th>
              <th className="w-36 px-3 py-3">Rate</th>
              <th className="w-28 px-3 py-3">Tax %</th>
              <th className="w-32 px-3 py-3 text-right">Amount</th>
              <th className="w-14 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item, index) => {
              const amount = toNumber(item.quantity) * toNumber(item.unit_price);
              return (
                <tr key={`item-${index}`}>
                  <td className="px-3 py-3"><input className={editorInputClassName} value={item.description} onChange={(event) => onUpdate(index, 'description', event.target.value)} required /></td>
                  <td className="px-3 py-3"><input type="number" min="0.01" step="0.01" className={`${editorInputClassName} text-right`} value={item.quantity} onChange={(event) => onUpdate(index, 'quantity', event.target.value)} /></td>
                  <td className="px-3 py-3"><input type="number" min="0" step="0.01" className={`${editorInputClassName} text-right`} value={item.unit_price} onChange={(event) => onUpdate(index, 'unit_price', event.target.value)} /></td>
                  <td className="px-3 py-3"><input type="number" min="0" step="0.01" className={`${editorInputClassName} text-right`} value={item.tax_rate} onChange={(event) => onUpdate(index, 'tax_rate', event.target.value)} /></td>
                  <td className="px-3 py-3 text-right font-semibold text-white">₹{money(amount)}</td>
                  <td className="px-3 py-3">
                    <button type="button" onClick={() => onRemove(index)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200" aria-label="Remove line item">
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
  );
}

export function BottomSaveBar({ label, isSaving, onClose }) {
  return (
    <footer className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0A0A0A]/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
      <button type="button" onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white">Cancel</button>
      <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EFBF04] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60">
        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : label}
      </button>
    </footer>
  );
}
