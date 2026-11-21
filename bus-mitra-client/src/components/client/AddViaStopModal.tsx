import React, { useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { Timetable, BusStand } from '../../types';
import { viaStopsApi } from '../../services/api';
import { useData } from '../../context/DataContext';
import { AddViaStopStep1 } from './AddViaStopStep1';
import { AddViaStopStep2 } from './AddViaStopStep2';
import { AddViaStopStep3 } from './AddViaStopStep3';
import { AddViaStopStep4 } from './AddViaStopStep4';
import { AddViaStopStep5 } from './AddViaStopStep5';

interface AddViaStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: Timetable;
  existingViaStops?: string[];
}

type ModalStep = 1 | 2 | 3 | 4 | 5 | 'success';

export const AddViaStopModal: React.FC<AddViaStopModalProps> = ({
  isOpen,
  onClose,
  timetable,
  existingViaStops = [],
}) => {
  const { busStands } = useData();
  const [step, setStep] = useState<ModalStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state across steps
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [isCustomStop, setIsCustomStop] = useState(false);
  const [customStopName, setCustomStopName] = useState('');
  const [position, setPosition] = useState<number>(0);
  const [reason, setReason] = useState<'travelled' | 'regular_user' | 'know_route' | 'other'>('know_route');
  const [notes, setNotes] = useState('');

  const reset = useCallback(() => {
    setStep(1);
    setError('');
    setSelectedStop('');
    setIsCustomStop(false);
    setCustomStopName('');
    setPosition(0);
    setReason('know_route');
    setNotes('');
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedStop && !customStopName) {
        setError('Please select or enter a stop name');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step !== 1 && step !== 'success') {
      setStep((prev) => {
        if (typeof prev === 'number' && prev > 1) return (prev - 1) as ModalStep;
        return prev;
      });
      setError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const stopName = isCustomStop ? customStopName : selectedStop;
      
      await viaStopsApi.create({
        routeId: timetable.routeId,
        fromStandName: timetable.fromStandName,
        toStandName: timetable.toStandName,
        stopName: stopName.trim(),
        position,
        reason,
        notes: notes.trim() || undefined,
      });

      setStep('success');
    } catch (err) {
      console.error('Error submitting via stop:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit suggestion');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const stopName = isCustomStop ? customStopName : selectedStop;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 transition-opacity backdrop-blur-xs" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {step === 'success' ? 'Thank You!' : 'Add a Missing Bus Stop'}
            </h3>
            {step !== 'success' && step !== 1 && (
              <p className="text-xs text-slate-500 mt-0.5">Step {step} of 5</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {step === 1 && <AddViaStopStep1 timetable={timetable} />}
          {step === 2 && (
            <AddViaStopStep2
              busStands={busStands}
              selectedStop={selectedStop}
              setSelectedStop={setSelectedStop}
              isCustomStop={isCustomStop}
              setIsCustomStop={setIsCustomStop}
              customStopName={customStopName}
              setCustomStopName={setCustomStopName}
            />
          )}
          {step === 3 && (
            <AddViaStopStep3
              timetable={timetable}
              existingViaStops={existingViaStops}
              selectedStop={stopName}
              position={position}
              setPosition={setPosition}
            />
          )}
          {step === 4 && (
            <AddViaStopStep4
              timetable={timetable}
              stopName={stopName}
              position={position}
              existingViaStops={existingViaStops}
              reason={reason}
              setReason={setReason}
              notes={notes}
              setNotes={setNotes}
            />
          )}
          {step === 5 && (
            <AddViaStopStep5
              timetable={timetable}
              stopName={stopName}
              position={position}
              existingViaStops={existingViaStops}
              reason={reason}
            />
          )}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-slate-600 text-sm mb-2">Your suggested stop has been submitted for verification.</p>
              <p className="text-slate-500 text-xs">Once verified, it will be added to the route and visible to other passengers.</p>
            </div>
          )}
        </div>

        {/* Footer - Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          {step !== 'success' && step !== 1 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step !== 'success' && (
            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 rounded-lg font-medium text-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : step === 4 ? (
                <>
                  <Check className="w-4 h-4" />
                  Submit for Review
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 'success' && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium text-sm transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
