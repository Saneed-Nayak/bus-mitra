import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Plus, Search, Edit2, Trash2, Check, X, Star, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { busStandsApi } from '../../services/api';
import { BusStand } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminBusStandsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { busStands, notifyChange } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<BusStand | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formKannadaName, setFormKannadaName] = useState('');
  const [formDistrict, setFormDistrict] = useState('Uttara Kannada');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const districts = ['All', 'Uttara Kannada', 'Dharwad', 'Belagavi', 'Dakshina Kannada', 'Udupi', 'Shivamogga', 'Bengaluru Urban'];

  const filteredStands = busStands.filter((stand) => {
    const matchesQuery =
      stand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stand.kannadaName && stand.kannadaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      stand.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === 'All' || stand.district === districtFilter;
    return matchesQuery && matchesDistrict;
  });

  const openAddModal = () => {
    setEditingStand(null);
    setFormName('');
    setFormKannadaName('');
    setFormDistrict('Uttara Kannada');
    setFormStatus('Active');
    setFormIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (stand: BusStand) => {
    setEditingStand(stand);
    setFormName(stand.name);
    setFormKannadaName(stand.kannadaName || '');
    setFormDistrict(stand.district);
    setFormStatus(stand.status);
    setFormIsPopular(!!stand.isPopular);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setIsSaving(true);
      if (editingStand) {
        await busStandsApi.update(editingStand.id, {
          name: formName.trim(),
          kannadaName: formKannadaName.trim() || undefined,
          district: formDistrict,
          status: formStatus,
          isPopular: formIsPopular,
        });
      } else {
        await busStandsApi.create({
          name: formName.trim(),
          kannadaName: formKannadaName.trim() || undefined,
          district: formDistrict,
          status: formStatus,
          isPopular: formIsPopular,
        });
      }
      notifyChange();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save bus stand:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (stand: BusStand) => {
    const nextStatus = stand.status === 'Active' ? 'Inactive' : 'Active';
    await busStandsApi.update(stand.id, { status: nextStatus });
    notifyChange();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete bus stand "${name}"?`)) {
      await busStandsApi.delete(id);
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
              placeholder="Search bus stands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bus Stand</span>
        </button>
      </div>

      {/* Bus Stands Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Registered Bus Stands ({filteredStands.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Stored in Backend Database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Bus Stand</th>
                <th className="py-3 px-4">Kannada</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Popular</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStands.map((stand) => (
                <tr key={stand.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{stand.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-kannada">
                    {stand.kannadaName || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {stand.district}
                  </td>
                  <td className="py-3.5 px-4">
                    {stand.isPopular ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Popular
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(stand)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        stand.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          stand.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {stand.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(stand)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Bus Stand"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stand.id, stand.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        title="Delete Bus Stand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bus Stand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStand ? 'Edit Bus Stand' : 'Add New Bus Stand'}
        subtitle="Manage station metadata for the Karnataka bus network"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bus Stand Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kumta, Sirsi, Karwar"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kannada Name (ಕನ್ನಡ ಹೆಸರು)
            </label>
            <input
              type="text"
              placeholder="e.g. ಕುಮಟಾ, ಶಿರಸಿ"
              value={formKannadaName}
              onChange={(e) => setFormKannadaName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-kannada"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <select
              value={formDistrict}
              onChange={(e) => setFormDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="Uttara Kannada">Uttara Kannada</option>
              <option value="Dharwad">Dharwad</option>
              <option value="Belagavi">Belagavi</option>
              <option value="Dakshina Kannada">Dakshina Kannada</option>
              <option value="Udupi">Udupi</option>
              <option value="Shivamogga">Shivamogga</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Popular Quick Stand
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPopular}
                  onChange={(e) => setFormIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700">Show on Home</span>
              </label>
            </div>
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
              {isSaving ? 'Saving...' : editingStand ? 'Save Changes' : 'Create Bus Stand'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
