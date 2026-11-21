export type BusType = string;

export interface BusStand {
  id: string;
  name: string;
  kannadaName?: string;
  district: string;
  status: 'Active' | 'Inactive';
  isPopular?: boolean;
  code?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusRoute {
  id: string;
  fromStandId: string;
  fromStandName: string;
  toStandId: string;
  toStandName: string;
  status: 'Published' | 'Draft' | 'Inactive';
  distanceKm?: number;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Timetable {
  id: string;
  routeId: string;
  fromStandName: string;
  toStandName: string;
  busName: string;
  busType: BusType;
  departureTime: string; // e.g. "07:30 AM"
  departureMinutes: number; // minutes from midnight (0 - 1439) for precise filtering/sorting
  arrivalTime?: string; // e.g. "09:15 AM"
  status: 'Published' | 'Draft';
  via?: string;
  viaStops?: string[];
  frequency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepotContact {
  id: string;
  depotName: string;
  district: string;
  phoneNumber: string;
  altPhone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface RouteSuggestion {
  id: string;
  fromStandName: string;
  toStandName: string;
  preferredTime?: string;
  message?: string;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
  adminNotes?: string;
  approvedRouteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViaStopSuggestion {
  id: string;
  timetableId: string; // Specific bus/trip ID - each bus can have different via stops
  routeId: string;
  fromStandName: string;
  toStandName: string;
  stopName: string;
  position: number;
  submittedBy?: string;
  reason: 'travelled' | 'regular_user' | 'know_route' | 'other';
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'timetable_update' | 'route_added' | 'suggestion_received' | 'suggestion_approved' | 'depot_updated' | 'stand_added' | 'timetable_published';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  totalBusStands: number;
  activeBusStands: number;
  totalRoutes: number;
  publishedRoutes: number;
  totalTimetables: number;
  publishedTimetables: number;
  draftTimetables: number;
  pendingSuggestions: number;
  totalSuggestions: number;
  depotContacts: number;
}

export type TimeFilterOption = 'all' | 'before_10am' | 'after_10am' | 'afternoon' | 'evening' | 'night';

export interface SearchParams {
  from?: string;
  to?: string;
  timeFilter?: TimeFilterOption;
  busType?: string;
}

// ==========================================
// COMMUNITY CONTRIBUTOR TYPES
// Shared with client — reads from the same localStorage key 'community_reports_v1'
// ==========================================

export type QuestionSetType = 'at_stop' | 'on_bus' | 'general';

export interface CommunityReport {
  id: string;
  contributorId: string;
  location?: {
    latitude: number;
    longitude: number;
    nearestStand: string;
    distanceMeters: number;
  };
  questionSetType: QuestionSetType;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string;
  pointsAwarded: number;
  bonusPoints: number;
  bonusCredited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContributorProfile {
  id: string;
  totalPoints: number;
  reportCount: number;
  approvedCount: number;
  rejectedCount: number;
  lastContributedAt?: string;
  joinedAt: string;
}

// ==========================================
// ADMIN AUTHENTICATION TYPES
// ==========================================
export type AdminRole = 'SuperAdmin' | 'OperationsAdmin' | 'DataAdmin';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AdminRole;
  designation: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

