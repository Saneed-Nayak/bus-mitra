import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, Users, CheckCircle2, Clock, XCircle, Zap, ChevronRight,
  MapPin, Award, Leaf, Bus, FileText, MessageCircle, Navigation,
  Search, Trophy, TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ContributeModal } from '../../components/client/ContributeModal';
import {
  getOrCreateProfile, getMyReports, submitReport,
  checkAndCreditBonuses, getLevelInfo, LevelInfo,
} from '../../services/contributorApi';
import { ContributorProfile, CommunityReport, QuestionSetType } from '../../types';

// Resolve level icon name → Lucide component
const LEVEL_ICONS: Record<string, LucideIcon> = { Leaf, Star, Award, Bus };

function LevelIcon({ name, className }: { name: string; className?: string }) {
  const Icon = LEVEL_ICONS[name] ?? Star;
  return <Icon className={className ?? 'w-4 h-4'} />;
}

const statusInfo = (status: CommunityReport['status']) => {
  if (status === 'Approved') return {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    badge: <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-bold">Approved</span>,
  };
  if (status === 'Rejected') return {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    badge: <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[11px] font-bold">Rejected</span>,
  };
  return {
    icon: <Clock className="w-4 h-4 text-amber-500" />,
    badge: <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[11px] font-bold">Under Review</span>,
  };
};

const TYPE_LABELS: Record<QuestionSetType, { icon: LucideIcon; label: string }> = {
  at_stop: { icon: MapPin,       label: 'At Bus Stop'      },
  on_bus:  { icon: Bus,          label: 'On Bus'            },
  general: { icon: FileText,     label: 'General Feedback'  },
};

const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const ContributePage: React.FC = () => {
  const [profile, setProfile]       = useState<ContributorProfile | null>(null);
  const [myReports, setMyReports]   = useState<CommunityReport[]>([]);
  const [levelInfo, setLevelInfo]   = useState<LevelInfo | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);

  const reload = useCallback(async () => {
    try {
      const p = await getOrCreateProfile();
      const bonus = await checkAndCreditBonuses(p.id);
      const updated = await getOrCreateProfile();
      setProfile(updated);
      setLevelInfo(getLevelInfo(updated.totalPoints));
      const reports = await getMyReports(updated.id);
      setMyReports(reports);
      if (bonus > 0) setBonusPoints(bonus);
    } catch (e) {
      console.error('Failed to reload contributor data:', e);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleSubmit = async (data: {
    questionSetType: QuestionSetType;
    location?: { latitude: number; longitude: number; nearestStand: string; distanceMeters: number };
    answers: Array<{ question: string; answer: string }>;
    pointsAwarded: number;
  }) => {
    if (!profile) return;
    try {
      await submitReport({ contributorId: profile.id, ...data });
      await reload();
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  if (!profile || !levelInfo) return null;

  return (
    <div className="space-y-4 pb-2">

      {/* ── Bonus credit banner ── */}
      {bonusPoints > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-800">Bonus points credited!</div>
            <div className="text-xs text-emerald-700">+{bonusPoints} pts — a report you submitted was approved.</div>
          </div>
        </div>
      )}

      {/* ── Profile Hero ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg p-5">
        {/* Decorative background bus icon */}
        <div className="absolute -right-6 -top-6 opacity-[0.08] pointer-events-none select-none">
          <Bus className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10">
          {/* Level badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${levelInfo.bgColor} ${levelInfo.textColor} border ${levelInfo.borderColor}`}>
            <LevelIcon name={levelInfo.iconName} className="w-3.5 h-3.5" />
            <span>{levelInfo.label}</span>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-3xl font-extrabold leading-none">{profile.totalPoints}</div>
              <div className="text-red-200 text-xs font-semibold mt-0.5">Mitra Points</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold">{profile.reportCount}</div>
              <div className="text-red-200 text-xs font-semibold">Reports</div>
            </div>
          </div>

          {levelInfo.nextLevelPoints !== null ? (
            <div>
              <div className="flex justify-between text-[11px] text-red-200 mb-1">
                <span>{profile.totalPoints} pts</span>
                <span>{levelInfo.pointsToNext} pts to next level</span>
              </div>
              <div className="h-2 bg-red-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-200 font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              Maximum level reached — You are a Super Mitra!
            </div>
          )}
        </div>
      </div>

      {/* ── Mini Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total',    value: profile.reportCount,   icon: FileText,    color: 'text-slate-700',   bg: 'bg-slate-100'   },
          { label: 'Approved', value: profile.approvedCount, icon: CheckCircle2,color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Rejected', value: profile.rejectedCount, icon: XCircle,     color: 'text-red-600',     bg: 'bg-red-100'     },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Contribute CTA ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Contribute Now</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Just 3 quick taps. Help fellow commuters get real-time bus info.
            </p>
          </div>
        </div>

        {/* Points preview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { pts: '+10', label: 'Answer questions', icon: MessageCircle, color: 'text-slate-700' },
            { pts: '+5',  label: 'Share location',   icon: Navigation,    color: 'text-blue-600'  },
            { pts: '+20', label: 'Get approved',      icon: Award,         color: 'text-amber-600' },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${r.color}`} />
                <div className="text-sm font-extrabold text-red-600">{r.pts}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{r.label}</div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-extrabold text-sm shadow-md shadow-red-600/20 transition-colors flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Start Contributing
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Reports go through admin review before affecting the live app.
        </p>
      </div>

      {/* ── How it works ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-red-600" /> How it works
        </h3>
        <div className="space-y-3">
          {[
            { step: '1', icon: MapPin,         title: 'Choose your context',       desc: 'At a stop, on a bus, or general feedback' },
            { step: '2', icon: Navigation,     title: 'Optional: share location',  desc: 'We find your nearest bus stand automatically' },
            { step: '3', icon: MessageCircle,  title: 'Answer 3 quick questions',  desc: 'Tap to answer — no typing needed' },
            { step: '4', icon: Search,         title: 'Admin reviews your report', desc: 'Quality reports earn +20 bonus points' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Icon className="w-3.5 h-3.5 text-red-500" />
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 ml-5">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Contributions ── */}
      {myReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" /> Your Contributions
            </h3>
            <span className="text-xs text-slate-400">{myReports.length} total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {myReports.slice(0, 10).map((report) => {
              const { icon, badge } = statusInfo(report.status);
              const TypeIcon = TYPE_LABELS[report.questionSetType].icon;
              return (
                <div key={report.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <TypeIcon className="w-3 h-3 text-slate-500" />
                        {TYPE_LABELS[report.questionSetType].label}
                      </div>
                      {badge}
                    </div>
                    {report.location && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Near {report.location.nearestStand}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-0.5">{timeAgo(report.createdAt)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-extrabold text-red-600">+{report.pointsAwarded}</div>
                    {report.status === 'Approved' && (
                      <div className="text-[10px] text-emerald-600 font-semibold">+{report.bonusPoints} bonus</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {myReports.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No contributions yet</p>
          <p className="text-xs mt-1 text-slate-400">Be the first to report! Start contributing above.</p>
        </div>
      )}

      <ContributeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={(pts) => { setBonusPoints(0); reload(); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
