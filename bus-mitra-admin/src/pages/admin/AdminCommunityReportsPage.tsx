import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, MapPin, MessageSquare, Users,
  ChevronDown, ChevronUp, Bus, FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CommunityReport, QuestionSetType } from '../../types';
import { communityReportsApi } from '../../services/api';
import { useData } from '../../context/DataContext';

type FilterStatus = 'All' | 'Pending' | 'Approved' | 'Rejected';

const TYPE_INFO: Record<QuestionSetType, { icon: LucideIcon; label: string }> = {
  at_stop: { icon: MapPin,    label: 'At Bus Stop'     },
  on_bus:  { icon: Bus,       label: 'On Bus'           },
  general: { icon: FileText,  label: 'General Feedback' },
};

function TypeLabel({ type }: { type: QuestionSetType }) {
  const { icon: Icon, label } = TYPE_INFO[type];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
      {label}
    </span>
  );
}

const shortId = (id: string) => id.split('-').pop()?.toUpperCase() ?? id.slice(-6).toUpperCase();

export const AdminCommunityReportsPage: React.FC = () => {
  const { notifyChange } = useData();
  const [reports, setReports]         = useState<CommunityReport[]>([]);
  const [filter, setFilter]           = useState<FilterStatus>('Pending');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [noteText, setNoteText]       = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);

  const reload = useCallback(async () => {
    try {
      const all = await communityReportsApi.getAll();
      setReports(all);
    } catch (err) {
      console.error('Failed to load community reports:', err);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = filter === 'All' ? reports : reports.filter((r) => r.status === filter);

  const counts = {
    All:      reports.length,
    Pending:  reports.filter((r) => r.status === 'Pending').length,
    Approved: reports.filter((r) => r.status === 'Approved').length,
    Rejected: reports.filter((r) => r.status === 'Rejected').length,
  };

  const updateStatus = async (report: CommunityReport, status: 'Approved' | 'Rejected') => {
    setLoading(true);
    try {
      await communityReportsApi.updateStatus(report.id, status, noteText[report.id] || report.adminNotes || '');
      setNoteText((prev) => { const n = { ...prev }; delete n[report.id]; return n; });
      setExpandedId(null);
      await reload();
      notifyChange();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const StatusBadge: React.FC<{ status: CommunityReport['status'] }> = ({ status }) => {
    if (status === 'Approved') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
    if (status === 'Rejected') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(counts) as [FilterStatus, number][]).map(([label, count]) => {
          const colors: Record<FilterStatus, string> = {
            All:      'text-slate-700 border-slate-200',
            Pending:  'text-amber-700 border-amber-200',
            Approved: 'text-emerald-700 border-emerald-200',
            Rejected: 'text-red-600 border-red-200',
          };
          return (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`bg-white rounded-xl p-4 border-2 text-left transition-all shadow-sm ${
                filter === label ? 'ring-2 ring-red-400 ' + colors[label] : colors[label]
              }`}
            >
              <div className={`text-2xl font-extrabold ${colors[label].split(' ')[0]}`}>{count}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{label} Reports</div>
            </button>
          );
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['Pending', 'Approved', 'Rejected', 'All'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {/* ── Report cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-500">No {filter === 'All' ? '' : filter.toLowerCase()} reports yet</p>
          <p className="text-xs mt-1">Community reports submitted by passengers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  report.status === 'Pending' ? 'border-amber-200' : 'border-slate-100'
                }`}
              >
                {/* Card header */}
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <TypeLabel type={report.questionSetType} />
                      <StatusBadge status={report.status} />
                      <span className="text-[11px] text-slate-400">{timeAgo(report.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        #{shortId(report.contributorId)}
                      </span>
                      {report.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          Near <strong className="text-slate-700">{report.location.nearestStand}</strong>
                          {' '}({report.location.distanceMeters < 1000
                            ? `${Math.round(report.location.distanceMeters)}m`
                            : `${(report.location.distanceMeters / 1000).toFixed(1)}km`})
                        </span>
                      ) : (
                        <span className="text-slate-400">No location</span>
                      )}
                    </div>

                    {/* Quick answers preview */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {report.answers.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {a.answer}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-red-600">+{report.pointsAwarded} pts</div>
                      {report.status === 'Approved' && (
                        <div className="text-[10px] text-emerald-600 font-semibold">+{report.bonusPoints} bonus</div>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail + actions */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-4">
                    {/* Full answers */}
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2">Full Answers</div>
                      <div className="space-y-1.5">
                        {report.answers.map((a, i) => (
                          <div key={i} className="flex gap-3 text-xs">
                            <span className="text-slate-500 shrink-0 min-w-0 flex-1">{a.question}</span>
                            <span className="font-semibold text-slate-800 shrink-0">{a.answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Existing admin notes */}
                    {report.adminNotes && (
                      <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <span className="font-bold text-amber-800">Admin Note: </span>
                        <span className="text-amber-700">{report.adminNotes}</span>
                      </div>
                    )}

                    {/* Admin actions — only for Pending */}
                    {report.status === 'Pending' && (
                      <div className="space-y-2">
                        <textarea
                          value={noteText[report.id] || ''}
                          onChange={(e) => setNoteText((prev) => ({ ...prev, [report.id]: e.target.value }))}
                          placeholder="Optional: Add a note for this report…"
                          rows={2}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(report, 'Approved')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve (+{report.bonusPoints} pts to contributor)
                          </button>
                          <button
                            onClick={() => updateStatus(report, 'Rejected')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
