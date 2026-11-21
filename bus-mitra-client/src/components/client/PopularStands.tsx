import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { BusStand } from '../../types';

interface PopularStandsProps {
  stands: BusStand[];
  selectedFrom?: string;
  selectedTo?: string;
  onSelect: (standName: string) => void;
}

export const PopularStands: React.FC<PopularStandsProps> = ({
  stands,
  selectedFrom,
  selectedTo,
  onSelect,
}) => {
  // Sort popular stands or active stands
  const displayStands = stands.filter((s) => s.status === 'Active');

  if (displayStands.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          Popular Bus Stands
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Tap to set stand
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayStands.map((stand) => {
          const isFrom = selectedFrom?.toLowerCase() === stand.name.toLowerCase();
          const isTo = selectedTo?.toLowerCase() === stand.name.toLowerCase();
          const isSelected = isFrom || isTo;

          return (
            <button
              key={stand.id}
              onClick={() => onSelect(stand.name)}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <span>{stand.name}</span>
              {stand.kannadaName && (
                <span className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                  {stand.kannadaName}
                </span>
              )}
              {isFrom && (
                <span className="bg-white/20 text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                  From
                </span>
              )}
              {isTo && (
                <span className="bg-white/20 text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                  To
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
