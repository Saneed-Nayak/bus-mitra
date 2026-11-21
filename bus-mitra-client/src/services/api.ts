import {
  BusStand,
  BusRoute,
  Timetable,
  DepotContact,
  RouteSuggestion,
  ViaStopSuggestion,
  ActivityLog,
  DashboardStats,
  SearchParams,
  BusType,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const setSimulatedLatency = (_ms: number) => {
  // Configured via backend in MongoDB mode
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API Error [${res.status}] ${res.statusText}: ${errorBody}`);
  }

  return res.json();
}

// ==========================================
// BUS STANDS API (Live MongoDB)
// ==========================================
export const busStandsApi = {
  async getAll(options?: { activeOnly?: boolean; search?: string }): Promise<BusStand[]> {
    const params = new URLSearchParams();
    if (options?.activeOnly) params.append('activeOnly', 'true');
    if (options?.search) params.append('search', options.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<BusStand[]>(`/bus-stands${query}`);
  },

  async getPopular(): Promise<BusStand[]> {
    return request<BusStand[]>('/bus-stands/popular');
  },

  async getById(id: string): Promise<BusStand | null> {
    return request<BusStand>(`/bus-stands/${id}`).catch(() => null);
  },

  async create(data: Omit<BusStand, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusStand> {
    return request<BusStand>('/bus-stands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Omit<BusStand, 'id' | 'createdAt'>>): Promise<BusStand> {
    return request<BusStand>(`/bus-stands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<boolean> {
    await request(`/bus-stands/${id}`, { method: 'DELETE' });
    return true;
  },
};

// ==========================================
// ROUTES API (Live MongoDB)
// ==========================================
export const routesApi = {
  async getAll(options?: { publishedOnly?: boolean; search?: string }): Promise<BusRoute[]> {
    const params = new URLSearchParams();
    if (options?.publishedOnly) params.append('publishedOnly', 'true');
    if (options?.search) params.append('search', options.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<BusRoute[]>(`/routes${query}`);
  },

  async getById(id: string): Promise<BusRoute | null> {
    return request<BusRoute>(`/routes/${id}`).catch(() => null);
  },

  async create(data: {
    fromStandName: string;
    toStandName: string;
    status?: 'Published' | 'Draft' | 'Inactive';
    distanceKm?: number;
    durationMinutes?: number;
  }): Promise<BusRoute> {
    return request<BusRoute>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Omit<BusRoute, 'id' | 'createdAt'>>): Promise<BusRoute> {
    return request<BusRoute>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<boolean> {
    await request(`/routes/${id}`, { method: 'DELETE' });
    return true;
  },

  async publish(id: string): Promise<BusRoute> {
    return request<BusRoute>(`/routes/${id}/publish`, { method: 'POST' });
  },

  async unpublish(id: string): Promise<BusRoute> {
    return request<BusRoute>(`/routes/${id}/unpublish`, { method: 'POST' });
  },
};

// ==========================================
// TIMETABLES API (Live MongoDB)
// ==========================================
export const timetablesApi = {
  async getAll(options?: { publishedOnly?: boolean; routeId?: string; search?: string }): Promise<Timetable[]> {
    const params = new URLSearchParams();
    if (options?.publishedOnly) params.append('publishedOnly', 'true');
    if (options?.routeId) params.append('routeId', options.routeId);
    if (options?.search) params.append('search', options.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Timetable[]>(`/timetables${query}`);
  },

  async search(params: SearchParams): Promise<{
    from: string;
    to: string;
    total: number;
    timetables: Timetable[];
    date: string;
  }> {
    const urlParams = new URLSearchParams();
    if (params.from) urlParams.append('from', params.from);
    if (params.to) urlParams.append('to', params.to);
    if (params.busType) urlParams.append('busType', params.busType);
    if (params.timeFilter) urlParams.append('timeFilter', params.timeFilter);
    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return request<{
      from: string;
      to: string;
      total: number;
      timetables: Timetable[];
      date: string;
    }>(`/timetables/search${query}`);
  },

  async getById(id: string): Promise<Timetable | null> {
    return request<Timetable>(`/timetables/${id}`).catch(() => null);
  },

  async create(data: {
    routeId?: string;
    fromStandName: string;
    toStandName: string;
    busName?: string;
    busType: BusType;
    departureTime: string;
    arrivalTime?: string;
    status?: 'Published' | 'Draft';
    via?: string;
    frequency?: string;
  }): Promise<Timetable> {
    return request<Timetable>('/timetables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Omit<Timetable, 'id' | 'createdAt'>>): Promise<Timetable> {
    return request<Timetable>(`/timetables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<boolean> {
    await request(`/timetables/${id}`, { method: 'DELETE' });
    return true;
  },

  async publish(id: string): Promise<Timetable> {
    return request<Timetable>(`/timetables/${id}/publish`, { method: 'POST' });
  },

  async unpublish(id: string): Promise<Timetable> {
    return request<Timetable>(`/timetables/${id}/unpublish`, { method: 'POST' });
  },

  async batchCreate(items: Array<{
    fromStandName: string;
    toStandName: string;
    busName?: string;
    busType: BusType;
    departureTime: string;
    arrivalTime?: string;
    status?: 'Published' | 'Draft';
  }>): Promise<Timetable[]> {
    return request<Timetable[]>('/timetables/batch', {
      method: 'POST',
      body: JSON.stringify(items),
    });
  },
};

// ==========================================
// DEPOT CONTACTS API (Live MongoDB)
// ==========================================
export const depotsApi = {
  async getAll(options?: { activeOnly?: boolean; search?: string }): Promise<DepotContact[]> {
    const params = new URLSearchParams();
    if (options?.activeOnly) params.append('activeOnly', 'true');
    if (options?.search) params.append('search', options.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<DepotContact[]>(`/depots${query}`);
  },

  async getById(id: string): Promise<DepotContact | null> {
    return request<DepotContact>(`/depots/${id}`).catch(() => null);
  },

  async create(data: Omit<DepotContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<DepotContact> {
    return request<DepotContact>('/depots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Omit<DepotContact, 'id' | 'createdAt'>>): Promise<DepotContact> {
    return request<DepotContact>(`/depots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<boolean> {
    await request(`/depots/${id}`, { method: 'DELETE' });
    return true;
  },
};

// ==========================================
// ROUTE SUGGESTIONS API (Live MongoDB)
// ==========================================
export const suggestionsApi = {
  async getAll(): Promise<RouteSuggestion[]> {
    return request<RouteSuggestion[]>('/suggestions');
  },

  async create(data: {
    fromStandName: string;
    toStandName: string;
    preferredTime?: string;
    message?: string;
  }): Promise<RouteSuggestion> {
    return request<RouteSuggestion>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(
    id: string,
    status: RouteSuggestion['status'],
    adminNotes?: string
  ): Promise<RouteSuggestion> {
    return request<RouteSuggestion>(`/suggestions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  async approveAndCreateRoute(id: string, adminNotes?: string): Promise<{
    suggestion: RouteSuggestion;
    createdRoute: BusRoute;
    sampleTimetable?: Timetable;
  }> {
    return request<{
      suggestion: RouteSuggestion;
      createdRoute: BusRoute;
      sampleTimetable?: Timetable;
    }>(`/suggestions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  },
};

// ==========================================
// AI TIMETABLE IMPORT API
// ==========================================
export interface ExtractedTimetableItem {
  fromStandName: string;
  toStandName: string;
  busName: string;
  busType: BusType;
  departureTime: string;
  arrivalTime: string;
  frequency?: string;
}

export const aiImportApi = {
  async extractTimetable(
    payload: { text?: string; base64Image?: string; fileName?: string; sampleId?: string }
  ): Promise<{
    sourceName: string;
    extractedCount: number;
    items: ExtractedTimetableItem[];
    confidence: number;
    parsedAt: string;
  }> {
    return request<{
      sourceName: string;
      extractedCount: number;
      items: ExtractedTimetableItem[];
      confidence: number;
      parsedAt: string;
    }>('/ai-import/extract', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ==========================================
// DASHBOARD & ADMIN STATS API (Live MongoDB)
// ==========================================
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/dashboard/stats');
  },

  async getActivity(): Promise<ActivityLog[]> {
    return request<ActivityLog[]>('/dashboard/activity');
  },

  async resetToDefaults(): Promise<void> {
    await request('/settings/reset', { method: 'POST' });
  },

  async exportData(): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/settings/export`);
    return res.text();
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      await request('/settings/import', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return true;
    } catch {
      return false;
    }
  },
};

// ==========================================
// VIA STOPS SUGGESTIONS API (Live MongoDB)
// ==========================================
export const viaStopsApi = {
  async getForRoute(routeId: string): Promise<ViaStopSuggestion[]> {
    return request<ViaStopSuggestion[]>(`/via-stops/route/${routeId}`);
  },

  async getForTimetable(timetableId: string): Promise<ViaStopSuggestion[]> {
    return request<ViaStopSuggestion[]>(`/via-stops/timetable/${timetableId}`);
  },

  async getAll(): Promise<ViaStopSuggestion[]> {
    return request<ViaStopSuggestion[]>('/via-stops');
  },

  async getPending(): Promise<ViaStopSuggestion[]> {
    return request<ViaStopSuggestion[]>('/via-stops/admin/pending');
  },

  async create(data: {
    timetableId: string;
    routeId: string;
    fromStandName: string;
    toStandName: string;
    stopName: string;
    position: number;
    submittedBy?: string;
    reason: 'travelled' | 'regular_user' | 'know_route' | 'other';
    notes?: string;
  }): Promise<ViaStopSuggestion> {
    return request<ViaStopSuggestion>('/via-stops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(
    id: string,
    status: 'verified' | 'rejected',
    adminNotes?: string,
    position?: number
  ): Promise<ViaStopSuggestion> {
    return request<ViaStopSuggestion>(`/via-stops/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes, ...(position !== undefined && { position }) }),
    });
  },

  async delete(id: string): Promise<boolean> {
    await request(`/via-stops/${id}`, { method: 'DELETE' });
    return true;
  },
};
