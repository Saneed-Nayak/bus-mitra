import React, { useState, useMemo } from 'react';
import { X, Search, Edit3, MapPin, HelpCircle, CheckCircle2 } from 'lucide-react';
import { viaStopsApi } from '../../services/api';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';

interface AddStopFlowProps {
  fromStandName: string;
  toStandName: string;
  busId: string;
  timetable: any;
  onClose: () => void;
  onStopAdded: () => void;
}

export const AddStopFlow: React.FC<AddStopFlowProps> = ({
  fromStandName,
  toStandName,
  busId,
  timetable,
  onClose,
  onStopAdded,
}) => {
  const { busStands } = useData();
  const [step, setStep] = useState<'entry' | 'position' | 'reason' | 'notes' | 'success'>(
    'entry'
  );

  // Entry state
  const [useManualEntry, setUseManualEntry] = useState(true);
  const [manualStopName, setManualStopName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState<{ name: string; id?: string } | null>(null);

  // Position state
  const [position, setPosition] = useState(0);

  // Reason state
  const [reason, setReason] = useState<'travelled' | 'regular_user' | 'know_route' | 'other'>(
    'travelled'
  );

  // Notes state
  const [notes, setNotes] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filtered stops
  const filteredStops = useMemo(() => {
    if (!searchQuery || useManualEntry) return [];
    return busStands
      .filter((stand) =>
        stand.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 15);
  }, [searchQuery, useManualEntry, busStands]);

  // Get selected stop name
  const selectedStopName = useManualEntry ? manualStopName : selectedStop?.name || '';

  // Handle proceed to position
  const handleProceedToPosition = () => {
    if (!selectedStopName.trim()) {
      setError('Please enter or select a stop name');
      return;
    }
    setError(null);
    setStep('position');
  };

  // Handle proceed to reason
  const handleProceedToReason = () => {
    setError(null);
    setStep('reason');
  };

  // Handle proceed to notes
  const handleProceedToNotes = () => {
    setError(null);
    setStep('notes');
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await viaStopsApi.create({
        timetableId: busId, // Use busId which is actually timetableId
        routeId: timetable.routeId,
        fromStandName,
        toStandName,
        stopName: selectedStopName,
        position,
        reason,
        notes: notes || undefined,
      });

      setStep('success');
      setTimeout(() => {
        onStopAdded();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit stop:', err);
      setError('Failed to submit stop. Please try again.');
      setStep('notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset flow
  const handleClose = () => {
    setStep('entry');
    setManualStopName('');
    setSearchQuery('');
    setSelectedStop(null);
    setPosition(0);
    setReason('travelled');
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header with Progress */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Via Stop</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Route Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="font-semibold">{fromStandName}</span>
          <span>→</span>
          <span className="font-semibold">{toStandName}</span>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Daily
          </span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Intro', active: step === 'entry' },
            { num: 2, label: 'Search / Select Stop', active: step === 'position' },
            { num: 3, label: 'Select Position', active: step === 'reason' },
            { num: 4, label: 'Details & Submit', active: step === 'notes' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    s.active
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`text-xs font-medium hidden md:inline ${s.active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && <div className="flex-1 h-0.5 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 py-6">
        {step === 'entry' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-2xl mb-4">
                <MapPin className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Add a Missing Bus Stop</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help other passengers by adding a stop on this route.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">It may takes a minute</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Helps thousands of travelers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">You make travel easier</span>
              </div>
            </div>

            <button
              onClick={() => setStep('position')}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'position' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Search or select the stop</h3>
              <p className="text-sm text-gray-600 mb-4">Select from the bus stand</p>

              <div className="space-y-4">
                {/* Search Tab */}
                <div>
                  <div className="flex gap-2 border-b border-gray-200 mb-4">
                    <button
                      onClick={() => setUseManualEntry(false)}
                      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        !useManualEntry
                          ? 'border-red-600 text-red-600'
                          : 'border-transparent text-gray-500'
                      }`}
                    >
                      Search Stop
                    </button>
                    <button
                      onClick={() => setUseManualEntry(true)}
                      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        useManualEntry
                          ? 'border-red-600 text-red-600'
                          : 'border-transparent text-gray-500'
                      }`}
                    >
                      Details
                    </button>
                  </div>

                  {!useManualEntry ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search bus-stop"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      {selectedStop && (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Selected Stop</p>
                              <p className="text-sm font-bold text-gray-900">{selectedStop.name}</p>
                            </div>
                            <button
                              onClick={() => setSelectedStop(null)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}

                      {searchQuery && !selectedStop && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 px-2 py-1">Popular near this route</p>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {filteredStops.length > 0 ? (
                              filteredStops.map((stop) => (
                                <button
                                  key={stop.id || stop.name}
                                  onClick={() => {
                                    setSelectedStop({ name: stop.name, id: stop.id });
                                    setSearchQuery('');
                                  }}
                                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                                >
                                  {stop.name}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">No stops found</div>
                            )}
                          </div>
                        </div>
                      )}

                      {!searchQuery && !selectedStop && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2 px-2">Other (Enter manually)</p>
                          <button
                            onClick={() => setUseManualEntry(true)}
                            className="w-full px-4 py-3 text-left rounded-lg text-sm text-gray-700 hover:bg-gray-50 border border-gray-200"
                          >
                            <span className="text-gray-400 mr-2">✎</span>
                            Enter manually
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter stop name..."
                        value={manualStopName}
                        onChange={(e) => setManualStopName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                      />
                      {manualStopName && (
                        <p className="text-xs text-gray-500">
                          Stop name: <span className="font-semibold text-gray-900">{manualStopName}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep('entry')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProceedToReason}
                disabled={!selectedStopName.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'reason' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Where is this stop?</h3>
              <p className="text-sm text-gray-600 mb-4">Select position between existing and ending bus stops</p>

              <div className="space-y-3">
                {/* Visual position selector */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-600" />
                      <span className="text-sm font-semibold text-gray-900">{fromStandName}</span>
                      <span className="ml-auto text-xs text-green-600 font-semibold">Start</span>
                    </div>
                    
                    <div className="ml-1.5 space-y-2">
                      <div className="flex items-center gap-3 pl-6 py-2 cursor-pointer hover:bg-white rounded-lg transition-colors"
                        onClick={() => setPosition(1)}
                      >
                        <input
                          type="radio"
                          checked={position === 1}
                          onChange={() => setPosition(1)}
                          className="w-4 h-4 text-red-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-600">Insert new stop here</p>
                          <p className="text-xs text-gray-500">→ {selectedStopName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span className="text-sm font-semibold text-gray-900">{toStandName}</span>
                      <span className="ml-auto text-xs text-red-600 font-semibold">End</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep('position')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProceedToNotes}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'notes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Tell us more</h3>
              <p className="text-sm text-gray-600 mb-4">Share more information about the bus stop</p>

              <div className="space-y-4">
                {/* Stop Name Display */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stop Name</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{selectedStopName}</p>
                  </div>
                </div>

                {/* How do you know */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">How do you know this stop?</label>
                  <div className="space-y-2">
                    {[
                      { value: 'travelled' as const, label: 'I traveled on this bus', icon: '✓' },
                      { value: 'regular_user' as const, label: 'I regularly use this route', icon: '👤' },
                      { value: 'know_route' as const, label: 'I know the route', icon: '🗺️' },
                      { value: 'other' as const, label: 'Other', icon: '📝' },
                    ].map(({ value, label, icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          reason === value
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          checked={reason === value}
                          onChange={() => setReason(value)}
                          className="w-4 h-4"
                        />
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional notes (optional)
                  </label>
                  <textarea
                    placeholder="Share any details that might help verify this stop..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows={4}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {notes.length}/500
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p>• All user added stops are marked as <strong>pending</strong> and will be visible after admin verification.</p>
                <p>• Thank you for helping build a better travel experience for everyone! 🙏</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep('reason')}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
            <p className="text-sm text-gray-600 mb-8">
              Your suggested stop has been submitted<br />for verification.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              We will review your suggestion and update<br />the route once verified.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
