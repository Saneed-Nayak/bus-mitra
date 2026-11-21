import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { Timetable } from '../../types';
import { Modal } from '../../components/common/Modal';
import { AddStopFlow } from '../../components/client/AddStopFlow';

interface LocationState {
  timetable: Timetable;
}

export const ClientRouteStopsPage: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [showAddStop, setShowAddStop] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!state?.timetable || !busId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">Bus information not found</p>
        </div>
      </div>
    );
  }

  const timetable = state.timetable;
  const viaStops = timetable.viaStops || [];

  // Build the full route: [fromStand, ...viaStops, toStand]
  const allStops = [timetable.fromStandName, ...viaStops, timetable.toStandName];

  const handleStopAdded = () => {
    setShowAddStop(false);
    // Refresh the page to show updated data
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Route Details</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Route Header */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {timetable.fromStandName} → {timetable.toStandName}
            </h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              • Daily
            </span>
          </div>
          <p className="text-xs text-gray-500">Route ID: {timetable.routeId.toUpperCase()}</p>
        </div>

        {/* Via Stops Section */}
        {viaStops.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <MapPin className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Route stops not added yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              We only have starting and ending<br />bus stands for this route.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Help other passengers!</p>
              <p className="text-xs text-blue-700">
                Add all the stops you know on this route.
              </p>
            </div>

            <button
              onClick={() => setShowAddStop(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Via Stop
            </button>

            <p className="text-xs text-gray-400 mt-3">
              Your suggestions will be reviewed before being shown to everyone.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              VIA STOPS ({viaStops.length})
            </h3>

            {/* Route Timeline */}
            <div className="space-y-0">
              {allStops.map((stop, index) => {
                const isStart = index === 0;
                const isEnd = index === allStops.length - 1;
                const isViaStop = !isStart && !isEnd;

                return (
                  <div key={`${stop}-${index}`} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isStart || isEnd
                            ? 'bg-red-600'
                            : 'bg-red-400'
                        }`}
                      />
                      {!isEnd && (
                        <div className="w-0.5 h-14 bg-red-200 my-0.5" />
                      )}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{stop}</p>
                        {isStart && (
                          <span className="text-xs font-bold text-green-600">Start</span>
                        )}
                        {isEnd && (
                          <span className="text-xs font-bold text-red-600">End</span>
                        )}
                        {isViaStop && (
                          <span className="text-xs text-gray-400">
                            ~{15 + index * 10} mins
                          </span>
                        )}
                      </div>
                      {isStart && (
                        <p className="text-xs text-gray-500">(Start Point)</p>
                      )}
                      {isEnd && (
                        <p className="text-xs text-gray-500">(End Point)</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Distance & Duration */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Total Distance:</span>
                <span className="font-semibold text-gray-900">~118 km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Duration:</span>
                <span className="font-semibold text-gray-900">~2h 00m (Approx.)</span>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-4 bg-blue-50 rounded-lg p-3 flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800">
                Timings are approximate and may vary depending on road & traffic conditions
              </p>
            </div>

            {/* Add/Update Stop Button */}
            <button
              onClick={() => setShowAddStop(true)}
              className="w-full mt-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add/Update Stop
            </button>
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      <Modal isOpen={showAddStop} onClose={() => setShowAddStop(false)}>
        <AddStopFlow
          fromStandName={timetable.fromStandName}
          toStandName={timetable.toStandName}
          busId={busId}
          timetable={timetable}
          onClose={() => setShowAddStop(false)}
          onStopAdded={handleStopAdded}
        />
      </Modal>
    </div>
  );
};
