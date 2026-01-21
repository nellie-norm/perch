// Venues Data - Fetches from Firestore with static fallback
// When Firestore is populated, it becomes the source of truth
// Edit venues in Firebase Console: https://console.firebase.google.com

import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Static fallback data (used if Firestore fetch fails)
const staticVenues = [
  {
    id: 'allpress',
    name: 'Allpress Espresso',
    type: 'Coffee Roasters',
    area: 'Shoreditch',
    address: '58 Redchurch Street, Shoreditch, London E2 7DP',
    lat: 51.5245,
    lng: -0.0760,
    pricePerHour: 7,
    rating: 4.8,
    reviews: 124,
    wifi: 'fast',
    wifiSpeed: '120 Mbps',
    power: true,
    quiet: false,
    seats: 14,
    closes: '6pm',
    phone: '020 7749 1780',
    gradient: 'linear-gradient(135deg, #8B7355 0%, #D4A574 100%)'
  },
  {
    id: 'ozone',
    name: 'Ozone Coffee Roasters',
    type: 'Cafe',
    area: 'Old Street',
    address: '11 Leonard Street, Shoreditch, London EC2A 4AQ',
    lat: 51.5275,
    lng: -0.0840,
    pricePerHour: 8,
    rating: 4.7,
    reviews: 98,
    wifi: 'fast',
    wifiSpeed: '150 Mbps',
    power: true,
    quiet: false,
    seats: 22,
    closes: '5pm',
    phone: '020 7490 1039',
    gradient: 'linear-gradient(135deg, #5D6D7E 0%, #85929E 100%)'
  },
  {
    id: 'hoxton',
    name: 'The Hoxton Lobby',
    type: 'Hotel Cafe',
    area: 'Shoreditch',
    address: '81 Great Eastern Street, London EC2A 3HU',
    lat: 51.5265,
    lng: -0.0800,
    pricePerHour: 6,
    rating: 4.5,
    reviews: 156,
    wifi: 'fine',
    wifiSpeed: '50 Mbps',
    power: true,
    quiet: true,
    seats: 35,
    closes: '10pm',
    phone: '020 7550 1000',
    gradient: 'linear-gradient(135deg, #7D6B5D 0%, #A89080 100%)'
  },
  {
    id: 'lookmum',
    name: 'Look Mum No Hands!',
    type: 'Bike Cafe',
    area: 'Clerkenwell',
    address: '49 Old Street, London EC1V 9HX',
    lat: 51.5225,
    lng: -0.1020,
    pricePerHour: 5,
    rating: 4.6,
    reviews: 87,
    wifi: 'fast',
    wifiSpeed: '100 Mbps',
    power: true,
    quiet: false,
    seats: 18,
    closes: '9pm',
    phone: '020 7253 1025',
    gradient: 'linear-gradient(135deg, #6B7D5D 0%, #90A880 100%)'
  },
  {
    id: 'caravan',
    name: "Caravan King's Cross",
    type: 'Restaurant',
    area: "King's Cross",
    address: '1 Granary Square, London N1C 4AA',
    lat: 51.5355,
    lng: -0.1245,
    pricePerHour: 9,
    rating: 4.4,
    reviews: 203,
    wifi: 'fast',
    wifiSpeed: '200 Mbps',
    power: true,
    quiet: false,
    seats: 40,
    closes: '10:30pm',
    phone: '020 7101 7661',
    gradient: 'linear-gradient(135deg, #5D7D8E 0%, #7DA0B0 100%)'
  },
  {
    id: 'attendant',
    name: 'Attendant Fitzrovia',
    type: 'Cafe',
    area: 'Fitzrovia',
    address: '27A Foley Street, London W1W 6DY',
    lat: 51.5195,
    lng: -0.1385,
    pricePerHour: 6,
    rating: 4.3,
    reviews: 65,
    wifi: 'fine',
    wifiSpeed: '45 Mbps',
    power: true,
    quiet: true,
    seats: 12,
    closes: '5:30pm',
    phone: '020 7637 3794',
    gradient: 'linear-gradient(135deg, #8D6D7E 0%, #A08090 100%)'
  }
];

// Cache for loaded venues
let venuesCache = null;
let venuesByIdCache = null;
let loadingPromise = null;

// Fetch venues from Firestore
async function fetchVenuesFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'venues'));
    if (snapshot.empty) {
      console.log('No venues in Firestore, using static data');
      return null;
    }
    const venues = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.active !== false) { // Only include active venues
        venues.push({ id: doc.id, ...data });
      }
    });
    console.log(`Loaded ${venues.length} venues from Firestore`);
    return venues;
  } catch (error) {
    console.warn('Failed to fetch venues from Firestore:', error.message);
    return null;
  }
}

// Load venues (from Firestore or fallback to static)
async function loadVenues() {
  if (venuesCache) return venuesCache;

  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const firestoreVenues = await fetchVenuesFromFirestore();
    venuesCache = firestoreVenues || staticVenues;
    venuesByIdCache = Object.fromEntries(venuesCache.map(v => [v.id, v]));
    return venuesCache;
  })();

  return loadingPromise;
}

// Initialize on module load
loadVenues();

// ============ Async API (recommended) ============

export async function getAllVenues() {
  await loadVenues();
  return venuesCache;
}

export async function getVenueById(id) {
  await loadVenues();
  return venuesByIdCache[id] || null;
}

export async function getVenuePrice(id) {
  const venue = await getVenueById(id);
  return venue ? venue.pricePerHour : null;
}

export async function calculateBookingPrice(venueId, hours, people) {
  const venue = await getVenueById(venueId);
  if (!venue) return null;

  const subtotal = venue.pricePerHour * hours * people;
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  return {
    subtotal,
    vat,
    total,
    pricePerHour: venue.pricePerHour,
    hours,
    people
  };
}

// ============ Sync API (for backwards compatibility) ============
// These use cached data - call loadVenues() first if cache might be empty

export function getAllVenuesSync() {
  return venuesCache || staticVenues;
}

export function getVenueByIdSync(id) {
  const cache = venuesByIdCache || Object.fromEntries(staticVenues.map(v => [v.id, v]));
  return cache[id] || null;
}

// For backwards compatibility - returns venues with 'price' alias
export function getVenuesWithLegacyFormat() {
  const venues = venuesCache || staticVenues;
  return venues.map(v => ({
    ...v,
    price: v.pricePerHour
  }));
}

// Get venues as object keyed by ID (for venue.html compatibility)
export function getVenueDatabase() {
  const venues = venuesCache || staticVenues;
  return Object.fromEntries(
    venues.map(v => [v.id, { ...v, price: v.pricePerHour }])
  );
}

// Ensure venues are loaded (call this early in page lifecycle)
export { loadVenues };
