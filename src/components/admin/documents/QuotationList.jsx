import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilePlus2, RefreshCw } from 'lucide-react';
import {
  convertQuotationToInvoice,
  downloadQuotationPdf,
  duplicateQuotation,
  getQuotationById,
  getQuotations,
  saveQuotation,
  sendQuotationEmail,
  shareQuotationWhatsApp,
} from '../../../services/dataService';
import DocumentPreview from './DocumentPreview';
import QuotationEditor from './QuotationEditor';

const inputClassName = 'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';
const statuses = ['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'];

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
  accepted: 'bg-emerald-500/15 text-emerald-200',
  rejected: 'bg-rose-500/15 text-rose-200',
  expired: 'bg-amber-500/15 text-amber-200',
}[status] || 'bg-white/10 text-gray-200');

export default function QuotationList({ enquiries = [], isCompact = false }) {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(undefined);
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

  const loadQuotations = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getQuotations(queryFilters);
      setQuotations(data);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load quotations.');
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters]);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  const openQuotation = async (id) => {
    setIsBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      const quotation = await getQuotationById(id);
      setSelectedQuotation(quotation);
    } catch (openError) {
      setActionError(openError.message || 'Unable to open quotation.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    setEditorError('');

    try {
      const saved = await saveQuotation(payload);
      setEditingQuotation(undefined);
      setInitialEnquiryId('');
      setSelectedQuotation(saved);
      setActionMessage('Quotation saved.');
      await loadQuotations();
    } catch (saveError) {
      setEditorError(saveError.message || 'Unable to save quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const withSelectedAction = async (callback, successMessage) => {
    if (!selectedQuotation) return null;
    setIsBusy(true);
    setActionError('');
    setActionMessage('');

    try {
      const result = await callback(selectedQuotation.id);
      setActionMessage(successMessage);
      if (successMessage !== 'Invoice created from quotation.') {
        const refreshed = await getQuotationById(selectedQuotation.id);
        setSelectedQuotation(refreshed);
      }
      await loadQuotations();
      return result;
    } catch (actionFailure) {
      setActionError(actionFailure.message || 'Action failed.');
      return null;
    } finally {
      setIsBusy(false);
    }
  };

  const handleDuplicate = async () => {
    const duplicated = await withSelectedAction((id) => duplicateQuotation(id), 'Quotation duplicated.');
    if (duplicated?.id) setSelectedQuotation(duplicated);
  };

  const handleShareWhatsApp = async () => {
    const result = await withSelectedAction((id) => shareQuotationWhatsApp(id), 'WhatsApp share link prepared.');
    if (result?.whatsapp_url) window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={isCompact ? 'space-y-4' : 'space-y-6'}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#EFBF04]">Sales documents</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Quotations</h2>
            <p className="mt-1 text-sm text-gray-400">Prepare quotes from enquiries and convert accepted quotes into invoices.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 sm:w-64">
              <label className={labelClassName}>Create from enquiry</label>
              <select className={`${inputClassName} mt-2`} value={initialEnquiryId} onChange={(event) => setInitialEnquiryId(event.target.value)}>
                <option value="" className="bg-[#0A0A0A]">Manual quotation</option>
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
                setEditingQuotation(null);
                setEditorError('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-2.5 text-sm font-bold text-black"
            >
              <FilePlus2 className="h-4 w-4" /> New quotation
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[12rem_1fr_auto]">
          <select className={inputClassName} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {statuses.map((status) => <option key={status} value={status} className="bg-[#0A0A0A]">{status === 'all' ? 'All statuses' : status}</option>)}
          </select>
          <input className={inputClassName} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search quote, customer, phone, or subject" />
          <button type="button" onClick={loadQuotations} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
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
                <th className="px-5 py-4">Quote</th>
                <th className="px-4 py-4">Client</th>
                <th className="px-4 py-4">Subject</th>
                <th className="px-4 py-4">Valid until</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`quotation-skeleton-${index}`}>
                  <td className="px-5 py-5 text-gray-500">Loading...</td>
                  <td className="px-4 py-5 text-gray-500">Please wait</td>
                  <td className="px-4 py-5 text-gray-500">-</td>
                  <td className="px-4 py-5 text-gray-500">-</td>
                  <td className="px-4 py-5 text-right text-gray-500">-</td>
                  <td className="px-5 py-5" />
                </tr>
              )) : quotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-white/5">
                  <td className="px-5 py-5">
                    <button type="button" onClick={() => openQuotation(quotation.id)} className="font-mono text-xs font-semibold text-[#EFBF04]">
                      {quotation.quote_number}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(quotation.quote_date)}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-semibold text-white">{quotation.client_name}</p>
                    <p className="mt-1 text-xs text-gray-500">{quotation.client_phone || quotation.client_email || '-'}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-gray-200">{quotation.subject || 'Travel quotation'}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClass(quotation.status)}`}>{quotation.status}</span>
                  </td>
                  <td className="px-4 py-5 text-gray-300">{formatDate(quotation.valid_until)}</td>
                  <td className="px-4 py-5 text-right font-semibold text-white">{money(quotation.total_amount)}</td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openQuotation(quotation.id)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Preview</button>
                      <button type="button" onClick={async () => setEditingQuotation(await getQuotationById(quotation.id))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && quotations.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-300">No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {isLoading && <p className="px-2 py-6 text-sm text-gray-400">Loading quotations...</p>}
          {!isLoading && quotations.map((quotation) => (
            <article key={quotation.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[#EFBF04]">{quotation.quote_number}</p>
                  <h3 className="mt-2 font-semibold text-white">{quotation.client_name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{quotation.subject || 'Travel quotation'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusClass(quotation.status)}`}>{quotation.status}</span>
              </div>
              <p className="mt-4 text-xl font-bold text-white">{money(quotation.total_amount)}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => openQuotation(quotation.id)} className="flex-1 rounded-lg bg-[#EFBF04] px-3 py-2 text-xs font-bold text-black">Preview</button>
                <button type="button" onClick={async () => setEditingQuotation(await getQuotationById(quotation.id))} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Edit</button>
              </div>
            </article>
          ))}
          {!isLoading && quotations.length === 0 && <p className="px-2 py-6 text-sm text-gray-400">No quotations found.</p>}
        </div>
      </div>

      {selectedQuotation && (
        <DocumentPreview
          document={selectedQuotation}
          type="quotation"
          isBusy={isBusy}
          actionMessage={actionMessage}
          actionError={actionError}
          onClose={() => setSelectedQuotation(null)}
          onEdit={() => {
            setEditingQuotation(selectedQuotation);
            setSelectedQuotation(null);
          }}
          onDuplicate={handleDuplicate}
          onDownload={() => withSelectedAction((id) => downloadQuotationPdf(id), 'PDF downloaded.')}
          onSendEmail={() => withSelectedAction((id) => sendQuotationEmail(id), 'Quotation email sent.')}
          onShareWhatsApp={handleShareWhatsApp}
          onConvert={() => withSelectedAction((id) => convertQuotationToInvoice(id), 'Invoice created from quotation.')}
        />
      )}

      {editingQuotation !== undefined && (
        <QuotationEditor
          quotation={editingQuotation}
          enquiries={enquiries}
          initialEnquiryId={initialEnquiryId}
          isSaving={isSaving}
          error={editorError}
          onClose={() => {
            setEditingQuotation(undefined);
            setEditorError('');
          }}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
