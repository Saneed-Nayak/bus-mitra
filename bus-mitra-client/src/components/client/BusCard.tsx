import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin } from 'lucide-react';
import { Timetable } from '../../types';

interface BusCardProps {
  timetable: Timetable;
  onAddViaStop?: () => void;
}

export const BusCard: React.FC<BusCardProps> = ({ timetable, onAddViaStop }) => {
  const navigate = useNavigate();

  const viaStops = timetable.viaStops?.length
    ? timetable.viaStops
    : timetable.via?.split(/\s*(?:→|,)\s*/).filter(Boolean) || [];
  const routeLabel = [timetable.fromStandName, ...viaStops, timetable.toStandName].join(' → ');

  const handleViewStops = () => {
    // Navigate to route stops page using timetable ID (each bus/trip has its own via stops)
    navigate(`/bus/${encodeURIComponent(timetable.id)}/stops`, {
      state: {
        timetable: timetable,
      },
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Left Red Accent Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l" />

        <div className="flex items-center justify-between pl-1">
          {/* Departure Time & Bus Type */}
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
              <Bus className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Departure Time */}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {timetable.departureTime}
                </span>
              </div>

              {/* Bus Type / Name */}
              <div className="text-xs font-semibold text-red-700 tracking-wide mt-0.5">
                {timetable.busName || timetable.busType}
              </div>

              {/* Route From → To */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mt-2">
                <span className="truncate">{routeLabel}</span>
              </div>

              {/* Via Stops Status & CTA */}
              <button
                onClick={handleViewStops}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                View Stops
              </button>
            </div>
          </div>

          {/* Right side clean indicator */}
          <div className="flex flex-col items-end justify-between self-stretch shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Daily
            </span>
            <div className="text-[11px] text-slate-400 font-medium">
              KSRTC / NWKRTC
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
