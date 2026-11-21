import React, { useState } from 'react';
import { PhoneCall, Plus, Search, Edit2, Trash2, MapPin, Check, Upload } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { depotsApi } from '../../services/api';
import { DepotContact } from '../../types';
import { Modal } from '../../components/common/Modal';

type BulkDepot = {
  depotName: string;
  district: string;
  phoneNumber: string;
  altPhone?: string;
  address?: string;
  status?: 'Active' | 'Inactive';
};

const depotFields = ['depotName', 'district', 'phoneNumber', 'altPhone', 'address', 'status'];

const parseDelimitedLine = (line: string, separator: string) => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === separator && !quoted) {
      values.push(value.trim());
      value = '';
    } else value += character;
  }
  values.push(value.trim());
  return values;
};

const parseBulkDepots = (text: string, format: 'text' | 'json'): BulkDepot[] => {
  if (format === 'json') {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : parsed?.depots;
    if (!Array.isArray(items)) throw new Error('JSON must be an array or an object with a depots array.');
    return items as BulkDepot[];
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const separator = lines[0].includes('\t') ? '\t' : lines[0].includes('|') ? '|' : ',';
  const firstRow = parseDelimitedLine(lines[0], separator).map((field) => field.toLowerCase().replace(/[\s_/-]+/g, ''));
  const hasHeader = firstRow.includes('depotname') || firstRow.includes('name') || firstRow.includes('phonenumber') || firstRow.includes('phone');
  const aliases: Record<string, string> = { name: 'depotName', depot: 'depotName', phone: 'phoneNumber', primaryphone: 'phoneNumber', alternatephone: 'altPhone', altphone: 'altPhone' };
  const headers = hasHeader ? firstRow.map((field) => aliases[field] || field) : depotFields;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => parseDelimitedLine(line, separator).reduce<Record<string, string>>((item, value, index) => {
    if (headers[index]) item[headers[index]] = value;
    return item;
  }, {}) as BulkDepot);
};

export const AdminDepotsPage: React.FC = () => {
  const { depots, notifyChange } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<DepotContact | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFormat, setBulkFormat] = useState<'text' | 'json'>('text');
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');
  const [formDistrict, setFormDistrict] = useState('Uttara Kannada');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSaving, setIsSaving] = useState(false);

  const districts = ['All', 'Uttara Kannada', 'Dharwad', 'Belagavi', 'Dakshina Kannada', 'Udupi', 'Shivamogga'];

  const filteredDepots = depots.filter((depot) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      depot.depotName.toLowerCase().includes(q) ||
      depot.district.toLowerCase().includes(q) ||
      depot.phoneNumber.includes(q);
    const matchesDistrict = districtFilter === 'All' || depot.district === districtFilter;
    return matchesQuery && matchesDistrict;
  });

  const openAddModal = () => {
    setEditingDepot(null);
    setFormName('');
    setFormPhone('');
    setFormAltPhone('');
    setFormDistrict('Uttara Kannada');
    setFormAddress('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (depot: DepotContact) => {
    setEditingDepot(depot);
    setFormName(depot.depotName);
    setFormPhone(depot.phoneNumber);
    setFormAltPhone(depot.altPhone || '');
    setFormDistrict(depot.district);
    setFormAddress(depot.address || '');
    setFormStatus(depot.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    try {
      setIsSaving(true);
      if (editingDepot) {
        await depotsApi.update(editingDepot.id, {
          depotName: formName.trim(),
          phoneNumber: formPhone.trim(),
          altPhone: formAltPhone.trim() || undefined,
          district: formDistrict,
          address: formAddress.trim() || undefined,
          status: formStatus,
        });
      } else {
        await depotsApi.create({
          depotName: formName.trim(),
          phoneNumber: formPhone.trim(),
          altPhone: formAltPhone.trim() || undefined,
          district: formDistrict,
          address: formAddress.trim() || undefined,
          status: formStatus,
        });
      }
      notifyChange();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save depot:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (depot: DepotContact) => {
    const nextStatus = depot.status === 'Active' ? 'Inactive' : 'Active';
    await depotsApi.update(depot.id, { status: nextStatus });
    notifyChange();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete depot contact "${name}"?`)) {
      await depotsApi.delete(id);
      notifyChange();
    }
  };

  const handleBulkImport = async () => {
    setBulkError('');
    let items: BulkDepot[];
    try {
      items = parseBulkDepots(bulkText, bulkFormat);
      if (!items.length) throw new Error('Paste at least one depot contact.');
      const invalidIndex = items.findIndex((item) => !item.depotName || !item.district || !item.phoneNumber);
      if (invalidIndex >= 0) throw new Error(`Row ${invalidIndex + 1} needs depotName, district, and phoneNumber.`);
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Could not read the pasted data.');
      return;
    }

    try {
      setIsBulkSaving(true);
      await depotsApi.batchCreate(items);
      await notifyChange();
      setBulkText('');
      setIsBulkModalOpen(false);
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Bulk import failed.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search depot or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2">
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

        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={() => { setBulkError(''); setIsBulkModalOpen(true); }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Depot Helpline</span>
          </button>
        </div>
      </div>

      {/* Depots Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Depot Helplines ({filteredDepots.length})
          </h3>
          <span className="text-xs text-slate-500">
            Rendered directly to client passengers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Depot Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Alt / Control Room</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepots.map((depot) => (
                <tr key={depot.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{depot.depotName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {depot.district}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {depot.phoneNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {depot.altPhone || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(depot)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        depot.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          depot.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {depot.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(depot)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Depot"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(depot.id, depot.depotName)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        title="Delete Depot"
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

      {/* Add / Edit Depot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDepot ? 'Edit Depot Helpline' : 'Add New Depot Helpline'}
        subtitle="Manage depot contact info displayed in client mobile app"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Depot Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kumta Depot (ಕುಮಟಾ)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 08386-222045"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 08386-222888"
                value={formAltPhone}
                onChange={(e) => setFormAltPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
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
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Depot Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near NH 66, Kumta, Karnataka"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="Active">Active Helpline</option>
              <option value="Inactive">Inactive / Temporarily Closed</option>
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
              {isSaving ? 'Saving...' : editingDepot ? 'Save Changes' : 'Create Depot'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Upload Depot Helplines"
        subtitle="Paste CSV, TSV, pipe-delimited text, or JSON data"
        maxWidth="xl"
      >
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          {(['text', 'json'] as const).map((format) => (
            <button key={format} type="button" onClick={() => { setBulkFormat(format); setBulkError(''); }} className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer ${bulkFormat === format ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {format === 'text' ? 'Paste Text' : 'Paste JSON'}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          {bulkFormat === 'text'
            ? 'Columns: depotName, district, phoneNumber, altPhone, address, status. The first row may be a header.'
            : 'Use an array of depot objects, or { "depots": [...] }. Required fields: depotName, district, phoneNumber.'}
        </p>
        <textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          placeholder={bulkFormat === 'text' ? 'depotName,district,phoneNumber,altPhone,address,status\nKumta Depot,Uttara Kannada,08386-222045,08386-222888,Near NH 66,Active' : '[{"depotName":"Kumta Depot","district":"Uttara Kannada","phoneNumber":"08386-222045","status":"Active"}]'}
          className="min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          spellCheck={false}
        />
        {bulkError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{bulkError}</p>}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-500">Rows are created as new depot contacts.</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsBulkModalOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer">Cancel</button>
            <button type="button" onClick={handleBulkImport} disabled={isBulkSaving} className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer">
              {isBulkSaving ? 'Uploading...' : 'Upload Depot Contacts'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
