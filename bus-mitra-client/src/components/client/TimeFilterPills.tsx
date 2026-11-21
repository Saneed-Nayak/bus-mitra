import React from 'react';
import { TimeFilterOption } from '../../types';

interface TimeFilterPillsProps {
  selected: TimeFilterOption;
  onChange: (val: TimeFilterOption) => void;
}

export const TimeFilterPills: React.FC<TimeFilterPillsProps> = ({ selected, onChange }) => {
  const options: Array<{ label: string; value: TimeFilterOption }> = [
    { label: 'All', value: 'all' },
    { label: 'Before 10 AM', value: 'before_10am' },
    { label: 'After 10 AM', value: 'after_10am' },
    { label: 'Afternoon', value: 'afternoon' },
    { label: 'Evening', value: 'evening' },
    { label: 'Night', value: 'night' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {options.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            type="button"
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              isActive
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
