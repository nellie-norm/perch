// Seed venues using Firebase Admin SDK (bypasses security rules)
// Run with: node scripts/seed-venues-admin.js
//
// Prerequisites:
// 1. npm install firebase-admin
// 2. Download service account key from Firebase Console
// 3. Save as service-account.json in project root

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const venues = [
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
    gradient: 'linear-gradient(135deg, #8B7355 0%, #D4A574 100%)',
    active: true
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
    gradient: 'linear-gradient(135deg, #5D6D7E 0%, #85929E 100%)',
    active: true
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
    gradient: 'linear-gradient(135deg, #7D6B5D 0%, #A89080 100%)',
    active: true
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
    gradient: 'linear-gradient(135deg, #6B7D5D 0%, #90A880 100%)',
    active: true
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
    gradient: 'linear-gradient(135deg, #5D7D8E 0%, #7DA0B0 100%)',
    active: true
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
    gradient: 'linear-gradient(135deg, #8D6D7E 0%, #A08090 100%)',
    active: true
  }
];

async function seedVenues() {
  console.log('Starting venue seed (Admin SDK)...\n');

  for (const venue of venues) {
    try {
      await db.collection('venues').doc(venue.id).set(venue);
      console.log(`✓ Seeded: ${venue.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${venue.name}:`, error.message);
    }
  }

  console.log('\nVenue seed complete!');
  process.exit(0);
}

seedVenues();
