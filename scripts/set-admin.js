// Set admin custom claim on a user
// Run with: node scripts/set-admin.js your-email@example.com
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

async function setAdmin(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.uid} (${user.email})`);

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set admin claim for ${email}`);

    // Verify it worked
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Custom claims:', updatedUser.customClaims);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin.js your-email@example.com');
  process.exit(1);
}

setAdmin(email);
