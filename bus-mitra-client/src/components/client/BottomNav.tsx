import React from 'react';
import { Home, Bus, MessageSquarePlus, Star, PhoneCall } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home',      path: '/',          icon: Home           },
    { label: 'Buses',     path: '/buses',      icon: Bus            },
    { label: 'Suggest',   path: '/suggest',    icon: MessageSquarePlus },
    { label: 'Contribute',path: '/contribute', icon: Star           },
    { label: 'Depots',    path: '/depots',     icon: PhoneCall      },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 max-w-xl mx-auto shadow-lg shadow-slate-900/5">
      <div className="grid grid-cols-5 h-16">
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
              className={`flex flex-col items-center justify-center relative transition-colors ${
                isActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active top line */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? 'font-bold' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
