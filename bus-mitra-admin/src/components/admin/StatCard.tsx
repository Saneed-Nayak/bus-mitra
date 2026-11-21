import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'red' | 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  change?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  change,
  onClick,
}) => {
  const colorMap = {
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      glow: 'group-hover:border-red-300',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      glow: 'group-hover:border-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      glow: 'group-hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      glow: 'group-hover:border-amber-300',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      glow: 'group-hover:border-purple-300',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      glow: 'group-hover:border-slate-300',
    },
  };

  const c = colorMap[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${c.border} p-5 shadow-xs transition-all group ${
        onClick ? 'cursor-pointer hover:shadow-md ' + c.glow : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
