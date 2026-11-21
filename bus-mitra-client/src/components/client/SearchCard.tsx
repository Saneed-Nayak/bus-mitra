import React, { useState } from 'react';
import { MapPin, Clock, ArrowUpDown, Search, ChevronDown, Compass, X } from 'lucide-react';
import { BusStand, TimeFilterOption } from '../../types';

interface SearchCardProps {
  busStands: BusStand[];
  fromValue: string;
  toValue: string;
  timeFilter: TimeFilterOption;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onTimeChange: (val: TimeFilterOption) => void;
  onSwap: () => void;
  onSearch: () => void;
  isSearching?: boolean;
}

export const SearchCard: React.FC<SearchCardProps> = ({
  busStands,
  fromValue,
  toValue,
  timeFilter,
  onFromChange,
  onToChange,
  onTimeChange,
  onSwap,
  onSearch,
  isSearching = false,
}) => {
  const activeStands = busStands.filter((s) => s.status === 'Active');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleStandSelect = (standName: string, isFrom: boolean) => {
    if (isFrom) {
      onFromChange(standName);
      setShowFromModal(false);
      setFromSearchQuery('');
    } else {
      onToChange(standName);
      setShowToModal(false);
      setToSearchQuery('');
    }
  };

  const filteredFromStands = activeStands.filter((stand) =>
    stand.name.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    stand.kannadaName?.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    stand.district.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  const filteredToStands = activeStands.filter((stand) =>
    stand.name.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    stand.kannadaName?.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    stand.district.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* FROM and TO combined in a single container */}
          <div className="relative bg-slate-50 rounded-xl border border-slate-200">
            {/* FROM Field */}
            <button
              type="button"
              onClick={() => setShowFromModal(true)}
              className="relative w-full border-b border-slate-200 text-left"
            >
              <div className="absolute top-3 left-4 flex items-center gap-2.5 pointer-events-none z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-100" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FROM</span>
              </div>
              <div className="pt-10 pb-3 px-4">
                <div className="relative flex items-center">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                  <span className={`text-base font-semibold ${fromValue ? 'text-slate-900' : 'text-slate-400'}`}>
                    {fromValue || 'Select Bus Stand'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
                </div>
              </div>
            </button>

            {/* Swap Button - positioned absolutely between FROM and TO */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
              <button
                type="button"
                onClick={onSwap}
                title="Swap Origin & Destination"
                className="w-10 h-10 rounded-full bg-white hover:bg-red-600 text-slate-600 hover:text-white flex items-center justify-center border-2 border-slate-200 hover:border-red-600 transition-all shadow-sm cursor-pointer"
              >
                <ArrowUpDown className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* TO Field */}
            <button
              type="button"
              onClick={() => setShowToModal(true)}
              className="relative w-full text-left"
            >
              <div className="absolute top-3 left-4 flex items-center gap-2.5 pointer-events-none z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-100" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TO</span>
              </div>
              <div className="pt-10 pb-3 px-4">
                <div className="relative flex items-center">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                  <span className={`text-base font-semibold ${toValue ? 'text-slate-900' : 'text-slate-400'}`}>
                    {toValue || 'Select Destination'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
                </div>
              </div>
            </button>
          </div>

          {/* TIME Field */}
          <div className="bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative">
              <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none z-10">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TIME</span>
              </div>
              <div className="pt-10 pb-3 px-4">
                <div className="relative">
                  <Clock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={timeFilter}
                    onChange={(e) => onTimeChange(e.target.value as TimeFilterOption)}
                    className="w-full pl-8 pr-8 py-0 bg-transparent border-0 text-slate-900 text-base font-semibold focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="all">Any Time (All Timetables)</option>
                    <option value="before_10am">Before 10:00 AM</option>
                    <option value="after_10am">After 10:00 AM</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 9 PM)</option>
                    <option value="night">Night (9 PM - 5 AM)</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching || !fromValue || !toValue}
            className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search Buses</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* FROM Modal */}
      {showFromModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Select Bus Stand</h3>
              <button
                onClick={() => {
                  setShowFromModal(false);
                  setFromSearchQuery('');
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={fromSearchQuery}
                  onChange={(e) => setFromSearchQuery(e.target.value)}
                  placeholder="Search bus stand..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Bus Stand List */}
            <div className="flex-1 overflow-y-auto">
              {filteredFromStands.length > 0 ? (
                filteredFromStands.map((stand) => (
                  <button
                    key={stand.id}
                    onClick={() => handleStandSelect(stand.name, true)}
                    disabled={stand.name.toLowerCase() === toValue.toLowerCase()}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
                  >
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{stand.name}</div>
                      {stand.kannadaName && (
                        <div className="text-xs text-slate-500">{stand.kannadaName}</div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{stand.district}</div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No bus stands found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TO Modal */}
      {showToModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Select Destination</h3>
              <button
                onClick={() => {
                  setShowToModal(false);
                  setToSearchQuery('');
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={toSearchQuery}
                  onChange={(e) => setToSearchQuery(e.target.value)}
                  placeholder="Search bus stand..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Bus Stand List */}
            <div className="flex-1 overflow-y-auto">
              {filteredToStands.length > 0 ? (
                filteredToStands.map((stand) => (
                  <button
                    key={stand.id}
                    onClick={() => handleStandSelect(stand.name, false)}
                    disabled={stand.name.toLowerCase() === fromValue.toLowerCase()}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
                  >
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{stand.name}</div>
                      {stand.kannadaName && (
                        <div className="text-xs text-slate-500">{stand.kannadaName}</div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{stand.district}</div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No bus stands found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
