import React, { useState, useCallback } from 'react';
import {
  X, MapPin, Navigation, CheckCircle2, ChevronRight, Loader2,
  Bus, ClipboardList, AlertTriangle, AlertCircle, Ban,
  TrendingDown, User, Users, ThumbsUp, Minus, Clock,
  XCircle, Thermometer, Trash2, ShieldAlert,
  Calendar, Home, ThumbsDown, LucideProps,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QuestionSetType } from '../../types';
import { findNearestStand, getQuestions, Question } from '../../services/contributorApi';

// ── Icon resolver — maps string names from contributorApi to Lucide components ──
const ICON_MAP: Record<string, LucideIcon> = {
  Bus, ClipboardList, AlertTriangle, AlertCircle, Ban,
  TrendingDown, User, Users, ThumbsUp, Minus, Clock,
  CheckCircle2, XCircle, Thermometer, Trash2, ShieldAlert,
  Calendar, Home, ThumbsDown,
};

function OptionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className={className ?? 'w-5 h-5'} /> : null;
}

type ContextChoice = QuestionSetType;
type ModalStep = 'intro' | 'location' | 'questions' | 'done';

interface LocationResult {
  latitude: number;
  longitude: number;
  nearestStand: string;
  distanceMeters: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (pointsEarned: number) => void;
  onSubmit: (data: {
    questionSetType: QuestionSetType;
    location?: LocationResult;
    answers: Array<{ question: string; answer: string }>;
    pointsAwarded: number;
  }) => void;
}

const CONTEXT_OPTIONS: Array<{
  type: ContextChoice;
  icon: LucideIcon;
  title: string;
  desc: string;
}> = [
  { type: 'at_stop', icon: MapPin,       title: "I'm at a bus stop",      desc: 'Report stop conditions & bus presence' },
  { type: 'on_bus',  icon: Bus,          title: "I'm on a bus right now",  desc: 'Report timing, crowding & bus condition' },
  { type: 'general', icon: ClipboardList, title: 'Just sharing feedback',  desc: 'General bus service experience' },
];

export const ContributeModal: React.FC<Props> = ({ isOpen, onClose, onComplete, onSubmit }) => {
  const [step, setStep]                 = useState<ModalStep>('intro');
  const [contextChoice, setContextChoice] = useState<ContextChoice | null>(null);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError]   = useState('');
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx]   = useState(0);
  const [answers, setAnswers]           = useState<Array<{ question: string; answer: string }>>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const reset = useCallback(() => {
    setStep('intro'); setContextChoice(null); setLocationResult(null);
    setLocationLoading(false); setLocationError(''); setQuestions([]);
    setCurrentQIdx(0); setAnswers([]); setSelectedOption(null); setPointsEarned(0);
  }, []);

  const resetAndClose = useCallback(() => { reset(); onClose(); }, [reset, onClose]);

  const handleContextChoice = (choice: ContextChoice) => {
    setContextChoice(choice);
    if (choice === 'general') {
      setQuestions(getQuestions('general'));
      setStep('questions');
    } else {
      setStep('location');
    }
  };

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestStand(latitude, longitude);
        setLocationResult({
          latitude,
          longitude,
          nearestStand: nearest.stand,
          distanceMeters: nearest.distanceMeters,
        });
        setLocationLoading(false);
        setQuestions(getQuestions(contextChoice!));
        setStep('questions');
      },
      (err) => {
        setLocationLoading(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. You can still contribute without it.'
            : 'Could not get your location. You can still contribute without it.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const skipLocation = () => {
    setQuestions(getQuestions(contextChoice!));
    setStep('questions');
  };

  const handleAnswer = (opt: { label: string; value: string }) => {
    if (selectedOption) return;
    setSelectedOption(opt.value);
    setTimeout(() => {
      const newAnswers = [...answers, { question: questions[currentQIdx].text, answer: opt.label }];
      setAnswers(newAnswers);
      if (currentQIdx < questions.length - 1) {
        setCurrentQIdx((i) => i + 1);
        setSelectedOption(null);
      } else {
        const base = 10;
        const bonus = locationResult ? 5 : 0;
        const total = base + bonus;
        setPointsEarned(total);
        onSubmit({ questionSetType: contextChoice!, location: locationResult ?? undefined, answers: newAnswers, pointsAwarded: total });
        setStep('done');
        setSelectedOption(null);
      }
    }, 320);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">Bus Mitra Contributor</span>
          </div>
          <button onClick={resetAndClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">How are you contributing today?</h2>
              <p className="text-xs text-slate-500">Takes less than 30 seconds. Just 3 taps.</p>
            </div>
            <div className="space-y-2.5">
              {CONTEXT_OPTIONS.map(({ type, icon: Icon, title, desc }) => (
                <button
                  key={type}
                  onClick={() => handleContextChoice(type)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LOCATION ── */}
        {step === 'location' && (
          <div className="p-5 space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">
                {contextChoice === 'at_stop' ? 'Find your bus stop' : 'Where are you?'}
              </h2>
              <p className="text-xs text-slate-500">
                Your location identifies the nearest bus stand. Not stored on any server — local only.
              </p>
            </div>

            {locationResult ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-emerald-800">Location found</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Near <strong>{locationResult.nearestStand}</strong> —{' '}
                    {locationResult.distanceMeters < 1000
                      ? `${Math.round(locationResult.distanceMeters)} m away`
                      : `${(locationResult.distanceMeters / 1000).toFixed(1)} km away`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-70"
                >
                  {locationLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Locating…</>
                    : <><Navigation className="w-4 h-4" /> Allow Location Access</>
                  }
                </button>
                {locationError && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{locationError}</span>
                  </div>
                )}
                <button onClick={skipLocation} className="w-full text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 text-center">
                  Skip — continue without location
                </button>
              </div>
            )}

            {locationResult && (
              <button
                onClick={() => { setQuestions(getQuestions(contextChoice!)); setStep('questions'); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {step === 'questions' && questions.length > 0 && (
          <div className="p-5 space-y-5">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold">Question {currentQIdx + 1} of {questions.length}</span>
                <span className="font-semibold text-red-600">+10 pts on completion</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={`rounded-full transition-all ${
                      i < currentQIdx ? 'w-1.5 h-1.5 bg-red-500' :
                      i === currentQIdx ? 'w-3 h-1.5 bg-red-600' : 'w-1.5 h-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {questions[currentQIdx].text}
            </h2>

            <div className="space-y-2">
              {questions[currentQIdx].options.map((opt) => {
                const isSelected = selectedOption === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedOption}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-slate-700'
                    } disabled:opacity-60`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 ${isSelected ? 'bg-red-100' : ''}`}>
                      <OptionIcon name={opt.iconName} className={`w-4 h-4 ${isSelected ? 'text-red-600' : opt.iconColor}`} />
                    </div>
                    <span className="flex-1 text-left">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="p-6 text-center space-y-4">
            {/* Celebratory icon instead of emoji */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Thank you!</h2>
              <p className="text-sm text-slate-500 mt-1">Your report is under admin review.</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 mx-auto">
              <div className="text-3xl font-extrabold text-red-600">+{pointsEarned}</div>
              <div className="text-xs font-semibold text-red-700 mt-0.5">Mitra Points earned</div>
              {locationResult && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> +5 location bonus included
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Admin-approved reports earn an additional{' '}
              <strong className="text-slate-700">+20 bonus points</strong>.
            </p>

            <div className="flex gap-2 pt-1">
              <button onClick={resetAndClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                Done
              </button>
              <button
                onClick={() => { reset(); onComplete(pointsEarned); }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Contribute Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
