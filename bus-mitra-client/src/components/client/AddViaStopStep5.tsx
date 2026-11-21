import React from 'react';
import { Timetable } from '../../types';
import { CheckCircle2, Clock, Shield } from 'lucide-react';

interface AddViaStopStep5Props {
  timetable: Timetable;
  stopName: string;
  position: number;
  existingViaStops: string[];
  reason: string;
}

export const AddViaStopStep5: React.FC<AddViaStopStep5Props> = ({
  timetable,
  stopName,
  position,
  existingViaStops,
  reason,
}) => {
  // Build the full route with the new stop
  const fullRoute = [timetable.fromStandName, ...existingViaStops, timetable.toStandName];
  const resultingRoute = [
    ...fullRoute.slice(0, position + 1),
    stopName,
    ...fullRoute.slice(position + 1),
  ];

  const reasonLabel = {
    travelled: 'I travelled on this bus',
    regular_user: 'I regularly use this route',
    know_route: 'I know this route',
    other: 'Other',
  }[reason as keyof typeof reason] || reason;

  return (
    <div className="space-y-6">
      {/* Verification Details */}
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-600 font-semibold mb-1">STOP NAME</div>
          <div className="text-sm font-bold text-slate-900">{stopName}</div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-600 font-semibold mb-1">RESULTING ROUTE</div>
          <div className="text-xs font-medium text-slate-700 leading-relaxed">
            {resultingRoute.join(' → ')}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-600 font-semibold mb-1">YOUR REASON</div>
          <div className="text-sm text-slate-900">{reasonLabel}</div>
        </div>
      </div>

      {/* What happens next */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">What happens next?</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">Under Review</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Our team will verify your suggestion within 24-48 hours.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">Once Verified</div>
              <div className="text-xs text-slate-600 mt-0.5">
                The stop will be added to the route and visible to all passengers searching for this route.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">Community Driven</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Your contribution helps thousands of commuters get accurate bus information.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <div className="text-xs text-emerald-700">
          <strong>Thank you!</strong> We appreciate your help in making bus information more accurate and helpful.
        </div>
      </div>
    </div>
  );
};
