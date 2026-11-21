import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Calendar,
  Filter,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { viaStopsApi } from '../../services/api';
import { ViaStopSuggestion } from '../../types';
import { Modal } from '../../components/common/Modal';

interface ViaStopWithRoute extends ViaStopSuggestion {
  routeLabel?: string;
}

export const AdminViaStopsPage: React.FC = () => {
  const { routes, busStands } = useData();

  const [viaStops, setViaStops] = useState<ViaStopWithRoute[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViaStop, setSelectedViaStop] = useState<ViaStopWithRoute | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [editedPosition, setEditedPosition] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending via-stops
  useEffect(() => {
    const fetchViaStops = async () => {
      try {
        setIsLoading(true);
        const response = await viaStopsApi.getAll();
        
        // Enrich with route labels
        const enriched: ViaStopWithRoute[] = response.map((vs: ViaStopSuggestion) => {
          const route = routes.find((r) => r.id === vs.routeId);
          return {
            ...vs,
            routeLabel: route
              ? `${route.fromStandName} → ${route.toStandName}`
              : 'Unknown Route',
          };
        });

        setViaStops(enriched);
      } catch (err) {
        console.error('Failed to fetch via-stops:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViaStops();
  }, [routes]);

  // Filter via-stops
  const filteredViaStops = viaStops.filter((vs) => {
    const matchesStatus = statusFilter === 'All' || vs.status === statusFilter;
    const matchesSearch =
      vs.stopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vs.routeLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vs.fromStandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vs.toStandName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Handle Approve
  const handleApprove = async (vs: ViaStopWithRoute) => {
    try {
      setIsProcessing(true);
      await viaStopsApi.updateStatus(
        vs.id,
        'verified',
        adminNotesInput || 'Approved by admin. Now visible to all passengers.',
        editedPosition !== null ? editedPosition : vs.position
      );

      // Update local state
      setViaStops(
        viaStops.map((v) =>
          v.id === vs.id
            ? {
                ...v,
                status: 'verified',
                adminNotes: adminNotesInput,
                position: editedPosition !== null ? editedPosition : v.position,
              }
            : v
        )
      );

      setSelectedViaStop(null);
      setSuccessBanner(`✓ Via-stop "${vs.stopName}" approved and published!`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Failed to approve via-stop:', err);
      alert('Error approving via-stop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleReject = async (vs: ViaStopWithRoute) => {
    try {
      setIsProcessing(true);
      await viaStopsApi.updateStatus(
        vs.id,
        'rejected',
        adminNotesInput || 'Rejected by admin review.'
      );

      // Update local state
      setViaStops(
        viaStops.map((v) =>
          v.id === vs.id
            ? {
                ...v,
                status: 'rejected',
                adminNotes: adminNotesInput,
              }
            : v
        )
      );

      setSelectedViaStop(null);
      setSuccessBanner(`✗ Via-stop "${vs.stopName}" rejected.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Failed to reject via-stop:', err);
      alert('Error rejecting via-stop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete
  const handleDelete = async (vs: ViaStopWithRoute) => {
    if (!window.confirm(`Delete via-stop "${vs.stopName}"?`)) return;

    try {
      setIsProcessing(true);
      await viaStopsApi.delete(vs.id);

      setViaStops(viaStops.filter((v) => v.id !== vs.id));
      setSelectedViaStop(null);
      setSuccessBanner(`Deleted "${vs.stopName}"`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Failed to delete via-stop:', err);
      alert('Error deleting via-stop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openReviewModal = (vs: ViaStopWithRoute) => {
    setSelectedViaStop(vs);
    setAdminNotesInput(vs.adminNotes || '');
    setEditedPosition(vs.position);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'verified':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Reason badge
  const getReasonLabel = (reason: string) => {
    const reasons: { [key: string]: string } = {
      travelled: '✓ Travelled This Route',
      regular_user: 'Regular Passenger',
      know_route: 'Route Expert',
      other: 'Other',
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{successBanner}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Via-Stop Submissions
            </h1>
            <p className="text-sm text-blue-100 mt-2">
              Review and approve community-submitted bus stops. Approved stops appear on the Passenger App.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{filteredViaStops.length}</div>
            <div className="text-xs text-blue-100 font-semibold">
              {statusFilter === 'All' ? 'Total' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by stop name, route, or submitter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'pending', 'verified', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading via-stops...</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredViaStops.length === 0 && (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold">No via-stops found</p>
          <p className="text-xs text-slate-500 mt-1">Check your filters or wait for community submissions</p>
        </div>
      )}

      {/* Via-Stops List */}
      {!isLoading && filteredViaStops.length > 0 && (
        <div className="space-y-3">
          {filteredViaStops.map((vs) => (
            <div
              key={vs.id}
              className="border border-slate-300 rounded-2xl p-4 bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Route Info */}
                  <div className="text-xs text-slate-500 font-semibold mb-2">
                    {vs.routeLabel}
                  </div>

                  {/* Stop Name */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{vs.stopName}</h3>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500 font-semibold mb-1">Position</div>
                      <div className="text-slate-900 font-bold">After stop #{vs.position}</div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500 font-semibold mb-1">Reason</div>
                      <div className="text-slate-900 font-bold">{getReasonLabel(vs.reason)}</div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500 font-semibold mb-1">Status</div>
                      <span className={`inline-block px-2 py-1 rounded-lg font-bold text-xs ${getStatusColor(vs.status)}`}>
                        {vs.status.charAt(0).toUpperCase() + vs.status.slice(1)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500 font-semibold mb-1">Submitted</div>
                      <div className="text-slate-900 font-bold text-xs">
                        {new Date(vs.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {vs.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-blue-900 mb-1">Submitter Notes:</div>
                      <div className="text-xs text-blue-800">{vs.notes}</div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {vs.adminNotes && (
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-700 mb-1">Admin Notes:</div>
                      <div className="text-xs text-slate-800">{vs.adminNotes}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openReviewModal(vs)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>

                  {vs.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setAdminNotesInput('');
                          setEditedPosition(vs.position);
                          handleApprove(vs);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setAdminNotesInput('');
                          handleReject(vs);
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(vs)}
                    className="px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedViaStop && (
        <Modal isOpen={true} onClose={() => setSelectedViaStop(null)}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Review Via-Stop: {selectedViaStop.stopName}
            </h2>

            {/* Route Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-blue-900 mb-2">Route:</div>
              <div className="text-sm text-blue-800 font-bold">{selectedViaStop.routeLabel}</div>
              <div className="text-xs text-blue-700 mt-1">
                Position: After stop #{selectedViaStop.position}
              </div>
            </div>

            {/* Stop Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Reason Given:</div>
                <div className="text-sm font-bold text-slate-900">
                  {getReasonLabel(selectedViaStop.reason)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Status:</div>
                <span
                  className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${getStatusColor(
                    selectedViaStop.status
                  )}`}
                >
                  {selectedViaStop.status.charAt(0).toUpperCase() + selectedViaStop.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Submitter Notes */}
            {selectedViaStop.notes && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Submitter Notes:
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                  {selectedViaStop.notes}
                </div>
              </div>
            )}

            {/* Edit Position (if pending) */}
            {selectedViaStop.status === 'pending' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Edit Position (optional):
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedPosition || 0}
                  onChange={(e) => setEditedPosition(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Position indicates where this stop should appear in the route
                </p>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Admin Notes (optional):
              </label>
              <textarea
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add notes for your decision..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setSelectedViaStop(null)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-bold transition-all"
              >
                Cancel
              </button>

              {selectedViaStop.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedViaStop)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </button>

                  <button
                    onClick={() => handleApprove(selectedViaStop)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
