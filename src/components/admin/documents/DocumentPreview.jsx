import React from 'react';
import { Copy, Download, Mail, MessageCircle, Pencil, ReceiptText, X } from 'lucide-react';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';

export default function DocumentPreview({
  document,
  type,
  onClose,
  onEdit,
  onDuplicate,
  onDownload,
  onSendEmail,
  onShareWhatsApp,
  onConvert,
  actionMessage,
  actionError,
  isBusy,
}) {
  if (!document) return null;

  const isInvoice = type === 'invoice';
  const number = isInvoice ? document.invoice_number : document.quote_number;
  const partyName = isInvoice ? document.customer_name : document.client_name;
  const partyPhone = isInvoice ? document.customer_phone : document.client_phone;
  const partyEmail = isInvoice ? document.customer_email : document.client_email;
  const dateLabel = isInvoice ? 'Invoice date' : 'Quote date';
  const dateValue = isInvoice ? document.invoice_date : document.quote_date;
  const serviceSummary = isInvoice ? document.trip_details : document.service_summary;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur md:p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-white/10 bg-black/40 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EFBF04]">{isInvoice ? 'Invoice preview' : 'Quotation preview'}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{number}</h2>
            <p className="mt-1 text-sm text-gray-400">{partyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button type="button" onClick={onDuplicate} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            <button type="button" onClick={onDownload} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-[#EFBF04]/30 bg-[#EFBF04]/10 px-3 py-2 text-xs font-semibold text-[#EFBF04] disabled:opacity-50">
              <Download className="h-4 w-4" /> PDF
            </button>
            <button type="button" onClick={onSendEmail} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 disabled:opacity-50">
              <Mail className="h-4 w-4" /> Email
            </button>
            <button type="button" onClick={onShareWhatsApp} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-50">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
            {!isInvoice && onConvert && (
              <button type="button" onClick={onConvert} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg bg-[#2249DB] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                <ReceiptText className="h-4 w-4" /> Invoice
              </button>
            )}
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white" aria-label="Close preview">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_18rem]">
          <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className={labelClassName}>{dateLabel}</p>
                <p className="mt-1 text-sm text-white">{dateValue || '-'}</p>
              </div>
              <div>
                <p className={labelClassName}>Status</p>
                <p className="mt-1 text-sm capitalize text-white">{document.status}</p>
              </div>
              <div>
                <p className={labelClassName}>{isInvoice ? 'Payment' : 'Valid until'}</p>
                <p className="mt-1 text-sm capitalize text-white">{isInvoice ? document.payment_status : (document.valid_until || '-')}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className={labelClassName}>Customer</p>
                <p className="mt-1 text-sm text-white">{partyName}</p>
                <p className="mt-1 text-xs text-gray-400">{[partyPhone, partyEmail].filter(Boolean).join(' | ') || '-'}</p>
              </div>
              <div>
                <p className={labelClassName}>Route / Service</p>
                <p className="mt-1 text-sm text-white">{[document.pickup, document.dropoff].filter(Boolean).join(' to ') || document.subject || '-'}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">{serviceSummary || '-'}</p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/35 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="px-3 py-3">Item</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Rate</th>
                    <th className="px-3 py-3 text-right">Tax</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(document.items || []).map((item) => (
                    <tr key={item.id || item.sort_order}>
                      <td className="px-3 py-3 text-white">{item.description}</td>
                      <td className="px-3 py-3 text-right text-gray-300">{Number(item.quantity || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-gray-300">{money(item.unit_price || item.rate)}</td>
                      <td className="px-3 py-3 text-right text-gray-300">{money(item.tax_amount)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-white">{money(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className={labelClassName}>Totals</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex justify-between text-gray-300"><span>Subtotal</span><span>{money(document.subtotal_amount)}</span></p>
                <p className="flex justify-between text-gray-300"><span>Tax</span><span>{money(document.tax_amount)}</span></p>
                {(document.additional_charges || []).map((charge, index) => (
                  <p key={`preview-charge-${index}`} className="flex justify-between text-gray-300"><span>{charge.label || 'Additional charge'}</span><span>{money(charge.amount)}</span></p>
                ))}
                <p className="flex justify-between text-gray-300"><span>Discount</span><span>{money(document.discount_amount)}</span></p>
                <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white"><span>Total</span><span>{money(document.total_amount)}</span></p>
              </div>
            </div>
            {(actionMessage || actionError) && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${actionError ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                {actionError || actionMessage}
              </div>
            )}
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className={labelClassName}>Delivery log</p>
              <div className="mt-3 space-y-2">
                {(document.delivery_logs || []).slice(0, 5).map((log) => (
                  <div key={log.id} className="rounded-lg bg-black/25 px-3 py-2 text-xs text-gray-300">
                    <p className="font-semibold capitalize text-white">{log.delivery_method} - {log.status}</p>
                    <p className="mt-1 text-gray-500">{log.created_at}</p>
                  </div>
                ))}
                {(!document.delivery_logs || document.delivery_logs.length === 0) && (
                  <p className="text-sm text-gray-500">No delivery actions yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
