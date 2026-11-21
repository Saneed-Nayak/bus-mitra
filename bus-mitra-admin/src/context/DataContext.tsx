import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  busStandsApi,
  routesApi,
  timetablesApi,
  depotsApi,
  suggestionsApi,
  dashboardApi,
  communityReportsApi,
  viaStopsApi,
} from '../services/api';
import {
  BusStand,
  BusRoute,
  Timetable,
  DepotContact,
  RouteSuggestion,
  DashboardStats,
  ActivityLog,
  CommunityReport,
  ViaStopSuggestion,
} from '../types';

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
  communityReports: CommunityReport[];
  viaStops: ViaStopSuggestion[];
  stats: DashboardStats | null;
  activity: ActivityLog[];

  // Loading state
  isLoading: boolean;
  isSyncing: boolean;
  lastUpdated: Date;

  // Actions
  refreshAllData: () => Promise<void>;
  notifyChange: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busStands, setBusStands] = useState<BusStand[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [depots, setDepots] = useState<DepotContact[]>([]);
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [viaStops, setViaStops] = useState<ViaStopSuggestion[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [standsRes, routesRes, ttRes, depotsRes, sugRes, reportsRes, viaRes, statsRes, actRes] = await Promise.all([
        busStandsApi.getAll().catch(() => []),
        routesApi.getAll().catch(() => []),
        timetablesApi.getAll().catch(() => []),
        depotsApi.getAll().catch(() => []),
        suggestionsApi.getAll().catch(() => []),
        communityReportsApi.getAll().catch(() => []),
        viaStopsApi.getAll().catch(() => []),
        dashboardApi.getStats().catch(() => null),
        dashboardApi.getActivity().catch(() => []),
      ]);

      setBusStands(standsRes);
      setRoutes(routesRes);
      setTimetables(ttRes);
      setDepots(depotsRes);
      setSuggestions(sugRes);
      setCommunityReports(reportsRes);
      setViaStops(viaRes);
      setStats(statsRes);
      setActivity(actRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to sync admin data from MongoDB:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refreshAllData();

    // Auto-sync with MongoDB every 10 seconds for real-time admin monitoring
    const interval = setInterval(() => {
      refreshAllData();
    }, 10000);

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
    return refreshAllData();
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
        communityReports,
        viaStops,
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
