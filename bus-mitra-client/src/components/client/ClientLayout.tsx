import React from 'react';
import { Outlet } from 'react-router-dom';
import { ClientHeader } from './ClientHeader';
import { BottomNav } from './BottomNav';

export const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 lg:bg-gradient-to-br lg:from-slate-50 lg:to-slate-200 flex flex-col justify-between antialiased selection:bg-red-100 selection:text-red-900">
      {/* Mobile: max-w-xl, Desktop: max-w-6xl for wider layout */}
      <div className="w-full max-w-xl lg:max-w-6xl mx-auto min-h-screen bg-[#F8FAFC] flex flex-col relative shadow-md lg:shadow-xl shadow-slate-200">
        <ClientHeader />

        <main className="flex-1 pb-24 lg:pb-8 px-4 lg:px-8 lg:py-6 pt-3">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};
