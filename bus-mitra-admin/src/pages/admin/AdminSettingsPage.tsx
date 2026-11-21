import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Server,
  Zap,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { dashboardApi } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const { busStands, routes, timetables, depots, suggestions, refreshAllData, notifyChange } = useData();

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleResetData = async () => {
    if (
      confirm(
        'Are you sure you want to reset all data back to the default Karnataka dataset (Kumta, Karwar, Sirsi, Gokarna, etc.)?'
      )
    ) {
      try {
        setIsResetting(true);
        await dashboardApi.resetToDefaults();
        await refreshAllData();
        showBanner('Database successfully reset to authentic Karnataka data!', 'success');
      } catch (e) {
        showBanner('Failed to reset database.', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleExportJson = async () => {
    try {
      const jsonStr = await dashboardApi.exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karnataka_bus_timings_db_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showBanner('Database backup JSON exported successfully!', 'success');
    } catch (e) {
      showBanner('Failed to export data.', 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const ok = await dashboardApi.importData(content);
        if (ok) {
          await refreshAllData();
          showBanner('Database successfully restored from JSON backup!', 'success');
        } else {
          showBanner('Invalid JSON database format.', 'error');
        }
      } catch (err) {
        showBanner('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const apiEndpoints = [
    { method: 'GET', path: '/api/bus-stands', desc: 'Fetch all active & registered bus stands' },
    { method: 'POST', path: '/api/bus-stands', desc: 'Create new bus station with district & Kannada label' },
    { method: 'GET', path: '/api/routes', desc: 'List transit routes connecting origin and destination' },
    { method: 'POST', path: '/api/routes', desc: 'Create and publish bus route' },
    { method: 'GET', path: '/api/timetables', desc: 'Retrieve full timetable directory with filters' },
    { method: 'GET', path: '/api/timetables/search?from=Kumta&to=Karwar&time=...', desc: 'Passenger search endpoint (Published only)' },
    { method: 'POST', path: '/api/timetables', desc: 'Create schedule (Published or Draft)' },
    { method: 'PUT', path: '/api/timetables/:id', desc: 'Update departure time, bus type or status' },
    { method: 'POST', path: '/api/timetables/:id/publish', desc: '1-click publish timetable to live client' },
    { method: 'GET', path: '/api/depots', desc: 'Fetch official depot contact and enquiry numbers' },
    { method: 'POST', path: '/api/route-suggestions', desc: 'Submit passenger route suggestion (no login)' },
    { method: 'GET', path: '/api/route-suggestions', desc: 'List suggestions for Admin review' },
    { method: 'POST', path: '/api/ai/extract-timetable', desc: 'AI Gemini 2.5 Flash timetable parser' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl shadow-md text-white flex items-center justify-between animate-fadeIn ${
            message.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* DB Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Database Engine & Synchronization
              </h2>
              <p className="text-xs text-slate-500">
                Persistent storage layer connected via real-time sync broadcast channel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Database Online
            </span>
          </div>
        </div>

        {/* Counts summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-lg font-extrabold text-slate-900">{busStands.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Bus Stands</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-lg font-extrabold text-slate-900">{routes.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Routes</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-lg font-extrabold text-slate-900">{timetables.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Timetables</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-lg font-extrabold text-slate-900">{depots.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Depots</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-lg font-extrabold text-slate-900">{suggestions.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Suggestions</div>
          </div>
        </div>
      </div>

      {/* Backup & Management Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-red-600" />
          Data Backup & Maintenance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Download complete database snapshot including all tables.
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 mt-3 block">Download JSON →</span>
          </button>

          {/* Import JSON */}
          <div className="relative p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition-all flex flex-col justify-between">
            <input
              type="file"
              id="import-db-input"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <label htmlFor="import-db-input" className="cursor-pointer flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restore from JSON</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload a previously exported JSON backup file.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 mt-3 block">Select File →</span>
            </label>
          </div>

          {/* Reset to Seed Data */}
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="p-4 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/40 hover:bg-red-50 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-900 mb-1">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Reset to Authentic Seed</span>
              </div>
              <p className="text-[11px] text-red-700/80">
                Restores default Karnataka bus stands, routes and timetables.
              </p>
            </div>
            <span className="text-[11px] font-bold text-red-700 mt-3 block">
              {isResetting ? 'Resetting...' : 'Restore Defaults →'}
            </span>
          </button>
        </div>
      </div>

      {/* REST API Explorer */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              REST API Endpoints Specification
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Backend Architecture: Node.js / Express</span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
          {apiEndpoints.map((ep, i) => (
            <div key={i} className="p-3 bg-slate-50/40 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-800'
                      : ep.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono font-bold text-slate-800">{ep.path}</span>
              </div>
              <span className="text-slate-500 text-[11px]">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
