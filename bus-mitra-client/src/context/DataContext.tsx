import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { busStandsApi, routesApi, timetablesApi, depotsApi, suggestionsApi, dashboardApi } from '../services/api';
import { BusStand, BusRoute, Timetable, DepotContact, RouteSuggestion, DashboardStats, ActivityLog } from '../types';

interface DataContextType {
  // Data lists
  busStands: BusStand[];
  activeBusStands: BusStand[];
  popularBusStands: BusStand[];
  routes: BusRoute[];
  publishedRoutes: BusRoute[];
  timetables: Timetable[];
  publishedTimetables: Timetable[];
  depots: DepotContact[];
  suggestions: RouteSuggestion[];
  stats: DashboardStats | null;
  activity: ActivityLog[];

  // Loading state
  isLoading: boolean;
  isSyncing: boolean;
  lastUpdated: Date;

  // Actions
  refreshAllData: () => Promise<void>;
  notifyChange: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busStands, setBusStands] = useState<BusStand[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [depots, setDepots] = useState<DepotContact[]>([]);
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [standsRes, routesRes, ttRes, depotsRes, sugRes, statsRes, actRes] = await Promise.all([
        busStandsApi.getAll().catch(() => []),
        routesApi.getAll().catch(() => []),
        timetablesApi.getAll().catch(() => []),
        depotsApi.getAll().catch(() => []),
        suggestionsApi.getAll().catch(() => []),
        dashboardApi.getStats().catch(() => null),
        dashboardApi.getActivity().catch(() => []),
      ]);

      setBusStands(standsRes);
      setRoutes(routesRes);
      setTimetables(ttRes);
      setDepots(depotsRes);
      setSuggestions(sugRes);
      setStats(statsRes);
      setActivity(actRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to sync data from MongoDB:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch from MongoDB
    refreshAllData();

    // Auto-refresh periodically (every 12 seconds) for real-time dynamic sync
    const interval = setInterval(() => {
      refreshAllData();
    }, 12000);

    // Refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAllData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAllData]);

  const notifyChange = useCallback(() => {
    refreshAllData();
  }, [refreshAllData]);

  const activeBusStands = busStands.filter((s) => s.status === 'Active');
  const popularBusStands = busStands.filter((s) => s.status === 'Active' && s.isPopular);
  const publishedRoutes = routes.filter((r) => r.status === 'Published');
  const publishedTimetables = timetables.filter((t) => t.status === 'Published');

  return (
    <DataContext.Provider
      value={{
        busStands,
        activeBusStands,
        popularBusStands,
        routes,
        publishedRoutes,
        timetables,
        publishedTimetables,
        depots,
        suggestions,
        stats,
        activity,
        isLoading,
        isSyncing,
        lastUpdated,
        refreshAllData,
        notifyChange,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
