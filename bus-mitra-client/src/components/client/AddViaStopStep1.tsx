import React from 'react';
import { Timetable } from '../../types';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

interface AddViaStopStep1Props {
  timetable: Timetable;
}

export const AddViaStopStep1: React.FC<AddViaStopStep1Props> = ({ timetable }) => {
  return (
    <div className="space-y-6">
      {/* Route Display */}
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <div className="text-xs text-red-600 font-semibold mb-2">ROUTE</div>
        <div className="text-base font-bold text-slate-900">
          {timetable.fromStandName} → {timetable.toStandName}
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">
          Help other passengers by adding a stop on this route that's missing from our system.
        </p>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-700">Helps other travellers plan better journeys</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-700">Takes less than a minute to complete</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-700">Your suggestion will be reviewed by our team</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="text-xs text-blue-700">
          <strong>Note:</strong> Your submission will be marked as "pending" until verified by our team. Only verified stops will be visible to all users.
        </div>
      </div>
    </div>
  );
};
