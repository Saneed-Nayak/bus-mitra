import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BusCard } from '../../components/client/BusCard';
import { TimeFilterPills } from '../../components/client/TimeFilterPills';
import { useData } from '../../context/DataContext';
import { timetablesApi } from '../../services/api';
import { Timetable, TimeFilterOption } from '../../types';
import {
  Search,
  Calendar,
  Filter,
  ArrowRight,
  ArrowLeft,
  MapPin,
  RefreshCw,
  AlertCircle,
  MessageSquarePlus,
  Compass,
} from 'lucide-react';

export const ClientBusesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { busStands, publishedTimetables } = useData();

  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const timeParam = (searchParams.get('time') as TimeFilterOption) || 'all';

  const [fromStand, setFromStand] = useState<string>(fromParam);
  const [toStand, setToStand] = useState<string>(toParam);
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>(timeParam);
  const [isEditingSearch, setIsEditingSearch] = useState<boolean>(!fromParam && !toParam);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Timetable[]>([]);

  // Sync params on URL change
  useEffect(() => {
    setFromStand(fromParam);
    setToStand(toParam);
    setTimeFilter(timeParam);
  }, [fromParam, toParam, timeParam]);

  // Execute Search whenever query parameters or publishedTimetables change
  useEffect(() => {
    let isMounted = true;
    const fetchFilteredTimetables = async () => {
      setIsLoadingResults(true);
      try {
        const response = await timetablesApi.search({
          from: fromParam,
          to: toParam,
          timeFilter: timeFilter,
        });
        if (isMounted) {
          setSearchResults(response.timetables);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      }
    };

    fetchFilteredTimetables();

    return () => {
      isMounted = false;
    };
  }, [fromParam, toParam, timeFilter, publishedTimetables]);

  const handleApplyFilter = (newTimeFilter: TimeFilterOption) => {
    setTimeFilter(newTimeFilter);
    const params = new URLSearchParams(searchParams);
    params.set('time', newTimeFilter);
    setSearchParams(params);
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromStand) params.set('from', fromStand);
    if (toStand) params.set('to', toStand);
    if (timeFilter !== 'all') params.set('time', timeFilter);
    setSearchParams(params);
    setIsEditingSearch(false);
  };

  const hasRouteSpecified = fromParam || toParam;

  return (
    <div className="space-y-4">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        {hasRouteSpecified && !isEditingSearch ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <span>{fromParam || 'Any Stand'}</span>
                <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
                <span>{toParam || 'Any Destination'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date: <strong className="text-slate-700">Today</strong>
                </span>
                <span>•</span>
                <span>
                  <strong>{searchResults.length}</strong> {searchResults.length === 1 ? 'bus' : 'buses'} found
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditingSearch(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSearch} className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-red-600" />
                Search Route Timetables
              </h2>
              {hasRouteSpecified && (
                <button
                  type="button"
                  onClick={() => setIsEditingSearch(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">From Stand</label>
                <select
                  value={fromStand}
                  onChange={(e) => setFromStand(e.target.value)}
                  className="w-full mt-0.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Origin Stands</option>
                  {busStands.filter((s) => s.status === 'Active').map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.kannadaName ? `(${s.kannadaName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">To Destination</label>
                <select
                  value={toStand}
                  onChange={(e) => setToStand(e.target.value)}
                  className="w-full mt-0.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Destinations</option>
                  {busStands.filter((s) => s.status === 'Active').map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.kannadaName ? `(${s.kannadaName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Update Search
            </button>
          </form>
        )}
      </div>

      {/* Filter Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-red-600" />
            Time Filter
          </span>
          {timeFilter !== 'all' && (
            <button
              onClick={() => handleApplyFilter('all')}
              className="text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
        <TimeFilterPills selected={timeFilter} onChange={handleApplyFilter} />
      </div>

      {/* Results Section */}
      <div className="space-y-2.5 pt-1">
        {/* Loading State */}
        {isLoadingResults ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-slate-200 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-16" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-48" />
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          /* Bus Timetable Cards (ONLY: Departure Time, Bus Type/Name, From → To, Bus Icon) */
          searchResults.map((timetable) => (
            <BusCard key={timetable.id} timetable={timetable} />
          ))
        ) : (
          /* Empty State (Complies exactly with: "No buses found. Try another From / To combination.") */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs my-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No buses found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Try another From / To combination or clear the time filter.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  setFromStand('');
                  setToStand('');
                  setTimeFilter('all');
                  setSearchParams({});
                  setIsEditingSearch(true);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
              <Link
                to={`/suggest?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Suggest This Route</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
