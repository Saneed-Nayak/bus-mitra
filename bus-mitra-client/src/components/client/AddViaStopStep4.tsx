import React from 'react';
import { Timetable } from '../../types';
import { HelpCircle } from 'lucide-react';

interface AddViaStopStep4Props {
  timetable: Timetable;
  stopName: string;
  position: number;
  existingViaStops: string[];
  reason: 'travelled' | 'regular_user' | 'know_route' | 'other';
  setReason: (reason: 'travelled' | 'regular_user' | 'know_route' | 'other') => void;
  notes: string;
  setNotes: (notes: string) => void;
}

export const AddViaStopStep4: React.FC<AddViaStopStep4Props> = ({
  timetable,
  stopName,
  position,
  existingViaStops,
  reason,
  setReason,
  notes,
  setNotes,
}) => {
  // Build the full route with the new stop
  const fullRoute = [timetable.fromStandName, ...existingViaStops, timetable.toStandName];
  const resultingRoute = [
    ...fullRoute.slice(0, position + 1),
    stopName,
    ...fullRoute.slice(position + 1),
  ];

  const reasonOptions: Array<{
    value: typeof reason;
    label: string;
    description: string;
  }> = [
    { value: 'travelled', label: 'I travelled on this bus', description: 'I have actually been on this route' },
    { value: 'regular_user', label: 'I regularly use this route', description: 'This is a familiar route for me' },
    { value: 'know_route', label: 'I know this route', description: 'I have general knowledge about this route' },
    { value: 'other', label: 'Other', description: 'Different reason' },
  ];

  return (
    <div className="space-y-6">
      {/* Stop Details Summary */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-xs text-slate-600 font-semibold mb-1">STOP NAME</div>
        <div className="text-sm font-bold text-slate-900 mb-4">{stopName}</div>
        
        <div className="text-xs text-slate-600 font-semibold mb-1">ROUTE</div>
        <div className="text-xs text-slate-700 font-medium">
          {resultingRoute.join(' → ')}
        </div>
      </div>

      {/* How do you know this stop? */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">How do you know this stop?</label>
        <div className="space-y-2">
          {reasonOptions.map((option) => (
            <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
              style={{
                borderColor: reason === option.value ? '#dc2626' : '#e2e8f0',
                backgroundColor: reason === option.value ? '#fef2f2' : '#ffffff',
              }}
            >
              <input
                type="radio"
                name="reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="mt-1 w-4 h-4 text-red-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">{option.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
          Additional information
          <HelpCircle className="w-4 h-4 text-slate-400" />
        </label>
        <textarea
          placeholder="Tell us anything helpful about this stop (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
          rows={4}
        />
        <div className="mt-1 text-xs text-slate-500 text-right">{notes.length}/500</div>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="text-xs text-blue-700">
          <strong>Privacy:</strong> Your email or personal details won't be collected. Your submission helps the community.
        </div>
      </div>
    </div>
  );
};
