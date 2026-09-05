import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FilePlus2, Mail, MessageCircle, Pencil, ReceiptText, RefreshCw } from 'lucide-react';
import {
  downloadInvoicePdf,
  duplicateInvoice,
  getInvoiceById,
  getInvoices,
  saveInvoice,
  sendInvoiceEmail,
  shareInvoiceWhatsApp,
} from '../../../services/dataService';
import DocumentPreview from './DocumentPreview';
import InvoiceEditor from './InvoiceEditor';

const inputClassName = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';
const statuses = ['all', 'draft', 'sent', 'paid', 'cancelled'];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusClass = (status) => ({
  draft: 'bg-white/10 text-gray-200',
  sent: 'bg-sky-500/15 text-sky-200',
  paid: 'bg-emerald-500/15 text-emerald-200',
  cancelled: 'bg-rose-500/15 text-rose-200',
}[status] || 'bg-white/10 text-gray-200');

export default function InvoiceList({ enquiries = [], isCompact = false }) {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(undefined);
  const [initialEnquiryId, setInitialEnquiryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [editorError, setEditorError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const queryFilters = useMemo(() => ({
    status: filters.status === 'all' ? '' : filters.status,
    search: filters.search,
  }), [filters]);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getInvoices(queryFilters);
      setInvoices(data);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load invoices.');
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const openInvoice = async (id) => {
    setIsBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      const invoice = await getInvoiceById(id);
      setSelectedInvoice(invoice);
    } catch (openError) {
      setActionError(openError.message || 'Unable to open invoice.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    setEditorError('');

    try {
      const saved = await saveInvoice(payload);
      setEditingInvoice(undefined);
      setInitialEnquiryId('');
      setSelectedInvoice(saved);
      setActionMessage('Invoice saved.');
      await loadInvoices();
    } catch (saveError) {
      setEditorError(saveError.message || 'Unable to save invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const withSelectedAction = async (callback, successMessage) => {
    if (!selectedInvoice) return;
    setIsBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      const result = await callback(selectedInvoice.id);
      setActionMessage(successMessage);
      const refreshed = await getInvoiceById(result?.id || selectedInvoice.id);
      setSelectedInvoice(refreshed);
      await loadInvoices();
      return result;
    } catch (actionFailure) {
      setActionError(actionFailure.message || 'Action failed.');
      return null;
    } finally {
      setIsBusy(false);
    }
  };

  const handleDuplicate = async () => {
    const duplicated = await withSelectedAction((id) => duplicateInvoice(id), 'Invoice duplicated.');
    if (duplicated?.id) setSelectedInvoice(duplicated);
  };

  const handleShareWhatsApp = async () => {
    const result = await withSelectedAction((id) => shareInvoiceWhatsApp(id), 'WhatsApp share link prepared.');
    if (result?.whatsapp_url) window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={isCompact ? 'space-y-4' : 'space-y-6'}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#EFBF04]">Billing</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Invoices</h2>
            <p className="mt-1 text-sm text-gray-400">Create, edit, preview, send, and download Velvet Pearl invoice PDFs.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 sm:w-64">
              <label className={labelClassName}>Create from enquiry</label>
              <select className={`${inputClassName} mt-2`} value={initialEnquiryId} onChange={(event) => setInitialEnquiryId(event.target.value)}>
                <option value="" className="bg-[#0A0A0A]">Manual invoice</option>
                {enquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id} className="bg-[#0A0A0A]">
                    {enquiry.reference_id || enquiry.id} - {enquiry.customer_name || 'Customer'}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingInvoice(null);
                setEditorError('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2.5 text-sm font-bold text-black"
            >
              <FilePlus2 className="h-4 w-4" /> New invoice
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[12rem_1fr_auto]">
          <select className={inputClassName} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {statuses.map((status) => <option key={status} value={status} className="bg-[#0A0A0A]">{status === 'all' ? 'All statuses' : status}</option>)}
          </select>
          <input className={inputClassName} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search invoice, customer, phone, or booking reference" />
          <button type="button" onClick={loadInvoices} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/35 text-[10px] uppercase tracking-[0.18em] text-gray-500">
              <tr>
                <th className="px-5 py-4">Invoice</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`invoice-skeleton-${index}`}>
                  <td className="px-5 py-5 text-gray-500">Loading...</td>
                  <td className="px-4 py-5 text-gray-500">Please wait</td>
                  <td className="px-4 py-5 text-gray-500">-</td>
                  <td className="px-4 py-5 text-gray-500">-</td>
                  <td className="px-4 py-5 text-right text-gray-500">-</td>
                  <td className="px-5 py-5" />
                </tr>
              )) : invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5">
                  <td className="px-5 py-5">
                    <button type="button" onClick={() => openInvoice(invoice.id)} className="font-mono text-xs font-semibold text-[#EFBF04]">
                      {invoice.invoice_number}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">{invoice.booking_reference || 'No booking reference'}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-semibold text-white">{invoice.customer_name}</p>
                    <p className="mt-1 text-xs text-gray-500">{invoice.customer_phone || invoice.customer_email || '-'}</p>
                  </td>
                  <td className="px-4 py-5 text-gray-300">{formatDate(invoice.invoice_date)}</td>
                  <td className="px-4 py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClass(invoice.status)}`}>{invoice.status}</span>
                    <p className="mt-2 text-xs capitalize text-gray-500">{invoice.payment_status || 'unpaid'}</p>
                  </td>
                  <td className="px-4 py-5 text-right font-semibold text-white">{money(invoice.total_amount)}</td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openInvoice(invoice.id)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Preview</button>
                      <button type="button" onClick={async () => setEditingInvoice(await getInvoiceById(invoice.id))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && invoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-300">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {isLoading && <p className="px-2 py-6 text-sm text-gray-400">Loading invoices...</p>}
          {!isLoading && invoices.map((invoice) => (
            <article key={invoice.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[#EFBF04]">{invoice.invoice_number}</p>
                  <h3 className="mt-2 font-semibold text-white">{invoice.customer_name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(invoice.invoice_date)} | {invoice.payment_status || 'unpaid'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClass(invoice.status)}`}>{invoice.status}</span>
              </div>
              <p className="mt-4 text-xl font-bold text-white">{money(invoice.total_amount)}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => openInvoice(invoice.id)} className="flex-1 rounded-lg bg-[#EFBF04] px-3 py-2 text-xs font-bold text-black">Preview</button>
                <button type="button" onClick={async () => setEditingInvoice(await getInvoiceById(invoice.id))} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Edit</button>
              </div>
            </article>
          ))}
          {!isLoading && invoices.length === 0 && <p className="px-2 py-6 text-sm text-gray-400">No invoices found.</p>}
        </div>
      </div>

      {selectedInvoice && (
        <DocumentPreview
          document={selectedInvoice}
          type="invoice"
          isBusy={isBusy}
          actionMessage={actionMessage}
          actionError={actionError}
          onClose={() => setSelectedInvoice(null)}
          onEdit={() => {
            setEditingInvoice(selectedInvoice);
            setSelectedInvoice(null);
          }}
          onDuplicate={handleDuplicate}
          onDownload={() => withSelectedAction((id) => downloadInvoicePdf(id), 'PDF downloaded.')}
          onSendEmail={() => withSelectedAction((id) => sendInvoiceEmail(id), 'Invoice email sent.')}
          onShareWhatsApp={handleShareWhatsApp}
        />
      )}

      {editingInvoice !== undefined && (
        <InvoiceEditor
          invoice={editingInvoice}
          enquiries={enquiries}
          initialEnquiryId={initialEnquiryId}
          isSaving={isSaving}
          error={editorError}
          onClose={() => {
            setEditingInvoice(undefined);
            setEditorError('');
          }}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
