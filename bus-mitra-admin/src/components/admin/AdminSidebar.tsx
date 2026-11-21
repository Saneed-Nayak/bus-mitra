import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Route,
  Clock,
  PhoneCall,
  MessageSquareText,
  Sparkles,
  Settings,
  Bus,
  ShieldCheck,
  Database,
  Users,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { suggestions, timetables, communityReports, viaStops } = useData();

  const pendingSuggestionsCount = suggestions.filter((s) => s.status === 'Pending').length;
  const draftTimetablesCount = timetables.filter((t) => t.status === 'Draft').length;
  const pendingReportsCount = (communityReports || []).filter((r) => r.status === 'Pending').length;
  const pendingViaStopsCount = viaStops.filter((v) => v.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    { label: 'Bus Stands', path: '/bus-stands', icon: MapPin },
    { label: 'Routes', path: '/routes', icon: Route },
    {
      label: 'Timetables',
      path: '/timetables',
      icon: Clock,
      badge: draftTimetablesCount > 0 ? `${draftTimetablesCount} drafts` : undefined,
      badgeColor: 'amber',
    },
    { label: 'Depot Contacts', path: '/depots', icon: PhoneCall },
    {
      label: 'Via-Stop Submissions',
      path: '/via-stops',
      icon: Plus,
      badge: pendingViaStopsCount > 0 ? `${pendingViaStopsCount} new` : undefined,
      badgeColor: 'blue',
    },
    {
      label: 'Route Suggestions',
      path: '/route-suggestions',
      icon: MessageSquareText,
      badge: pendingSuggestionsCount > 0 ? `${pendingSuggestionsCount} new` : undefined,
      badgeColor: 'red',
    },
    {
      label: 'Community Reports',
      path: '/community-reports',
      icon: Users,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} pending` : undefined,
      badgeColor: 'emerald',
    },
    {
      label: 'AI Timetable Import',
      path: '/ai-import',
      icon: Sparkles,
      highlight: true,
    },
    { label: 'Settings & DB', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-wide">
              KSRTC ADMIN
            </div>
            <div className="text-[10px] text-red-400 font-semibold tracking-wider uppercase">
              Karnataka Division
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                } ${item.highlight ? 'border border-amber-500/30 text-amber-300' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-amber-400'
                          : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badgeColor === 'red'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.badgeColor === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Live DB Status Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Live Database
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Changes publish immediately to passenger app.
          </p>
          <div className="mt-2.5 w-full py-2 bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Panel Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
