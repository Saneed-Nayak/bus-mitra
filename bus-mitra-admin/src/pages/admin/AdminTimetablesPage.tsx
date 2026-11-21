import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Plus, Search, Edit2, Trash2, CheckCircle2, ArrowRight, Filter, Eye, EyeOff, Sparkles, Check, Upload } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { busTypesApi, timetablesApi } from '../../services/api';
import { Timetable, BusType } from '../../types';
import { Modal } from '../../components/common/Modal';

type BulkTimetable = {
  fromStandName: string;
  toStandName: string;
  busName?: string;
  busType: BusType;
  departureTime: string;
  arrivalTime?: string;
  status?: 'Published' | 'Draft';
  via?: string;
  frequency?: string;
};

const timetableFields = ['fromStandName', 'toStandName', 'busName', 'busType', 'departureTime', 'arrivalTime', 'status', 'via', 'frequency'];

const parseCsvLine = (line: string, separator: string) => {
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

const parseBulkTimetables = (text: string, format: 'text' | 'json'): BulkTimetable[] => {
  if (format === 'json') {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : parsed?.timetables;
    if (!Array.isArray(items)) throw new Error('JSON must be an array or an object with a timetables array.');
    return items as BulkTimetable[];
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const separator = lines[0].includes('\t') ? '\t' : lines[0].includes('|') ? '|' : ',';
  const firstRow = parseCsvLine(lines[0], separator).map((field) => field.toLowerCase().replace(/\s+/g, ''));
  const hasHeader = firstRow.includes('fromstandname') || firstRow.includes('from');
  const headerAliases: Record<string, string> = {
    from: 'fromStandName',
    to: 'toStandName',
    bus: 'busName',
    type: 'busType',
    departure: 'departureTime',
    arrival: 'arrivalTime',
  };
  const headers = hasHeader ? firstRow.map((field) => headerAliases[field] || field || '') : timetableFields;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const values = parseCsvLine(line, separator);
    return headers.reduce<Record<string, string>>((item, header, index) => {
      if (header) item[header] = values[index] || '';
      return item;
    }, {}) as BulkTimetable;
  });
};

export const AdminTimetablesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { timetables, busStands, routes, notifyChange } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');
  const [busTypeFilter, setBusTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFormat, setBulkFormat] = useState<'text' | 'json'>('text');
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Quick edit modal / state for departure time
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditTime, setQuickEditTime] = useState<string>('');

  // Form State
  const [formFrom, setFormFrom] = useState('Kumta');
  const [formTo, setFormTo] = useState('Karwar');
  const [formBusName, setFormBusName] = useState('Karnataka Sarige');
  const [formBusType, setFormBusType] = useState<BusType>('Karnataka Sarige');
  const [formDepartureTime, setFormDepartureTime] = useState('07:30 AM');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formViaStops, setFormViaStops] = useState('');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Published');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const defaultBusTypes: BusType[] = [
    'Karnataka Sarige',
    'NWKRTC Express',
    'Gramina Sarige',
    'Rajahamsa Executive',
    'Suvarna Sarige',
    'Kalyana Ratha',
    'Non-AC Sleeper',
    'Other',
  ];
  const [busTypes, setBusTypes] = useState<BusType[]>(defaultBusTypes);

  useEffect(() => {
    busTypesApi.getAll().then(setBusTypes).catch(() => setBusTypes(defaultBusTypes));
  }, []);

  const handleAddBusType = async () => {
    const name = window.prompt('Enter new bus type name');
    if (!name?.trim()) return;
    try {
      const createdName = await busTypesApi.create(name.trim());
      setBusTypes((current) => current.includes(createdName) ? current : [...current, createdName]);
      setFormBusType(createdName);
      setFormBusName(createdName);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not add bus type');
    }
  };

  const activeStands = busStands.filter((s) => s.status === 'Active');
  const getViaStops = (tt: Timetable) => tt.viaStops?.length ? tt.viaStops : tt.via ? tt.via.split(/\s*(?:→|,)\s*/).filter(Boolean) : [];
  const getRouteLabel = (tt: Timetable) => [tt.fromStandName, ...getViaStops(tt), tt.toStandName].join(' → ');

  const filteredTimetables = timetables.filter((tt) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      tt.fromStandName.toLowerCase().includes(q) ||
      tt.toStandName.toLowerCase().includes(q) ||
      getViaStops(tt).some((stop) => stop.toLowerCase().includes(q)) ||
      tt.busName.toLowerCase().includes(q) ||
      tt.departureTime.toLowerCase().includes(q);

    const matchesRoute =
      routeFilter === 'All' ||
      getRouteLabel(tt) === routeFilter || `${tt.fromStandName} → ${tt.toStandName}` === routeFilter;

    const matchesType = busTypeFilter === 'All' || tt.busType === busTypeFilter;
    const matchesStatus = statusFilter === 'All' || tt.status === statusFilter;

    return matchesQuery && matchesRoute && matchesType && matchesStatus;
  });

  // Unique route options for filter
  const uniqueRouteOptions = Array.from(
    new Set(timetables.map(getRouteLabel))
  );

  const openAddModal = () => {
    setEditingTimetable(null);
    setFormFrom(activeStands[0]?.name || 'Kumta');
    setFormTo(activeStands[1]?.name || 'Karwar');
    setFormBusName('Karnataka Sarige');
    setFormBusType('Karnataka Sarige');
    setFormDepartureTime('07:30 AM');
    setFormArrivalTime('');
    setFormViaStops('');
    setFormStatus('Published');
    setIsModalOpen(true);
  };

  const openEditModal = (tt: Timetable) => {
    setEditingTimetable(tt);
    setFormFrom(tt.fromStandName);
    setFormTo(tt.toStandName);
    setFormBusName(tt.busName);
    setFormBusType(tt.busType);
    setFormDepartureTime(tt.departureTime);
    setFormArrivalTime(tt.arrivalTime || '');
    setFormViaStops(getViaStops(tt).join(', '));
    setFormStatus(tt.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFrom || !formTo || !formDepartureTime) return;

    try {
      setIsSaving(true);
      if (editingTimetable) {
        await timetablesApi.update(editingTimetable.id, {
          fromStandName: formFrom,
          toStandName: formTo,
          busName: formBusName || formBusType,
          busType: formBusType,
          departureTime: formDepartureTime,
          arrivalTime: formArrivalTime || undefined,
          viaStops: formViaStops.split(',').map((stop) => stop.trim()).filter(Boolean),
          status: formStatus,
        });
      } else {
        await timetablesApi.create({
          fromStandName: formFrom,
          toStandName: formTo,
          busName: formBusName || formBusType,
          busType: formBusType,
          departureTime: formDepartureTime,
          arrivalTime: formArrivalTime || undefined,
          viaStops: formViaStops.split(',').map((stop) => stop.trim()).filter(Boolean),
          status: formStatus,
        });
      }
      notifyChange();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save timetable:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (tt: Timetable) => {
    const nextStatus = tt.status === 'Published' ? 'Draft' : 'Published';
    await timetablesApi.update(tt.id, { status: nextStatus });
    notifyChange();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete timetable schedule "${name}"?`)) {
      await timetablesApi.delete(id);
      await notifyChange();
    }
  };

  const handleQuickEditSave = async (id: string) => {
    if (!quickEditTime.trim()) return;
    await timetablesApi.update(id, { departureTime: quickEditTime.trim() });
    setQuickEditId(null);
    notifyChange();
  };

  const handleBulkImport = async () => {
    setBulkError('');
    let items: BulkTimetable[];
    try {
      items = parseBulkTimetables(bulkText, bulkFormat);
      if (!items.length) throw new Error('Paste at least one timetable row.');
      const invalidIndex = items.findIndex((item) => !item.fromStandName || !item.toStandName || !item.departureTime || !busTypes.includes(item.busType));
      if (invalidIndex >= 0) {
        throw new Error(`Row ${invalidIndex + 1} needs fromStandName, toStandName, departureTime, and a valid busType.`);
      }
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Could not read the pasted data.');
      return;
    }

    try {
      setIsBulkSaving(true);
      await timetablesApi.batchCreate(items);
      setBulkText('');
      setIsBulkModalOpen(false);
      notifyChange();
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Bulk import failed.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Timetable Database Controller
            </h2>
            <p className="text-xs text-slate-500">
              Published schedules are directly sent to passenger apps without rebuilds
            </p>
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
              <span>Add Timetable</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stand, time, bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Routes ({uniqueRouteOptions.length})</option>
              {uniqueRouteOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Bus Type Filter */}
          <div>
            <select
              value={busTypeFilter}
              onChange={(e) => setBusTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Bus Types</option>
              {busTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published (Live to Client)</option>
              <option value="Draft">Draft (Internal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timetables Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Timetable Schedules ({filteredTimetables.length})
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Ordered Chronologically
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Departure Time</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Bus Type</th>
                <th className="py-3 px-4">Arrival (Est.)</th>
                <th className="py-3 px-4">Publish Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTimetables.map((tt) => (
                <tr key={tt.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Departure Time with quick inline edit */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {quickEditId === tt.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={quickEditTime}
                          onChange={(e) => setQuickEditTime(e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-red-500 rounded font-mono text-xs font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleQuickEditSave(tt.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 font-mono tracking-tight">
                          {tt.departureTime}
                        </span>
                        <button
                          onClick={() => {
                            setQuickEditId(tt.id);
                            setQuickEditTime(tt.departureTime);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          edit
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>{getRouteLabel(tt)}</span>
                    </div>
                  </td>

                  {/* Bus Type */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <span className="text-red-700 font-semibold">{tt.busName || tt.busType}</span>
                  </td>

                  {/* Arrival */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {tt.arrivalTime || '—'}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublish(tt)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        tt.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tt.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {tt.status}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(tt)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Full Timetable"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            tt.id,
                            `${tt.departureTime} ${tt.fromStandName} → ${tt.toStandName}`
                          )
                        }
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        title="Delete Timetable"
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

      {/* Add / Edit Timetable Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTimetable ? 'Edit Timetable Schedule' : 'Add New Bus Timetable'}
        subtitle="Manage departure times for Karnataka bus network"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                From Stand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="tt-from-stands"
                value={formFrom}
                onChange={(e) => setFormFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                required
              />
              <datalist id="tt-from-stands">
                {activeStands.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                To Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="tt-to-stands"
                value={formTo}
                onChange={(e) => setFormTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                required
              />
              <datalist id="tt-to-stands">
                {activeStands.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Via / Intermediate Stops
            </label>
            <input
              type="text"
              list="tt-via-stands"
              placeholder="e.g. Kumta, Ankola"
              value={formViaStops}
              onChange={(e) => setFormViaStops(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <datalist id="tt-via-stands">
              {activeStands.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Departure Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 07:30 AM"
                value={formDepartureTime}
                onChange={(e) => setFormDepartureTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Est. Arrival Time (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 09:15 AM"
                value={formArrivalTime}
                onChange={(e) => setFormArrivalTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bus Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formBusType}
                onChange={(e) => {
                  const val = e.target.value as BusType;
                  setFormBusType(val);
                  setFormBusName(val);
                }}
                className="min-w-0 flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {busTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                type="button"
                onClick={handleAddBusType}
                className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                + Add New
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bus Display Name (e.g. Karnataka Sarige, NWKRTC Superfast)
            </label>
            <input
              type="text"
              placeholder="e.g. Karnataka Sarige"
              value={formBusName}
              onChange={(e) => setFormBusName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Publish Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="Published">Published (Instantly Live on Client)</option>
              <option value="Draft">Save as Draft (Internal)</option>
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
              {isSaving ? 'Saving...' : editingTimetable ? 'Save Changes' : 'Create Timetable'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Upload Timetables"
        subtitle="Paste CSV, TSV, pipe-delimited text, or JSON data"
        maxWidth="xl"
      >
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          {(['text', 'json'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => { setBulkFormat(format); setBulkError(''); }}
              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer ${bulkFormat === format ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {format === 'text' ? 'Paste Text' : 'Paste JSON'}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          {bulkFormat === 'text'
            ? 'Columns: fromStandName, toStandName, busName, busType, departureTime, arrivalTime, status, via, frequency. The first row may be a header.'
            : 'Use an array of timetable objects, or { "timetables": [...] }. Required fields: fromStandName, toStandName, busType, departureTime.'}
        </p>
        <textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          placeholder={bulkFormat === 'text' ? 'fromStandName,toStandName,busName,busType,departureTime,arrivalTime,status\nKumta,Karwar,Karnataka Sarige,Karnataka Sarige,07:30 AM,09:15 AM,Published' : '[{"fromStandName":"Kumta","toStandName":"Karwar","busType":"Karnataka Sarige","departureTime":"07:30 AM"}]'}
          className="min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          spellCheck={false}
        />
        {bulkError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{bulkError}</p>}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-500">Rows are created as new schedules.</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsBulkModalOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer">Cancel</button>
            <button type="button" onClick={handleBulkImport} disabled={isBulkSaving} className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer">
              {isBulkSaving ? 'Uploading...' : 'Upload Timetables'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
