import React from 'react';
import { Bus, Home, MessageSquarePlus, PhoneCall, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const ClientHeader: React.FC = () => {
  const location = useLocation();


  const navItems = [
    { label: 'Home',       path: '/',          icon: Home            },
    { label: 'Buses',      path: '/buses',      icon: Bus             },
    { label: 'Suggest',    path: '/suggest',    icon: MessageSquarePlus },
    { label: 'Contribute', path: '/contribute', icon: Star            },
    { label: 'Depots',     path: '/depots',     icon: PhoneCall       },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      {/* Main Brand Header */}
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 group-hover:bg-red-700 transition-colors">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">
              Karnataka
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">
              Bus Timings
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Find bus timings easily
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Kannada script badge - Mobile only */}
        <div className="text-right lg:hidden sm:block hidden">
          <div className="text-xs font-semibold text-slate-700 font-kannada">
            ಉತ್ತರ ಕರ್ನಾಟಕ
          </div>
          <div className="text-[10px] text-slate-400">
            ಬಸ್ ವೇಳಾಪಟ್ಟಿ
          </div>
        </div>
      </div>
    </header>
  );
};
