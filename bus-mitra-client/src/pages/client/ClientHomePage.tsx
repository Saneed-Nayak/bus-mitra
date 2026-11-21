import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchCard } from '../../components/client/SearchCard';
import { PopularStands } from '../../components/client/PopularStands';
import { BusCard } from '../../components/client/BusCard';
import { useData } from '../../context/DataContext';
import { TimeFilterOption } from '../../types';
import { ArrowRight, Clock, Info, Sparkles, Bus, MapPin, Navigation, ChevronRight, X } from 'lucide-react';

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { busStands, publishedRoutes, publishedTimetables, isLoading } = useData();

  const [fromStand, setFromStand] = useState<string>('');
  const [toStand, setToStand] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<Array<{from: string, to: string, timestamp: string}>>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyStands, setNearbyStands] = useState<Array<{stand: string, distance: number}>>([]);
  const [showNearbyModal, setShowNearbyModal] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  const handleSwap = () => {
    const temp = fromStand;
    setFromStand(toStand);
    setToStand(temp);
  };

  const handleSearch = () => {
    if (!fromStand || !toStand) return;
    
    setIsSearching(true);
    
    // Save to recent searches
    const newSearch = {
      from: fromStand,
      to: toStand,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newSearch, ...recentSearches.filter(s => !(s.from === fromStand && s.to === toStand))].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    setTimeout(() => {
      setIsSearching(false);
      const searchParams = new URLSearchParams();
      if (fromStand) searchParams.set('from', fromStand);
      if (toStand) searchParams.set('to', toStand);
      if (timeFilter !== 'all') searchParams.set('time', timeFilter);
      navigate(`/buses?${searchParams.toString()}`);
    }, 150);
  };

  const handleStandSelect = (standName: string) => {
    if (!fromStand) {
      setFromStand(standName);
    } else if (!toStand && standName !== fromStand) {
      setToStand(standName);
    } else if (fromStand && toStand) {
      // If both already set, update destination
      if (standName !== fromStand) {
        setToStand(standName);
      } else {
        setFromStand(standName);
      }
    }
  };

  const handleUseLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Calculate distance to all bus stands
        const standsWithDistance = busStands
          .filter(s => s.status === 'Active' && s.latitude && s.longitude)
          .map((stand) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              stand.latitude!,
              stand.longitude!
            );
            return { stand: stand.name, distance };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5); // Get top 5 nearest

        setNearbyStands(standsWithDistance);
        setShowNearbyModal(true);
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        alert(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleNearbyStandSelect = (standName: string) => {
    setFromStand(standName);
    setShowNearbyModal(false);
  };

  const handleRecentSearchClick = (from: string, to: string) => {
    setFromStand(from);
    setToStand(to);
    navigate(`/buses?from=${from}&to=${to}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Searched just now';
    if (diffMins < 60) return `Searched ${diffMins} min ago`;
    if (diffHours < 24) return diffHours === 1 ? 'Searched 1 hour ago' : `Searched ${diffHours} hours ago`;
    if (diffDays === 1) return 'Searched yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Hero Section - Full width on all screens */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg">
        <img
          src="/images/ksrtc-hero-bus.png"
          alt="KSRTC Bus"
          className="absolute right-0 bottom-0 h-full w-auto object-contain opacity-90 mix-blend-overlay"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="relative z-10 p-6 pb-8 lg:p-8 lg:pb-10 bg-gradient-to-r from-red-600/95 via-red-600/80 to-transparent">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight mb-1">
            Your Journey<br />Starts Here
          </h1>
          <p className="text-sm lg:text-base text-red-50">
            Check bus timings and find routes across<br />Karnataka.
          </p>
        </div>
      </div>

      {/* Desktop: 2-column grid, Mobile: single column */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
        {/* Left Column - Search Card */}
        <div className="lg:col-span-1">
          {/* Main Search Card */}
          <SearchCard
            busStands={busStands}
            fromValue={fromStand}
            toValue={toStand}
            timeFilter={timeFilter}
            onFromChange={setFromStand}
            onToChange={setToStand}
            onTimeChange={setTimeFilter}
            onSwap={handleSwap}
            onSearch={handleSearch}
            isSearching={isSearching}
          />
        </div>

        {/* Right Column - Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Find Bus Stop Near You */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  Find Bus Stop Near You
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Find the nearest bus stop using your current location.
                </p>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation className="w-4 h-4" />
                  {locationLoading ? 'Finding...' : 'Use My Location'}
                </button>
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Location is only used to find nearby bus stops.
                </p>
              </div>
            </div>
          </div>

          {/* Timetable Information */}
          <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-4 text-slate-700 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-orange-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-orange-900 mb-1">
                Timetable Information
              </h3>
              <p className="text-xs text-orange-800 leading-relaxed">
                Bus schedules are maintained from available depot timetable data. Timings may vary due to road and weather conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Searches - Full width below on all screens */}
      {recentSearches.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              Recent Searches
            </h3>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRecentSearchClick(search.from, search.to)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <Clock className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{search.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{search.to}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {getTimeAgo(search.timestamp)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/buses')}
            className="w-full mt-3 flex items-center justify-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 py-2"
          >
            <Clock className="w-3.5 h-3.5" />
            View all recent searches
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Nearby Bus Stands Modal */}
      {showNearbyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Nearby Bus Stops</h3>
              <button
                onClick={() => setShowNearbyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nearby Stands List */}
            <div className="flex-1 overflow-y-auto p-4">
              {nearbyStands.length > 0 ? (
                <div className="space-y-2">
                  {nearbyStands.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNearbyStandSelect(item.stand)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.stand}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {item.distance < 1
                              ? `${Math.round(item.distance * 1000)} meters away`
                              : `${item.distance.toFixed(1)} km away`}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No nearby bus stops found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
