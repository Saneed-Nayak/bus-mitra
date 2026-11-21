import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { X } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Determine current page title and subtitle
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') {
      return {
        title: 'Admin Dashboard',
        subtitle: 'Overview of Karnataka bus network, timetables and suggestions',
      };
    }
    if (path.includes('/bus-stands')) {
      return {
        title: 'Bus Stands Management',
        subtitle: 'Add, edit and manage bus stations and regional transit points',
      };
    }
    if (path.includes('/routes')) {
      return {
        title: 'Routes Management',
        subtitle: 'Create and publish bus routes across Karnataka districts',
      };
    }
    if (path.includes('/timetables')) {
      return {
        title: 'Timetables & Schedules',
        subtitle: 'Publish, draft and adjust bus departure timings in real-time',
      };
    }
    if (path.includes('/depots')) {
      return {
        title: 'Depot Contacts & Helplines',
        subtitle: 'Official enquiry telephone lines and division control rooms',
      };
    }
    if (path.includes('/route-suggestions')) {
      return {
        title: 'Route Suggestions',
        subtitle: 'Review user-submitted route requests and auto-create new routes',
      };
    }
    if (path.includes('/community-reports')) {
      return {
        title: 'Community Reports',
        subtitle: 'Review real-time bus reports submitted by passenger contributors',
      };
    }
    if (path.includes('/ai-import')) {
      return {
        title: 'AI Timetable Import (Gemini 2.5 Flash)',
        subtitle: 'Extract timetables from notice board photos & documents with editable review',
      };
    }
    if (path.includes('/settings')) {
      return {
        title: 'System Settings & Database',
        subtitle: 'Data backup, export, import, and REST API documentation',
      };
    }
    return {
      title: 'Admin Dashboard',
      subtitle: 'KSRTC / NWKRTC Karnataka Division',
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
