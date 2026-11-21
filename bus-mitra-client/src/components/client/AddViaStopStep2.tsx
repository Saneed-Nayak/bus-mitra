import React, { useState, useMemo } from 'react';
import { BusStand } from '../../types';
import { Search, Edit3, MapPin } from 'lucide-react';

interface AddViaStopStep2Props {
  busStands: BusStand[];
  selectedStop: string;
  setSelectedStop: (stop: string) => void;
  isCustomStop: boolean;
  setIsCustomStop: (isCustom: boolean) => void;
  customStopName: string;
  setCustomStopName: (name: string) => void;
}

export const AddViaStopStep2: React.FC<AddViaStopStep2Props> = ({
  busStands,
  selectedStop,
  setSelectedStop,
  isCustomStop,
  setIsCustomStop,
  customStopName,
  setCustomStopName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stops based on search
  const filteredStops = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return busStands.slice(0, 10); // Show top 10 popular stops by default
    return busStands.filter(
      (stop) =>
        stop.name.toLowerCase().includes(query) ||
        stop.kannadaName?.toLowerCase().includes(query)
    ).slice(0, 15);
  }, [searchQuery, busStands]);

  const handleSelectStop = (stopName: string) => {
    setSelectedStop(stopName);
    setIsCustomStop(false);
    setCustomStopName('');
    setSearchQuery('');
  };

  const handleCustomStop = () => {
    setIsCustomStop(true);
    setSelectedStop('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Which stop is missing?</label>
        
        {/* Search Field */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bus stop"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Suggested/Searched Stops */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredStops.length > 0 ? (
          filteredStops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => handleSelectStop(stop.name)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedStop === stop.name && !isCustomStop
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm">{stop.name}</div>
                  {stop.kannadaName && (
                    <div className="text-xs text-slate-500 mt-0.5">{stop.kannadaName}</div>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">No stops found. Try entering a custom stop name below.</div>
        )}
      </div>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-500">or</span>
        </div>
      </div>

      {/* Custom Stop Entry */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Enter manually</label>
        <div className="relative">
          <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Stop name"
            value={customStopName}
            onChange={(e) => {
              setCustomStopName(e.target.value);
              if (e.target.value.trim()) {
                setIsCustomStop(true);
                setSelectedStop('');
              }
            }}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        {customStopName.trim() && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
            Custom stop: <strong>{customStopName.trim()}</strong>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-600">
          <strong>Tip:</strong> Search for existing stops in our database first. If not found, enter the name manually.
        </div>
      </div>
    </div>
  );
};
