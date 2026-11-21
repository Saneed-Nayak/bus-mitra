import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StatCard } from '../../components/admin/StatCard';
import { useData } from '../../context/DataContext';
import {
  MapPin,
  Route,
  Clock,
  MessageSquareText,
  PhoneCall,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Layers,
  FileCheck,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, activity, suggestions, routes, timetables, busStands, isLoading } = useData();

  const pendingSuggestions = suggestions.filter((s) => s.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CENTRAL TIMETABLE CONTROLLER</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">
            Karnataka Transit Operations
          </h2>
          <p className="text-xs text-red-100 max-w-xl">
            Live schedule database connected to Passenger App. Any published change is instantly reflected across passenger screens.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => navigate('/admin/timetables?action=new')}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-red-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timetable</span>
          </button>
          <button
            onClick={() => navigate('/admin/ai-import')}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Import</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Bus Stands"
          value={stats?.totalBusStands ?? 0}
          subtitle={`${stats?.activeBusStands ?? 0} active stations`}
          icon={MapPin}
          variant="slate"
          onClick={() => navigate('/admin/bus-stands')}
        />

        <StatCard
          title="Total Routes"
          value={stats?.totalRoutes ?? 0}
          subtitle={`${stats?.publishedRoutes ?? 0} published`}
          icon={Route}
          variant="blue"
          onClick={() => navigate('/admin/routes')}
        />

        <StatCard
          title="Published Timetables"
          value={stats?.publishedTimetables ?? 0}
          subtitle={`${stats?.draftTimetables ?? 0} draft schedules`}
          icon={Clock}
          variant="emerald"
          onClick={() => navigate('/admin/timetables')}
        />

        <StatCard
          title="Pending Suggestions"
          value={stats?.pendingSuggestions ?? 0}
          subtitle="User route requests"
          icon={MessageSquareText}
          variant="red"
          change={pendingSuggestions.length > 0 ? `${pendingSuggestions.length} Needs Review` : undefined}
          onClick={() => navigate('/admin/route-suggestions')}
        />

        <StatCard
          title="Depot Contacts"
          value={stats?.depotContacts ?? 0}
          subtitle="Control room lines"
          icon={PhoneCall}
          variant="amber"
          onClick={() => navigate('/admin/depots')}
        />
      </div>

      {/* Main Grid: Pending Suggestions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Review / Timetable Health */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Suggestions Action Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pending Route Suggestions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Passengers requested new bus connectivity
                  </p>
                </div>
              </div>

              <Link
                to="/admin/route-suggestions"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>View All ({suggestions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingSuggestions.length > 0 ? (
              <div className="space-y-3">
                {pendingSuggestions.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-red-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <span>{item.fromStandName}</span>
                        <ArrowRight className="w-4 h-4 text-red-600" />
                        <span>{item.toStandName}</span>
                        {item.preferredTime && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            {item.preferredTime}
                          </span>
                        )}
                      </div>
                      {item.message && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          "{item.message}"
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Link
                      to="/admin/route-suggestions"
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 text-center"
                    >
                      Review & Approve
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">All caught up!</h4>
                <p className="text-[11px] text-slate-500">No pending suggestions awaiting review.</p>
              </div>
            )}
          </div>

          {/* Quick Timetables Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Active Timetables Snapshot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest published schedules in database
                  </p>
                </div>
              </div>

              <Link
                to="/admin/timetables"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>Manage Timetables</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Departure</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Bus Type</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timetables.slice(0, 6).map((tt) => (
                    <tr key={tt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        {tt.departureTime}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {tt.fromStandName} → {tt.toStandName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {tt.busName || tt.busType}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tt.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tt.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {tt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Stream & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Quick Operations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/admin/timetables?action=new')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-left text-xs font-bold text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Create Timetable</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/routes?action=new')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-left text-xs font-bold text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-600" />
                  <span>Create Route</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/bus-stands?action=new')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-left text-xs font-bold text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Add Bus Stand</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/ai-import')}
                className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 hover:border-amber-300 border border-amber-200 text-left text-xs font-bold text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Timetable Import</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              Recent Operations Activity
            </h3>

            <div className="space-y-3">
              {activity.slice(0, 5).map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-red-500 pl-3 py-1 space-y-0.5">
                  <div className="font-bold text-slate-800 leading-snug">
                    {act.title}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {act.description}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
