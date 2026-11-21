import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, CheckCircle2, Clock, Send, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { suggestionsApi } from '../../services/api';

export const ClientSuggestRoutePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { busStands, notifyChange, suggestions } = useData();

  const [fromStand, setFromStand] = useState<string>(searchParams.get('from') || '');
  const [toStand, setToStand] = useState<string>(searchParams.get('to') || '');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('from')) setFromStand(searchParams.get('from') || '');
    if (searchParams.get('to')) setToStand(searchParams.get('to') || '');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fromStand.trim()) {
      setErrorMessage('Please specify From Bus Stand');
      return;
    }
    if (!toStand.trim()) {
      setErrorMessage('Please specify To Destination Stand');
      return;
    }
    if (fromStand.trim().toLowerCase() === toStand.trim().toLowerCase()) {
      setErrorMessage('Origin and Destination cannot be the same');
      return;
    }

    try {
      setIsSubmitting(true);
      await suggestionsApi.create({
        fromStandName: fromStand.trim(),
        toStandName: toStand.trim(),
        preferredTime: preferredTime.trim() || undefined,
        message: message.trim() || undefined,
      });

      notifyChange();
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit suggestion:', err);
      setErrorMessage('Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFromStand('');
    setToStand('');
    setPreferredTime('');
    setMessage('');
    setIsSuccess(false);
    setErrorMessage('');
  };

  // Recent approved community suggestions
  const approvedSuggestions = suggestions.filter((s) => s.status === 'Approved');

  return (
    <div className="space-y-4">
      {/* Page Title & Subtitle */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Suggest a New Route
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Can't find the route you're looking for? Tell us.
        </p>
      </div>

      {/* Submission Success State */}
      {isSuccess ? (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Suggestion Submitted!
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Thank you. We will review your route suggestion.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 font-medium max-w-sm mx-auto border border-slate-200/60">
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900">
              <span>{fromStand}</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              <span>{toStand}</span>
            </div>
            {preferredTime && (
              <div className="text-[11px] text-slate-500 mt-1">
                Preferred Time: <strong>{preferredTime}</strong>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Suggest Another Route
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* From Bus Stand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                From Bus Stand <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="stand-suggestions-from"
                  placeholder="Select or Enter Bus Stand (e.g. Kumta)"
                  value={fromStand}
                  onChange={(e) => setFromStand(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  required
                />
                <datalist id="stand-suggestions-from">
                  {busStands.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* To Bus Stand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                To Bus Stand <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="stand-suggestions-to"
                  placeholder="Select or Enter Destination (e.g. Sirsi)"
                  value={toStand}
                  onChange={(e) => setToStand(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  required
                />
                <datalist id="stand-suggestions-to">
                  {busStands.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Preferred Time (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Preferred Time
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Optional</span>
              </div>
              <input
                type="text"
                placeholder="e.g. 07:30 AM, Morning 8:00 AM"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            {/* Message (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Message
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Optional</span>
              </div>
              <textarea
                rows={3}
                placeholder="Tell us what you need (e.g. Need regular morning bus for college/office)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer touch-press"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Suggestion</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Community Impact & Approved Routes */}
      {approvedSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Recently Approved by Depot Admins
          </h3>
          <div className="space-y-2">
            {approvedSuggestions.slice(0, 3).map((sug) => (
              <div
                key={sug.id}
                className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>{sug.fromStandName}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    <span>{sug.toStandName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {sug.preferredTime ? `Time: ${sug.preferredTime} • ` : ''}Added to schedule
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
