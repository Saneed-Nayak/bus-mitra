import { CommunityReport, ContributorProfile, QuestionSetType } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const PROFILE_ID_KEY = 'community_contributor_id_v1';

// ==========================================
// GEOLOCATION — Known bus stand coordinates for Karnataka
// ==========================================
export const KNOWN_STAND_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kumta':     { lat: 14.4274, lng: 74.4154 },
  'Karwar':    { lat: 14.8003, lng: 74.1240 },
  'Sirsi':     { lat: 14.6207, lng: 74.8392 },
  'Gokarna':   { lat: 14.5479, lng: 74.3188 },
  'Ankola':    { lat: 14.6653, lng: 74.2975 },
  'Honavar':   { lat: 14.2798, lng: 74.4427 },
  'Bhatkal':   { lat: 13.9852, lng: 74.5639 },
  'Yellapur':  { lat: 14.9569, lng: 74.7104 },
  'Joida':     { lat: 15.1386, lng: 74.4233 },
  'Mundgod':   { lat: 15.0098, lng: 75.0228 },
  'Dandeli':   { lat: 15.2566, lng: 74.6117 },
  'Siddapur':  { lat: 14.3600, lng: 74.8808 },
  'Hubali':    { lat: 15.3647, lng: 75.1240 },
  'Belagavi':  { lat: 15.8497, lng: 74.4977 },
  'Mangaluru': { lat: 12.9141, lng: 74.8560 },
  'Udupi':     { lat: 13.3409, lng: 74.7421 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
};

function toRad(deg: number): number { return deg * (Math.PI / 180); }

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestStand(lat: number, lng: number): { stand: string; distanceMeters: number } {
  let nearest = { stand: 'Unknown', distanceMeters: Infinity };
  for (const [name, coords] of Object.entries(KNOWN_STAND_COORDS)) {
    const dist = calculateDistanceMeters(lat, lng, coords.lat, coords.lng);
    if (dist < nearest.distanceMeters) nearest = { stand: name, distanceMeters: dist };
  }
  return nearest;
}

// ==========================================
// CONTRIBUTOR ID HELPER
// ==========================================
export function getLocalContributorId(): string {
  let id = localStorage.getItem(PROFILE_ID_KEY);
  if (!id) {
    id = 'contributor-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(PROFILE_ID_KEY, id);
  }
  return id;
}

// ==========================================
// CONTRIBUTOR PROFILE (Live MongoDB API)
// ==========================================
export async function getOrCreateProfile(): Promise<ContributorProfile> {
  const id = getLocalContributorId();
  try {
    const res = await fetch(`${API_BASE_URL}/contributors/${id}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Failed to fetch contributor profile:', err);
  }

  return {
    id,
    totalPoints: 0,
    reportCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    joinedAt: new Date().toISOString(),
  };
}

// ==========================================
// COMMUNITY REPORTS (Live MongoDB API)
// ==========================================
export async function getAllReports(): Promise<CommunityReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/community-reports`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Failed to fetch community reports:', err);
  }
  return [];
}

export async function getMyReports(contributorId: string): Promise<CommunityReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/community-reports?contributorId=${contributorId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Failed to fetch user reports:', err);
  }
  return [];
}

export async function submitReport(
  data: Omit<CommunityReport, 'id' | 'status' | 'bonusCredited' | 'bonusPoints' | 'createdAt' | 'updatedAt'>
): Promise<CommunityReport> {
  const res = await fetch(`${API_BASE_URL}/community-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to submit community report');
  }

  return res.json();
}

export async function checkAndCreditBonuses(contributorId: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE_URL}/contributors/${contributorId}/check-bonus`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return data.bonusEarned || 0;
    }
  } catch (err) {
    console.error('Failed to check bonuses:', err);
  }
  return 0;
}

// ==========================================
// LEVEL SYSTEM
// ==========================================
export interface LevelInfo {
  label: string;
  iconName: 'Leaf' | 'Star' | 'Award' | 'Bus';
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
  nextLevelPoints: number | null;
  pointsToNext: number | null;
  progress: number;
}

export function getLevelInfo(points: number): LevelInfo {
  if (points >= 500) return {
    label: 'Super Mitra', iconName: 'Bus',
    bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300',
    iconBg: 'bg-purple-600',
    nextLevelPoints: null, pointsToNext: null, progress: 100,
  };
  if (points >= 200) return {
    label: 'Trusted Mitra', iconName: 'Award',
    bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-300',
    iconBg: 'bg-amber-500',
    nextLevelPoints: 500, pointsToNext: 500 - points,
    progress: Math.round(((points - 200) / 300) * 100),
  };
  if (points >= 50) return {
    label: 'Regular Mitra', iconName: 'Star',
    bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300',
    iconBg: 'bg-blue-500',
    nextLevelPoints: 200, pointsToNext: 200 - points,
    progress: Math.round(((points - 50) / 150) * 100),
  };
  return {
    label: 'New Mitra', iconName: 'Leaf',
    bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-300',
    iconBg: 'bg-emerald-500',
    nextLevelPoints: 50, pointsToNext: 50 - points,
    progress: Math.round((points / 50) * 100),
  };
}

// ==========================================
// QUESTION DEFINITIONS
// ==========================================
export interface Question {
  id: string;
  text: string;
  options: Array<{
    label: string;
    value: string;
    iconName: string;
    iconColor: string;
  }>;
}

export function getQuestions(type: QuestionSetType): Question[] {
  switch (type) {
    case 'at_stop':
      return [
        {
          id: 'bus_present',
          text: 'Is a bus currently at or near this stop?',
          options: [
            { label: "Yes, it's here",  value: 'present',   iconName: 'Bus',          iconColor: 'text-emerald-600' },
            { label: 'Just departed',   value: 'just_left', iconName: 'TrendingDown', iconColor: 'text-amber-600'   },
            { label: 'No bus',          value: 'none',       iconName: 'Ban',          iconColor: 'text-red-500'     },
          ],
        },
        {
          id: 'stop_crowding',
          text: 'How busy is the bus stop right now?',
          options: [
            { label: 'Empty',        value: 'empty',   iconName: 'User',          iconColor: 'text-slate-400'   },
            { label: 'A few people', value: 'light',   iconName: 'Users',         iconColor: 'text-blue-500'    },
            { label: 'Crowded',      value: 'crowded', iconName: 'Users',         iconColor: 'text-amber-600'   },
            { label: 'Very packed',  value: 'packed',  iconName: 'AlertTriangle', iconColor: 'text-red-500'     },
          ],
        },
        {
          id: 'stop_condition',
          text: 'Is the bus stop in good condition?',
          options: [
            { label: 'Clean & good',      value: 'good',        iconName: 'CheckCircle2', iconColor: 'text-emerald-600' },
            { label: 'Needs cleaning',    value: 'needs_clean', iconName: 'AlertCircle',  iconColor: 'text-amber-600'   },
            { label: 'Damaged / Issues',  value: 'damaged',     iconName: 'AlertTriangle',iconColor: 'text-red-500'     },
          ],
        },
      ];

    case 'on_bus':
      return [
        {
          id: 'bus_crowding',
          text: 'How crowded is your bus right now?',
          options: [
            { label: 'Comfortable', value: 'comfortable', iconName: 'ThumbsUp',      iconColor: 'text-emerald-600' },
            { label: 'Moderate',    value: 'moderate',    iconName: 'Minus',          iconColor: 'text-amber-600'   },
            { label: 'Overcrowded', value: 'overcrowded', iconName: 'AlertTriangle',  iconColor: 'text-red-500'     },
          ],
        },
        {
          id: 'bus_timing',
          text: 'Is the bus running on schedule?',
          options: [
            { label: 'On time',       value: 'on_time',       iconName: 'CheckCircle2', iconColor: 'text-emerald-600' },
            { label: 'Slightly late', value: 'slightly_late', iconName: 'Clock',        iconColor: 'text-amber-600'   },
            { label: 'Very delayed',  value: 'very_late',     iconName: 'XCircle',      iconColor: 'text-red-500'     },
          ],
        },
        {
          id: 'bus_issues',
          text: 'Any issues with this bus?',
          options: [
            { label: 'All good',         value: 'none',   iconName: 'ThumbsUp',    iconColor: 'text-emerald-600' },
            { label: 'AC not working',   value: 'ac',     iconName: 'Thermometer', iconColor: 'text-amber-600'   },
            { label: 'Cleanliness',      value: 'dirty',  iconName: 'Trash2',      iconColor: 'text-orange-500'  },
            { label: 'Driver behavior',  value: 'driver', iconName: 'ShieldAlert', iconColor: 'text-red-500'     },
          ],
        },
      ];

    case 'general':
    default:
      return [
        {
          id: 'traveled_today',
          text: 'Did you travel by bus today?',
          options: [
            { label: 'Yes, I did',   value: 'yes',      iconName: 'Bus',      iconColor: 'text-emerald-600' },
            { label: 'Planning to',  value: 'planning', iconName: 'Calendar', iconColor: 'text-blue-500'    },
            { label: 'Not today',    value: 'no',       iconName: 'Home',     iconColor: 'text-slate-500'   },
          ],
        },
        {
          id: 'bus_timing',
          text: 'How was bus timing on your last trip?',
          options: [
            { label: 'On time',         value: 'on_time',       iconName: 'CheckCircle2', iconColor: 'text-emerald-600' },
            { label: 'Slightly late',   value: 'slightly_late', iconName: 'Clock',        iconColor: 'text-amber-600'   },
            { label: 'Very late',       value: 'very_late',     iconName: 'XCircle',      iconColor: 'text-red-500'     },
            { label: 'Not applicable',  value: 'na',            iconName: 'Minus',        iconColor: 'text-slate-400'   },
          ],
        },
        {
          id: 'availability',
          text: 'How is bus availability in your area?',
          options: [
            { label: 'Good',    value: 'good',    iconName: 'ThumbsUp',   iconColor: 'text-emerald-600' },
            { label: 'Average', value: 'average', iconName: 'Minus',      iconColor: 'text-amber-600'   },
            { label: 'Poor',    value: 'poor',    iconName: 'ThumbsDown', iconColor: 'text-red-500'     },
          ],
        },
      ];
  }
}
