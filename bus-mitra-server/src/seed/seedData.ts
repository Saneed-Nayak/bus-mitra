import {
  BusStandModel,
  BusRouteModel,
  TimetableModel,
  DepotContactModel,
  RouteSuggestionModel,
  ActivityLogModel,
  AdminUserModel,
} from '../models/index.js';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export const INITIAL_ADMINS = [
  {
    id: 'admin-super',
    username: 'admin',
    email: 'admin@busmitra.com',
    passwordHash: 'Admin@BusMitra2026',
    name: 'Chief Transport Officer',
    role: 'SuperAdmin' as const,
    designation: 'Chief Transport Officer (KSRTC & NWKRTC)',
  },
  {
    id: 'admin-ops',
    username: 'ops_admin',
    email: 'operations@busmitra.com',
    passwordHash: 'Ops@BusMitra2026',
    name: 'Divisional Controller',
    role: 'OperationsAdmin' as const,
    designation: 'Divisional Operations Controller (NWKRTC)',
  },
];

export const INITIAL_BUS_STANDS = [
  { id: 'bs-kumta', name: 'Kumta', kannadaName: 'ಕುಮಟಾ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'KMT', latitude: 14.4274, longitude: 74.4154 },
  { id: 'bs-karwar', name: 'Karwar', kannadaName: 'ಕಾರವಾರ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'KRW', latitude: 14.8003, longitude: 74.1240 },
  { id: 'bs-sirsi', name: 'Sirsi', kannadaName: 'ಶಿರಸಿ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'SRS', latitude: 14.6207, longitude: 74.8392 },
  { id: 'bs-gokarna', name: 'Gokarna', kannadaName: 'ಗೋಕರ್ಣ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'GOK', latitude: 14.5479, longitude: 74.3188 },
  { id: 'bs-ankola', name: 'Ankola', kannadaName: 'ಅಂಕೋಲಾ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'ANK', latitude: 14.6653, longitude: 74.2975 },
  { id: 'bs-honavar', name: 'Honavar', kannadaName: 'ಹೊನ್ನಾವರ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'HNV', latitude: 14.2798, longitude: 74.4427 },
  { id: 'bs-bhatkal', name: 'Bhatkal', kannadaName: 'ಭಟ್ಕಳ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: true, code: 'BTK', latitude: 13.9852, longitude: 74.5639 },
  { id: 'bs-yellapur', name: 'Yellapur', kannadaName: 'ಯಲ್ಲಾಪುರ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: false, code: 'YLP', latitude: 14.9569, longitude: 74.7104 },
  { id: 'bs-joida', name: 'Joida', kannadaName: 'ಜೋಯಿಡಾ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: false, code: 'JOD', latitude: 15.1386, longitude: 74.4233 },
  { id: 'bs-mundgod', name: 'Mundgod', kannadaName: 'ಮುಂಡಗೋಡ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: false, code: 'MND', latitude: 15.0098, longitude: 75.0228 },
  { id: 'bs-dandeli', name: 'Dandeli', kannadaName: 'ದಾಂಡೇಲಿ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: false, code: 'DND', latitude: 15.2566, longitude: 74.6117 },
  { id: 'bs-siddapur', name: 'Siddapur', kannadaName: 'ಸಿದ್ಧಾಪುರ', district: 'Uttara Kannada', status: 'Active' as const, isPopular: false, code: 'SDP', latitude: 14.3600, longitude: 74.8808 },
  { id: 'bs-hubballi', name: 'Hubballi', kannadaName: 'ಹುಬ್ಬಳ್ಳಿ', district: 'Dharwad', status: 'Active' as const, isPopular: true, code: 'UBL', latitude: 15.3647, longitude: 75.1240 },
  { id: 'bs-belagavi', name: 'Belagavi', kannadaName: 'ಬೆಳಗಾವಿ', district: 'Belagavi', status: 'Active' as const, isPopular: true, code: 'BGM', latitude: 15.8497, longitude: 74.4977 },
  { id: 'bs-mangaluru', name: 'Mangaluru', kannadaName: 'ಮಂಗಳೂರು', district: 'Dakshina Kannada', status: 'Active' as const, isPopular: true, code: 'MAQ', latitude: 12.9141, longitude: 74.8560 },
  { id: 'bs-udupi', name: 'Udupi', kannadaName: 'ಉಡುಪಿ', district: 'Udupi', status: 'Active' as const, isPopular: false, code: 'UD', latitude: 13.3409, longitude: 74.7421 },
  { id: 'bs-bengaluru', name: 'Bengaluru', kannadaName: 'ಬೆಂಗಳೂರು', district: 'Bengaluru Urban', status: 'Active' as const, isPopular: true, code: 'SBC', latitude: 12.9716, longitude: 77.5946 },
];

export const INITIAL_ROUTES = [
  { id: 'rt-kumta-karwar', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-karwar', toStandName: 'Karwar', status: 'Published' as const, distanceKm: 72, durationMinutes: 105 },
  { id: 'rt-karwar-kumta', fromStandId: 'bs-karwar', fromStandName: 'Karwar', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 72, durationMinutes: 105 },
  { id: 'rt-kumta-sirsi', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-sirsi', toStandName: 'Sirsi', status: 'Published' as const, distanceKm: 61, durationMinutes: 110 },
  { id: 'rt-sirsi-kumta', fromStandId: 'bs-sirsi', fromStandName: 'Sirsi', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 61, durationMinutes: 110 },
  { id: 'rt-kumta-gokarna', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-gokarna', toStandName: 'Gokarna', status: 'Published' as const, distanceKm: 32, durationMinutes: 45 },
  { id: 'rt-gokarna-kumta', fromStandId: 'bs-gokarna', fromStandName: 'Gokarna', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 32, durationMinutes: 45 },
  { id: 'rt-kumta-bhatkal', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-bhatkal', toStandName: 'Bhatkal', status: 'Published' as const, distanceKm: 68, durationMinutes: 90 },
  { id: 'rt-bhatkal-kumta', fromStandId: 'bs-bhatkal', fromStandName: 'Bhatkal', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 68, durationMinutes: 90 },
  { id: 'rt-kumta-hubballi', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-hubballi', toStandName: 'Hubballi', status: 'Published' as const, distanceKm: 145, durationMinutes: 210 },
  { id: 'rt-hubballi-kumta', fromStandId: 'bs-hubballi', fromStandName: 'Hubballi', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 145, durationMinutes: 210 },
  { id: 'rt-karwar-hubballi', fromStandId: 'bs-karwar', fromStandName: 'Karwar', toStandId: 'bs-hubballi', toStandName: 'Hubballi', status: 'Published' as const, distanceKm: 165, durationMinutes: 240 },
  { id: 'rt-sirsi-hubballi', fromStandId: 'bs-sirsi', fromStandName: 'Sirsi', toStandId: 'bs-hubballi', toStandName: 'Hubballi', status: 'Published' as const, distanceKm: 104, durationMinutes: 150 },
  { id: 'rt-kumta-bengaluru', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-bengaluru', toStandName: 'Bengaluru', status: 'Published' as const, distanceKm: 460, durationMinutes: 540 },
  { id: 'rt-bengaluru-kumta', fromStandId: 'bs-bengaluru', fromStandName: 'Bengaluru', toStandId: 'bs-kumta', toStandName: 'Kumta', status: 'Published' as const, distanceKm: 460, durationMinutes: 540 },
  { id: 'rt-kumta-mangaluru', fromStandId: 'bs-kumta', fromStandName: 'Kumta', toStandId: 'bs-mangaluru', toStandName: 'Mangaluru', status: 'Published' as const, distanceKm: 210, durationMinutes: 270 },
  { id: 'rt-karwar-belagavi', fromStandId: 'bs-karwar', fromStandName: 'Karwar', toStandId: 'bs-belagavi', toStandName: 'Belagavi', status: 'Published' as const, distanceKm: 180, durationMinutes: 270 },
];

export const INITIAL_TIMETABLES = [
  // Kumta -> Karwar
  { id: 'tt-1', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '06:15 AM', arrivalTime: '08:00 AM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-2', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '07:30 AM', arrivalTime: '09:10 AM', status: 'Published' as const, via: 'Ankola Bypass', frequency: 'Daily' },
  { id: 'tt-3', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '08:45 AM', arrivalTime: '10:35 AM', status: 'Published' as const, via: 'Hiregutti, Ankola', frequency: 'Daily' },
  { id: 'tt-4', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige' as const, departureTime: '10:15 AM', arrivalTime: '11:55 AM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-5', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '11:30 AM', arrivalTime: '01:15 PM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-6', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '01:45 PM', arrivalTime: '03:25 PM', status: 'Published' as const, via: 'Ankola Bypass', frequency: 'Daily' },
  { id: 'tt-7', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive' as const, departureTime: '03:15 PM', arrivalTime: '04:50 PM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-8', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '05:30 PM', arrivalTime: '07:15 PM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-9', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige' as const, departureTime: '07:00 PM', arrivalTime: '08:40 PM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },
  { id: 'tt-10', routeId: 'rt-kumta-karwar', fromStandName: 'Kumta', toStandName: 'Karwar', busName: 'Non-AC Sleeper', busType: 'Non-AC Sleeper' as const, departureTime: '09:30 PM', arrivalTime: '11:05 PM', status: 'Published' as const, via: 'Ankola', frequency: 'Daily' },

  // Kumta -> Sirsi
  { id: 'tt-11', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '06:30 AM', arrivalTime: '08:20 AM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },
  { id: 'tt-12', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '08:00 AM', arrivalTime: '09:55 AM', status: 'Published' as const, via: 'Katgal, Devimane', frequency: 'Daily' },
  { id: 'tt-13', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '09:30 AM', arrivalTime: '11:30 AM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },
  { id: 'tt-14', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige' as const, departureTime: '11:15 AM', arrivalTime: '01:05 PM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },
  { id: 'tt-15', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '02:00 PM', arrivalTime: '03:55 PM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },
  { id: 'tt-16', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '04:30 PM', arrivalTime: '06:20 PM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },
  { id: 'tt-17', routeId: 'rt-kumta-sirsi', fromStandName: 'Kumta', toStandName: 'Sirsi', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive' as const, departureTime: '06:45 PM', arrivalTime: '08:35 PM', status: 'Published' as const, via: 'Devimane Ghat', frequency: 'Daily' },

  // Kumta -> Gokarna
  { id: 'tt-18', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '07:00 AM', arrivalTime: '07:45 AM', status: 'Published' as const, via: 'Tadri Cross', frequency: 'Daily' },
  { id: 'tt-19', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '08:30 AM', arrivalTime: '09:15 AM', status: 'Published' as const, via: 'Madangeri Cross', frequency: 'Daily' },
  { id: 'tt-20', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '10:00 AM', arrivalTime: '10:45 AM', status: 'Published' as const, via: 'Tadri Cross', frequency: 'Daily' },
  { id: 'tt-21', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '12:15 PM', arrivalTime: '01:00 PM', status: 'Published' as const, via: 'Madangeri Cross', frequency: 'Daily' },
  { id: 'tt-22', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '03:00 PM', arrivalTime: '03:45 PM', status: 'Published' as const, via: 'Tadri Cross', frequency: 'Daily' },
  { id: 'tt-23', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '05:15 PM', arrivalTime: '06:00 PM', status: 'Published' as const, via: 'Madangeri Cross', frequency: 'Daily' },
  { id: 'tt-24', routeId: 'rt-kumta-gokarna', fromStandName: 'Kumta', toStandName: 'Gokarna', busName: 'Gramina Sarige', busType: 'Gramina Sarige' as const, departureTime: '07:30 PM', arrivalTime: '08:15 PM', status: 'Published' as const, via: 'Tadri Cross', frequency: 'Daily' },

  // Kumta -> Hubballi
  { id: 'tt-25', routeId: 'rt-kumta-hubballi', fromStandName: 'Kumta', toStandName: 'Hubballi', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '06:00 AM', arrivalTime: '09:30 AM', status: 'Published' as const, via: 'Sirsi, Yellapur', frequency: 'Daily' },
  { id: 'tt-26', routeId: 'rt-kumta-hubballi', fromStandName: 'Kumta', toStandName: 'Hubballi', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive' as const, departureTime: '08:15 AM', arrivalTime: '11:45 AM', status: 'Published' as const, via: 'Ankola, Yellapur', frequency: 'Daily' },
  { id: 'tt-27', routeId: 'rt-kumta-hubballi', fromStandName: 'Kumta', toStandName: 'Hubballi', busName: 'Karnataka Sarige', busType: 'Karnataka Sarige' as const, departureTime: '11:00 AM', arrivalTime: '02:45 PM', status: 'Published' as const, via: 'Sirsi, Mundgod', frequency: 'Daily' },
  { id: 'tt-28', routeId: 'rt-kumta-hubballi', fromStandName: 'Kumta', toStandName: 'Hubballi', busName: 'Suvarna Sarige', busType: 'Suvarna Sarige' as const, departureTime: '02:30 PM', arrivalTime: '06:00 PM', status: 'Published' as const, via: 'Ankola, Yellapur', frequency: 'Daily' },
  { id: 'tt-29', routeId: 'rt-kumta-hubballi', fromStandName: 'Kumta', toStandName: 'Hubballi', busName: 'NWKRTC Express', busType: 'NWKRTC Express' as const, departureTime: '05:00 PM', arrivalTime: '08:30 PM', status: 'Published' as const, via: 'Sirsi, Yellapur', frequency: 'Daily' },

  // Kumta -> Bengaluru
  { id: 'tt-30', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Rajahamsa Executive', busType: 'Rajahamsa Executive' as const, departureTime: '07:30 PM', arrivalTime: '05:00 AM', status: 'Published' as const, via: 'Sirsi, Haveri, Tumakuru', frequency: 'Daily' },
  { id: 'tt-31', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Non-AC Sleeper', busType: 'Non-AC Sleeper' as const, departureTime: '08:15 PM', arrivalTime: '05:30 AM', status: 'Published' as const, via: 'Sagara, Shivamogga, Tumakuru', frequency: 'Daily' },
  { id: 'tt-32', routeId: 'rt-kumta-bengaluru', fromStandName: 'Kumta', toStandName: 'Bengaluru', busName: 'Kalyana Ratha', busType: 'Kalyana Ratha' as const, departureTime: '09:00 PM', arrivalTime: '06:00 AM', status: 'Published' as const, via: 'Honnavar, Bhatkal, Kundapura, Hassan', frequency: 'Daily' },
];

export const INITIAL_DEPOTS = [
  { id: 'dp-kumta', depotName: 'Kumta KSRTC Bus Depot', district: 'Uttara Kannada', phoneNumber: '08386-222045', altPhone: '08386-222123', address: 'Near Main Bus Stand, Kumta - 581343', status: 'Active' as const },
  { id: 'dp-karwar', depotName: 'Karwar Division NWKRTC Depot', district: 'Uttara Kannada', phoneNumber: '08382-226344', altPhone: '08382-225211', address: 'MG Road, Karwar - 581301', status: 'Active' as const },
  { id: 'dp-sirsi', depotName: 'Sirsi KSRTC Depot', district: 'Uttara Kannada', phoneNumber: '08384-226356', altPhone: '08384-226100', address: 'Old Bus Stand Road, Sirsi - 581401', status: 'Active' as const },
  { id: 'dp-bhatkal', depotName: 'Bhatkal Bus Depot', district: 'Uttara Kannada', phoneNumber: '08385-226422', altPhone: '08385-226150', address: 'NH 66, Bhatkal - 581320', status: 'Active' as const },
  { id: 'dp-honavar', depotName: 'Honavar Sub-Depot Unit', district: 'Uttara Kannada', phoneNumber: '08387-220233', altPhone: undefined, address: 'Sharavathi Circle, Honavar - 581334', status: 'Active' as const },
  { id: 'dp-hubballi', depotName: 'Hubballi Central Bus Station (CBT)', district: 'Dharwad', phoneNumber: '0836-2372222', altPhone: '0836-2373333', address: 'Gokul Road, Hubballi - 580030', status: 'Active' as const },
];

export const INITIAL_SUGGESTIONS = [
  { id: 'sug-1', fromStandName: 'Gokarna', toStandName: 'Murudeshwar', preferredTime: '09:00 AM', message: 'Many temple pilgrims need direct early morning bus between Gokarna and Murudeshwar.', status: 'Pending' as const },
  { id: 'sug-2', fromStandName: 'Kumta', toStandName: 'Dandeli', preferredTime: '06:30 AM', message: 'Weekend tourist bus for Kali river rafting.', status: 'Approved' as const, adminNotes: 'Approved and route created.' },
  { id: 'sug-3', fromStandName: 'Karwar', toStandName: 'Yellapur', preferredTime: '04:00 PM', message: 'Direct evening college commuter bus.', status: 'Pending' as const },
];

export const INITIAL_ACTIVITY = [
  { id: 'act-1', type: 'timetable_published' as const, title: 'Timetable Published: Kumta → Karwar', description: '06:15 AM (Karnataka Sarige)', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', type: 'route_added' as const, title: 'New Route: Kumta → Bengaluru', description: 'Distance: 460km, Status: Published', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'act-3', type: 'suggestion_approved' as const, title: 'Approved Route: Kumta → Dandeli', description: 'Published to Client Search', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
];

export async function seedDatabase(force = false): Promise<void> {
  const now = new Date().toISOString();

  // 1. Admin Users
  const adminCount = await AdminUserModel.countDocuments();
  if (adminCount === 0 || force) {
    if (force) await AdminUserModel.deleteMany({});
    await AdminUserModel.insertMany(
      INITIAL_ADMINS.map((a) => ({ ...a, createdAt: now, updatedAt: now }))
    );
    console.log('[Seed] Admin accounts (admin, ops_admin) seeded successfully.');
  }

  // 2. Bus Stands
  const standCount = await BusStandModel.countDocuments();
  if (standCount === 0 || force) {
    if (force) await BusStandModel.deleteMany({});
    await BusStandModel.insertMany(
      INITIAL_BUS_STANDS.map((s) => ({ ...s, createdAt: now, updatedAt: now }))
    );
    console.log('[Seed] Bus stands seeded.');
  }

  // 3. Routes
  const routeCount = await BusRouteModel.countDocuments();
  if (routeCount === 0 || force) {
    if (force) await BusRouteModel.deleteMany({});
    await BusRouteModel.insertMany(
      INITIAL_ROUTES.map((r) => ({ ...r, createdAt: now, updatedAt: now }))
    );
    console.log('[Seed] Bus routes seeded.');
  }

  // 4. Timetables
  const timetableCount = await TimetableModel.countDocuments();
  if (timetableCount === 0 || force) {
    if (force) await TimetableModel.deleteMany({});
    await TimetableModel.insertMany(
      INITIAL_TIMETABLES.map((t) => ({
        ...t,
        departureMinutes: parseTimeToMinutes(t.departureTime),
        createdAt: now,
        updatedAt: now,
      }))
    );
    console.log('[Seed] Timetables seeded.');
  }

  // 5. Depots
  const depotCount = await DepotContactModel.countDocuments();
  if (depotCount === 0 || force) {
    if (force) await DepotContactModel.deleteMany({});
    await DepotContactModel.insertMany(
      INITIAL_DEPOTS.map((d) => ({ ...d, createdAt: now, updatedAt: now }))
    );
    console.log('[Seed] Depot contacts seeded.');
  }

  // 6. Suggestions
  const suggestionCount = await RouteSuggestionModel.countDocuments();
  if (suggestionCount === 0 || force) {
    if (force) await RouteSuggestionModel.deleteMany({});
    await RouteSuggestionModel.insertMany(
      INITIAL_SUGGESTIONS.map((s) => ({ ...s, createdAt: now, updatedAt: now }))
    );
    console.log('[Seed] Suggestions seeded.');
  }

  // 7. Activity
  const activityCount = await ActivityLogModel.countDocuments();
  if (activityCount === 0 || force) {
    if (force) await ActivityLogModel.deleteMany({});
    await ActivityLogModel.insertMany(INITIAL_ACTIVITY);
  }

  console.log('[Seed] Database initialization verified.');
}
