import React from 'react';
import { Timetable } from '../../types';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface AddViaStopStep3Props {
  timetable: Timetable;
  existingViaStops: string[];
  selectedStop: string;
  position: number;
  setPosition: (pos: number) => void;
}

export const AddViaStopStep3: React.FC<AddViaStopStep3Props> = ({
  timetable,
  existingViaStops,
  selectedStop,
  position,
  setPosition,
}) => {
  // Build the full route list
  const fullRoute = [timetable.fromStandName, ...existingViaStops, timetable.toStandName];
  
  // Number of positions is between the stops (can insert between any two consecutive stops)
  const maxPosition = fullRoute.length - 1;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-4">Where does this stop belong?</label>
        
        {/* Visual Route Timeline */}
        <div className="space-y-2">
          {fullRoute.map((stop, idx) => (
            <React.Fragment key={idx}>
              {/* Stop */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 border-2 border-red-300">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{stop}</div>
                  <div className="text-xs text-slate-500">
                    {idx === 0 ? 'Start' : idx === fullRoute.length - 1 ? 'End' : `Stop ${idx}`}
                  </div>
                </div>
              </div>

              {/* Insert Position (between stops) */}
              {idx < fullRoute.length - 1 && (
                <button
                  onClick={() => setPosition(idx)}
                  className={`mx-8 py-3 px-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    position === idx
                      ? 'border-red-600 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${position === idx ? 'bg-red-600' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-semibold ${position === idx ? 'text-red-600' : 'text-slate-600'}`}>
                      Insert "{selectedStop}" here
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${position === idx ? 'text-red-600' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </div>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Preview */}
      {selectedStop && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-600 mb-2">RESULTING ROUTE</div>
          <div className="text-sm font-semibold text-slate-900">
            {[
              ...fullRoute.slice(0, position + 1),
              selectedStop,
              ...fullRoute.slice(position + 1),
            ].join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
};
