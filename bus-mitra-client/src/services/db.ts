import {
  BusStand,
  BusRoute,
  Timetable,
  DepotContact,
  RouteSuggestion,
  ActivityLog,
  BusType,
} from '../types';

const STORAGE_KEY_PREFIX = 'karnataka_bus_db_v1_';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedH = hours.toString().padStart(2, '0');
  const paddedM = minutes.toString().padStart(2, '0');
  return `${paddedH}:${paddedM} ${period}`;
}

// Initial Authentic Seed Data for Karnataka
export const INITIAL_BUS_STANDS: BusStand[] = [
  { id: 'bs-kumta', name: 'Kumta', kannadaName: 'ಕುಮಟಾ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'KMT', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-gokarna', name: 'Gokarna', kannadaName: 'ಗೋಕರ್ಣ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'GKN', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-ankola', name: 'Ankola', kannadaName: 'ಅಂಕೋಲಾ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'ANK', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-karwar', name: 'Karwar', kannadaName: 'ಕಾರವಾರ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'KRW', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-honavar', name: 'Honavar', kannadaName: 'ಹೊನ್ನಾವರ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'HNV', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-bhatkal', name: 'Bhatkal', kannadaName: 'ಭಟ್ಕಳ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'BTK', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-sirsi', name: 'Sirsi', kannadaName: 'ಶಿರಸಿ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'SRS', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-yellapur', name: 'Yellapur', kannadaName: 'ಯಲ್ಲಾಪುರ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'YLP', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-joida', name: 'Joida', kannadaName: 'ಜೋಯಿಡಾ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'JOD', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-mundgod', name: 'Mundgod', kannadaName: 'ಮುಂಡಗೋಡು', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'MGD', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-dandeli', name: 'Dandeli', kannadaName: 'ದಾಂಡೇಲಿ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'DND', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-siddapur', name: 'Siddapur', kannadaName: 'ಸಿದ್ಧಾಪುರ', district: 'Uttara Kannada', status: 'Active', isPopular: true, code: 'SDP', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-hubballi', name: 'Hubballi', kannadaName: 'ಹುಬ್ಬಳ್ಳಿ', district: 'Dharwad', status: 'Active', isPopular: true, code: 'UBL', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-belagavi', name: 'Belagavi', kannadaName: 'ಬೆಳಗಾವಿ', district: 'Belagavi', status: 'Active', isPopular: false, code: 'BGM', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-mangaluru', name: 'Mangaluru', kannadaName: 'ಮಂಗಳೂರು', district: 'Dakshina Kannada', status: 'Active', isPopular: false, code: 'MLR', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-udupi', name: 'Udupi', kannadaName: 'ಉಡುಪಿ', district: 'Udupi', status: 'Active', isPopular: false, code: 'UDP', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'bs-bengaluru', name: 'Bengaluru', kannadaName: 'ಬೆಂಗಳೂರು', district: 'Bengaluru Urban', status: 'Active', isPopular: false, code: 'SBC', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
];

export const INITIAL_ROUTES: BusRoute[] = [
  { id: 'rt-kumta-karwar', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-karwar', toStandName: 'Karwar', status: 'Published', distanceKm: 72, durationMinutes: 105, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-karwar-kumta', fromStandId: 'bs-karwar', fromStandName: 'Karwar', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published', distanceKm: 72, durationMinutes: 105, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-kumta-gokarna', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-gokarna', toStandName: 'Gokarna', status: 'Published', distanceKm: 31, durationMinutes: 45, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-gokarna-kumta', fromStandId: 'bs-gokarna', fromStandName: 'Gokarna', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published', distanceKm: 31, durationMinutes: 45, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-kumta-sirsi', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-sirsi', toStandName: 'Sirsi', status: 'Published', distanceKm: 62, durationMinutes: 110, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-sirsi-kumta', fromStandId: 'bs-sirsi', fromStandName: 'Sirsi', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published', distanceKm: 62, durationMinutes: 110, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-kumta-honavar', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-honavar', toStandName: 'Honavar', status: 'Published', distanceKm: 19, durationMinutes: 30, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-honavar-bhatkal', fromStandId: 'bs-honavar', fromStandName: 'Honavar', toStandId: 'bs-bhatkal', toStandName: 'Bhatkal', status: 'Published', distanceKm: 38, durationMinutes: 50, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-bhatkal-mangaluru', fromStandId: 'bs-bhatkal', fromStandName: 'Bhatkal', toStandId: 'bs-mangaluru', toStandName: 'Mangaluru', status: 'Published', distanceKm: 140, durationMinutes: 210, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-sirsi-hubballi', fromStandId: 'bs-sirsi', fromStandName: 'Sirsi', toStandId: 'bs-hubballi', toStandName: 'Hubballi', status: 'Published', distanceKm: 104, durationMinutes: 150, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-yellapur-hubballi', fromStandId: 'bs-yellapur', fromStandName: 'Yellapur', toStandId: 'bs-hubballi', toStandName: 'Hubballi', status: 'Published', distanceKm: 70, durationMinutes: 95, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-karwar-belagavi', fromStandId: 'bs-karwar', fromStandName: 'Karwar', toStandId: 'bs-belagavi', toStandName: 'Belagavi', status: 'Published', distanceKm: 168, durationMinutes: 240, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-ankola-karwar', fromStandId: 'bs-ankola', fromStandName: 'Ankola', toStandId: 'bs-karwar', toStandName: 'Karwar', status: 'Published', distanceKm: 36, durationMinutes: 50, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-dandeli-karwar', fromStandId: 'bs-dandeli', fromStandName: 'Dandeli', toStandId: 'bs-karwar', toStandName: 'Karwar', status: 'Published', distanceKm: 112, durationMinutes: 180, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
  { id: 'rt-kumta-bengaluru', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-bengaluru', toStandName: 'Bengaluru', status: 'Published', distanceKm: 460, durationMinutes: 570, createdAt: '2025-01-01T07:00:00Z', updatedAt: '2025-01-01T07:00:00Z' },
];

export const INITIAL_TIMETABLES: Timetable[] = [
  // Kumta -> Karwar
  { id: 'tt-1', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '06:15 AM', departureMinutes: 375, arrivalTime: '08:00 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-2', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '07:30 AM', departureMinutes: 450, arrivalTime: '09:15 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-3', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '08:45 AM', departureMinutes: 525, arrivalTime: '10:15 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-4', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '10:15 AM', departureMinutes: 615, arrivalTime: '11:45 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-5', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Gramina Sarige', busType: 'Gramina Sarige', departureTime: '11:30 AM', departureMinutes: 690, arrivalTime: '01:20 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-6', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '01:00 PM', departureMinutes: 780, arrivalTime: '02:45 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-7', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige', departureTime: '02:45 PM', departureMinutes: 885, arrivalTime: '04:25 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-8', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '04:15 PM', departureMinutes: 975, arrivalTime: '05:55 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-9', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '05:45 PM', departureMinutes: 1065, arrivalTime: '07:15 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-10', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '07:15 PM', departureMinutes: 1155, arrivalTime: '08:50 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-11', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Non-AC Sleeper', busType: 'Non-AC Sleeper', departureTime: '08:30 PM', departureMinutes: 1230, arrivalTime: '10:00 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Karwar -> Kumta
  { id: 'tt-12', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '06:30 AM', departureMinutes: 390, arrivalTime: '08:15 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-13', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '08:00 AM', departureMinutes: 480, arrivalTime: '09:30 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-14', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '09:30 AM', departureMinutes: 570, arrivalTime: '11:10 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-15', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '11:15 AM', departureMinutes: 675, arrivalTime: '12:45 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-16', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Gramina Sarige', busType: 'Gramina Sarige', departureTime: '02:00 PM', departureMinutes: 840, arrivalTime: '03:45 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-17', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '04:30 PM', departureMinutes: 990, arrivalTime: '06:10 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-18', routeId: 'rt-karwar-kumta', fromStandName: 'Karwar', toStandName: 'Kumta', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige', departureTime: '06:45 PM', departureMinutes: 1125, arrivalTime: '08:25 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Kumta -> Gokarna
  { id: 'tt-19', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Gramina Sarige', busType: 'Gramina Sarige', departureTime: '07:00 AM', departureMinutes: 420, arrivalTime: '07:45 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-20', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '09:00 AM', departureMinutes: 540, arrivalTime: '09:40 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-21', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '11:15 AM', departureMinutes: 675, arrivalTime: '12:00 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-22', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige', departureTime: '02:30 PM', departureMinutes: 870, arrivalTime: '03:15 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-23', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '05:30 PM', departureMinutes: 1050, arrivalTime: '06:15 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Kumta -> Sirsi
  { id: 'tt-24', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '06:45 AM', departureMinutes: 405, arrivalTime: '08:35 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-25', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '08:30 AM', departureMinutes: 510, arrivalTime: '10:15 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-26', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '10:30 AM', departureMinutes: 630, arrivalTime: '12:15 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-27', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '01:15 PM', departureMinutes: 795, arrivalTime: '03:05 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-28', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Gramina Sarige', busType: 'Gramina Sarige', departureTime: '03:45 PM', departureMinutes: 945, arrivalTime: '05:40 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-29', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '06:00 PM', departureMinutes: 1080, arrivalTime: '07:50 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Sirsi -> Hubballi
  { id: 'tt-30', routeId: 'rt-sirsi-hubballi', fromStandName: 'Sirsi', toStandName: 'Hubballi', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '06:00 AM', departureMinutes: 360, arrivalTime: '08:30 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-31', routeId: 'rt-sirsi-hubballi', fromStandName: 'Sirsi', toStandName: 'Hubballi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '08:15 AM', departureMinutes: 495, arrivalTime: '10:45 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-32', routeId: 'rt-sirsi-hubballi', fromStandName: 'Sirsi', toStandName: 'Hubballi', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '11:00 AM', departureMinutes: 660, arrivalTime: '01:25 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-33', routeId: 'rt-sirsi-hubballi', fromStandName: 'Sirsi', toStandName: 'Hubballi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '02:30 PM', departureMinutes: 870, arrivalTime: '05:00 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-34', routeId: 'rt-sirsi-hubballi', fromStandName: 'Sirsi', toStandName: 'Hubballi', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '05:15 PM', departureMinutes: 1035, arrivalTime: '07:45 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Honavar -> Bhatkal
  { id: 'tt-35', routeId: 'rt-honavar-bhatkal', fromStandName: 'Honavar', toStandName: 'Bhatkal', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '07:15 AM', departureMinutes: 435, arrivalTime: '08:05 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-36', routeId: 'rt-honavar-bhatkal', fromStandName: 'Honavar', toStandName: 'Bhatkal', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '09:45 AM', departureMinutes: 585, arrivalTime: '10:30 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-37', routeId: 'rt-honavar-bhatkal', fromStandName: 'Honavar', toStandName: 'Bhatkal', busName: 'Gramina Sarige', busType: 'Gramina Sarige', departureTime: '01:30 PM', departureMinutes: 810, arrivalTime: '02:25 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-38', routeId: 'rt-honavar-bhatkal', fromStandName: 'Honavar', toStandName: 'Bhatkal', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '04:45 PM', departureMinutes: 1005, arrivalTime: '05:35 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Bhatkal -> Mangaluru
  { id: 'tt-39', routeId: 'rt-bhatkal-mangaluru', fromStandName: 'Bhatkal', toStandName: 'Mangaluru', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige', departureTime: '06:00 AM', departureMinutes: 360, arrivalTime: '09:30 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-40', routeId: 'rt-bhatkal-mangaluru', fromStandName: 'Bhatkal', toStandName: 'Mangaluru', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '09:00 AM', departureMinutes: 540, arrivalTime: '12:20 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-41', routeId: 'rt-bhatkal-mangaluru', fromStandName: 'Bhatkal', toStandName: 'Mangaluru', busName: 'NWKRTC Express', busType: 'NWKRTC Express', departureTime: '01:15 PM', departureMinutes: 795, arrivalTime: '04:45 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-42', routeId: 'rt-bhatkal-mangaluru', fromStandName: 'Bhatkal', toStandName: 'Mangaluru', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige', departureTime: '05:00 PM', departureMinutes: 1020, arrivalTime: '08:30 PM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },

  // Kumta -> Bengaluru
  { id: 'tt-43', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive', departureTime: '07:30 PM', departureMinutes: 1170, arrivalTime: '05:30 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-44', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Non-AC Sleeper', busType: 'Non-AC Sleeper', departureTime: '08:45 PM', departureMinutes: 1245, arrivalTime: '06:15 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 'tt-45', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Kalyana Ratha', busType: 'Kalyana Ratha', departureTime: '09:30 PM', departureMinutes: 1290, arrivalTime: '06:45 AM', status: 'Published', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
];

export const INITIAL_DEPOTS: DepotContact[] = [
  { id: 'dp-kumta', depotName: 'Kumta Depot (ಕುಮಟಾ)', district: 'Uttara Kannada', phoneNumber: '08386-222045', altPhone: '08386-222888', address: 'Near National Highway 66, Kumta, Karnataka 581343', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-karwar', depotName: 'Karwar Central Depot (ಕಾರವಾರ)', district: 'Uttara Kannada', phoneNumber: '08382-226344', altPhone: '08382-226500', address: 'Main Bus Stand Road, Karwar, Karnataka 581301', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-sirsi', depotName: 'Sirsi Division Depot (ಶಿರಸಿ)', district: 'Uttara Kannada', phoneNumber: '08384-226244', altPhone: '08384-226022', address: 'Hubballi Road, Sirsi, Karnataka 581402', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-bhatkal', depotName: 'Bhatkal Depot (ಭಟ್ಕಳ)', district: 'Uttara Kannada', phoneNumber: '08385-226442', altPhone: '08385-226300', address: 'Old Bus Stand Rd, Bhatkal, Karnataka 581320', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-honavar', depotName: 'Honavar Depot (ಹೊನ್ನಾವರ)', district: 'Uttara Kannada', phoneNumber: '08387-220232', altPhone: '08387-220450', address: 'Sharavathi Bridge Junction, Honavar, Karnataka 581334', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-ankola', depotName: 'Ankola Sub-Depot (ಅಂಕೋಲಾ)', district: 'Uttara Kannada', phoneNumber: '08388-230232', altPhone: '08388-230100', address: 'KSRTC Bus Station, Ankola, Karnataka 581314', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-yellapur', depotName: 'Yellapur Depot (ಯಲ್ಲಾಪುರ)', district: 'Uttara Kannada', phoneNumber: '08419-261224', altPhone: '08419-261300', address: 'National Highway 63, Yellapur, Karnataka 581359', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-dandeli', depotName: 'Dandeli Depot (ದಾಂಡೇಲಿ)', district: 'Uttara Kannada', phoneNumber: '08284-233144', altPhone: '08284-233200', address: 'Main Road, Dandeli, Karnataka 581325', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
  { id: 'dp-hubballi', depotName: 'NWKRTC Hubballi Central (ಹುಬ್ಬಳ್ಳಿ)', district: 'Dharwad', phoneNumber: '0836-2372224', altPhone: '0836-2373333', address: 'Gokul Road, Hubballi, Karnataka 580030', status: 'Active', createdAt: '2025-01-01T06:00:00Z', updatedAt: '2025-01-01T06:00:00Z' },
];

export const INITIAL_SUGGESTIONS: RouteSuggestion[] = [
  { id: 'sug-1', fromStandName: 'Gokarna', toStandName: 'Sirsi', preferredTime: '08:00 AM', message: 'Please add morning direct bus for office workers and students.', status: 'Pending', createdAt: '2025-02-10T09:30:00Z', updatedAt: '2025-02-10T09:30:00Z' },
  { id: 'sug-2', fromStandName: 'Kumta', toStandName: 'Dandeli', preferredTime: '07:00 AM', message: 'Direct bus via Yellapur needed for tourists and weekend travelers.', status: 'Reviewed', adminNotes: 'Feasibility under review with Sirsi Division', createdAt: '2025-02-08T14:15:00Z', updatedAt: '2025-02-09T10:00:00Z' },
];

export const INITIAL_ACTIVITY: ActivityLog[] = [
  { id: 'act-1', type: 'timetable_published', title: 'Kumta → Karwar Timetables Published', description: '11 schedules verified and published for coastal corridor', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', type: 'route_added', title: 'New Route Added', description: 'Kumta → Sirsi connecting coastal and malnad region', timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'act-3', type: 'suggestion_received', title: 'Route Suggestion Received', description: 'From Gokarna to Sirsi requested by commuter', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: 'act-4', type: 'depot_updated', title: 'Kumta Depot Helpline Updated', description: 'Control room phone number 08386-222045 confirmed active', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
];

// Database Storage Controller with real-time broadcast channel
class DatabaseStore {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('karnataka_bus_sync_channel');
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch (e) {
        // BroadcastChannel fallback for older runtimes
      }

      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_KEY_PREFIX)) {
          this.notifyListeners();
        }
      });

      this.initDefaultData();
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in listener callback:', err);
      }
    });
  }

  private broadcastChange(key: string) {
    if (this.channel) {
      this.channel.postMessage({ type: 'CHANGE', key, timestamp: Date.now() });
    }
    this.notifyListeners();
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`Failed to read ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
      this.broadcastChange(key);
    } catch (e) {
      console.error(`Failed to write ${key} to storage:`, e);
    }
  }

  public initDefaultData(forceReset = false) {
    if (typeof window === 'undefined') return;

    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'bus_stands')) {
      this.setItem('bus_stands', INITIAL_BUS_STANDS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'routes')) {
      this.setItem('routes', INITIAL_ROUTES);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'timetables')) {
      this.setItem('timetables', INITIAL_TIMETABLES);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'depots')) {
      this.setItem('depots', INITIAL_DEPOTS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'suggestions')) {
      this.setItem('suggestions', INITIAL_SUGGESTIONS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'activity')) {
      this.setItem('activity', INITIAL_ACTIVITY);
    }
    this.broadcastChange('all');
  }

  // Activity logger helper
  public logActivity(type: ActivityLog['type'], title: string, description: string) {
    const logs = this.getActivity();
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    this.setItem('activity', [newLog, ...logs].slice(0, 50));
  }

  // BUS STANDS
  public getBusStands(): BusStand[] {
    return this.getItem<BusStand[]>('bus_stands', INITIAL_BUS_STANDS);
  }

  public saveBusStands(stands: BusStand[]) {
    this.setItem('bus_stands', stands);
  }

  // ROUTES
  public getRoutes(): BusRoute[] {
    return this.getItem<BusRoute[]>('routes', INITIAL_ROUTES);
  }

  public saveRoutes(routes: BusRoute[]) {
    this.setItem('routes', routes);
  }

  // TIMETABLES
  public getTimetables(): Timetable[] {
    return this.getItem<Timetable[]>('timetables', INITIAL_TIMETABLES);
  }

  public saveTimetables(timetables: Timetable[]) {
    this.setItem('timetables', timetables);
  }

  // DEPOTS
  public getDepots(): DepotContact[] {
    return this.getItem<DepotContact[]>('depots', INITIAL_DEPOTS);
  }

  public saveDepots(depots: DepotContact[]) {
    this.setItem('depots', depots);
  }

  // SUGGESTIONS
  public getSuggestions(): RouteSuggestion[] {
    return this.getItem<RouteSuggestion[]>('suggestions', INITIAL_SUGGESTIONS);
  }

  public saveSuggestions(suggestions: RouteSuggestion[]) {
    this.setItem('suggestions', suggestions);
  }

  // ACTIVITY
  public getActivity(): ActivityLog[] {
    return this.getItem<ActivityLog[]>('activity', INITIAL_ACTIVITY);
  }
}

export const db = new DatabaseStore();
