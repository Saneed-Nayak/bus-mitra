import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Route, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, ArrowRight, Clock, Globe } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { routesApi } from '../../services/api';
import { BusRoute } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminRoutesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { routes, busStands, timetables, notifyChange, refreshAllData } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);

  // Form State
  const [formFrom, setFormFrom] = useState('');
  const [formTo, setFormTo] = useState('');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft' | 'Inactive'>('Published');
  const [formDistance, setFormDistance] = useState<string>('');
  const [formDuration, setFormDuration] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const activeStands = busStands.filter((s) => s.status === 'Active');

  const filteredRoutes = routes.filter((route) => {
    const matchesQuery =
      route.fromStandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.toStandName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openAddModal = () => {
    setEditingRoute(null);
    setFormFrom(activeStands[0]?.name || 'Kumta');
    setFormTo(activeStands[1]?.name || 'Sirsi');
    setFormStatus('Published');
    setFormDistance('');
    setFormDuration('');
    setIsModalOpen(true);
  };

  const openEditModal = (route: BusRoute) => {
    setEditingRoute(route);
    setFormFrom(route.fromStandName);
    setFormTo(route.toStandName);
    setFormStatus(route.status);
    setFormDistance(route.distanceKm ? route.distanceKm.toString() : '');
    setFormDuration(route.durationMinutes ? route.durationMinutes.toString() : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFrom || !formTo) return;
    if (formFrom.toLowerCase() === formTo.toLowerCase()) {
      alert('Origin and Destination must be different');
      return;
    }

    try {
      setIsSaving(true);
      if (editingRoute) {
        await routesApi.update(editingRoute.id, {
          fromStandName: formFrom,
          toStandName: formTo,
          status: formStatus,
          distanceKm: formDistance ? parseFloat(formDistance) : undefined,
          durationMinutes: formDuration ? parseInt(formDuration, 10) : undefined,
        });
      } else {
        await routesApi.create({
          fromStandName: formFrom,
          toStandName: formTo,
          status: formStatus,
          distanceKm: formDistance ? parseFloat(formDistance) : undefined,
          durationMinutes: formDuration ? parseInt(formDuration, 10) : undefined,
        });
      }
      notifyChange();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save route:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (route: BusRoute) => {
    const nextStatus = route.status === 'Published' ? 'Draft' : 'Published';
    await routesApi.update(route.id, { status: nextStatus });
    notifyChange();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete route "${name}"?`)) {
      await routesApi.delete(id);
      notifyChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search routes (e.g. Kumta, Karwar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Route</span>
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Bus Routes ({filteredRoutes.length})
            </h3>
            <p className="text-xs text-slate-500">
              Published routes are instantly queryable in Client search
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {routes.filter((r) => r.status === 'Published').length} Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Route Path</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Est. Time</th>
                <th className="py-3 px-4">Timetables</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route) => {
                const ttCount = timetables.filter(
                  (t) =>
                    t.fromStandName.toLowerCase() === route.fromStandName.toLowerCase() &&
                    t.toStandName.toLowerCase() === route.toStandName.toLowerCase()
                ).length;

                return (
                  <tr key={route.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{route.fromStandName}</span>
                        <ArrowRight className="w-4 h-4 text-red-600" />
                        <span>{route.toStandName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {route.distanceKm ? `${route.distanceKm} km` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {route.durationMinutes
                        ? `${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                        {ttCount} {ttCount === 1 ? 'bus' : 'buses'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(route)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          route.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            route.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {route.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(route)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Edit Route"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(route.id, `${route.fromStandName} → ${route.toStandName}`)
                          }
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          title="Delete Route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Route Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? 'Edit Bus Route' : 'Create New Bus Route'}
        subtitle="Define regional origin & destination transit connection"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              From Bus Stand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="from-stands-list"
              value={formFrom}
              onChange={(e) => setFormFrom(e.target.value)}
              placeholder="e.g. Kumta"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
            <datalist id="from-stands-list">
              {activeStands.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              To Destination Stand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="to-stands-list"
              value={formTo}
              onChange={(e) => setFormTo(e.target.value)}
              placeholder="e.g. Karwar"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
            <datalist id="to-stands-list">
              {activeStands.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approx Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 72"
                value={formDistance}
                onChange={(e) => setFormDistance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                placeholder="e.g. 105"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Route Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="Published">Published (Live for Passengers)</option>
              <option value="Draft">Draft (Hidden from Client)</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? 'Saving...' : editingRoute ? 'Save Changes' : 'Create Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
