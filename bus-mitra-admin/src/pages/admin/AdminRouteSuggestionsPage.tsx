import React, { useState } from 'react';
import {
  MessageSquareText,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { suggestionsApi } from '../../services/api';
import { RouteSuggestion } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminRouteSuggestionsPage: React.FC = () => {
  const { suggestions, notifyChange } = useData();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedSuggestion, setSelectedSuggestion] = useState<RouteSuggestion | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const filteredSuggestions = suggestions.filter((sug) => {
    if (statusFilter === 'All') return true;
    return sug.status === statusFilter;
  });

  const handleApprove = async (sug: RouteSuggestion) => {
    try {
      setIsProcessing(true);
      const res = await suggestionsApi.approveAndCreateRoute(
        sug.id,
        adminNoteInput || 'Approved by Depot Admin. Published directly to Passenger App.'
      );
      notifyChange();
      setSelectedSuggestion(null);
      setSuccessBanner(
        `Route "${res.createdRoute.fromStandName} → ${res.createdRoute.toStandName}" automatically created and published to Client Search!`
      );
      setTimeout(() => setSuccessBanner(null), 7000);
    } catch (err) {
      console.error('Failed to approve suggestion:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (sug: RouteSuggestion) => {
    try {
      setIsProcessing(true);
      await suggestionsApi.updateStatus(
        sug.id,
        'Rejected',
        adminNoteInput || 'Rejected due to low commuter traffic or route overlap'
      );
      notifyChange();
      setSelectedSuggestion(null);
    } catch (err) {
      console.error('Failed to reject suggestion:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReview = async (sug: RouteSuggestion) => {
    try {
      setIsProcessing(true);
      await suggestionsApi.updateStatus(
        sug.id,
        'Reviewed',
        adminNoteInput || 'Under review with divisional traffic department'
      );
      notifyChange();
      setSelectedSuggestion(null);
    } catch (err) {
      console.error('Failed to update suggestion:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const openReviewModal = (sug: RouteSuggestion) => {
    setSelectedSuggestion(sug);
    setAdminNoteInput(sug.adminNotes || '');
  };

  return (
    <div className="space-y-6">
      {/* Banner / Notice */}
      {successBanner && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Passenger Route Suggestions
          </h2>
          <p className="text-xs text-slate-500">
            Commuter feedback from public client. Approving automatically adds the route to live passenger schedules.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['All', 'Pending', 'Reviewed', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            User Suggestions ({filteredSuggestions.length})
          </h3>
          <span className="text-xs text-slate-500">
            Saved without login requirement
          </span>
        </div>

        {filteredSuggestions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Requested Route</th>
                  <th className="py-3 px-4">Preferred Time</th>
                  <th className="py-3 px-4">Passenger Message</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuggestions.map((sug) => {
                  const statusColors = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    Reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
                    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <tr key={sug.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Requested Route */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span>{sug.fromStandName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                          <span>{sug.toStandName}</span>
                        </div>
                      </td>

                      {/* Preferred Time */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {sug.preferredTime ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {sug.preferredTime}
                          </span>
                        ) : (
                          <span className="text-slate-400">Any Time</span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 italic">
                          {sug.message ? `"${sug.message}"` : '—'}
                        </p>
                        {sug.adminNotes && (
                          <p className="text-[10px] text-slate-400 mt-1 not-italic">
                            Note: {sug.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {new Date(sug.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            statusColors[sug.status]
                          }`}
                        >
                          {sug.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sug.status !== 'Approved' && (
                            <button
                              onClick={() => handleApprove(sug)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                              title="Approve & Publish Route"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => openReviewModal(sug)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Review / Add Note"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {sug.status !== 'Rejected' && (
                            <button
                              onClick={() => handleReject(sug)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                              title="Reject Suggestion"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <MessageSquareText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-600">No suggestions in this category.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSuggestion && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSuggestion(null)}
          title="Review Route Suggestion"
          subtitle="Take action on commuter route submission"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span>{selectedSuggestion.fromStandName}</span>
                <ArrowRight className="w-4 h-4 text-red-600" />
                <span>{selectedSuggestion.toStandName}</span>
              </div>
              {selectedSuggestion.preferredTime && (
                <div className="text-slate-600">
                  Preferred Time: <strong>{selectedSuggestion.preferredTime}</strong>
                </div>
              )}
              {selectedSuggestion.message && (
                <div className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-100">
                  "{selectedSuggestion.message}"
                </div>
              )}
              <div className="text-[11px] text-slate-400">
                Submitted on: {new Date(selectedSuggestion.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Review Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add internal notes or feedback..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSuggestion(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleReject(selectedSuggestion)}
                disabled={isProcessing}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => handleReview(selectedSuggestion)}
                disabled={isProcessing}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200"
              >
                Mark Reviewed
              </button>

              <button
                type="button"
                onClick={() => handleApprove(selectedSuggestion)}
                disabled={isProcessing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Auto-Create Route</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
