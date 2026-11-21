import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Admin UI Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBusStandsPage } from './pages/admin/AdminBusStandsPage';
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage';
import { AdminTimetablesPage } from './pages/admin/AdminTimetablesPage';
import { AdminDepotsPage } from './pages/admin/AdminDepotsPage';
import { AdminRouteSuggestionsPage } from './pages/admin/AdminRouteSuggestionsPage';
import { AdminAIImportPage } from './pages/admin/AdminAIImportPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCommunityReportsPage } from './pages/admin/AdminCommunityReportsPage';
import { AdminViaStopsPage } from './pages/admin/AdminViaStopsPage';
import { RefreshCw } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500 mb-3" />
        <span className="text-xs font-bold text-slate-400">Verifying Transit Admin Credentials…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="bus-stands" element={<AdminBusStandsPage />} />
            <Route path="routes" element={<AdminRoutesPage />} />
            <Route path="timetables" element={<AdminTimetablesPage />} />
            <Route path="via-stops" element={<AdminViaStopsPage />} />
            <Route path="depots" element={<AdminDepotsPage />} />
            <Route path="route-suggestions" element={<AdminRouteSuggestionsPage />} />
            <Route path="community-reports" element={<AdminCommunityReportsPage />} />
            <Route path="ai-import" element={<AdminAIImportPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
