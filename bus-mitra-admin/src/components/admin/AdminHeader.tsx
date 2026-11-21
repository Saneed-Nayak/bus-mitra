import React from 'react';
import { Menu, RefreshCw, ShieldCheck, LogOut, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileMenu,
  title,
  subtitle,
}) => {
  const { isSyncing, refreshAllData } = useData();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Atlas Synced</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refreshAllData()}
          title="Refresh Data"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* User Info Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 leading-none">{user.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{user.role}</div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          title="Sign Out"
          className="px-3 py-2 bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
