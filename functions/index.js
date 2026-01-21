const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_nt1ujbi';
const EMAILJS_TEMPLATE_ID = 'template_review';
const EMAILJS_PUBLIC_KEY = 'I2Jsu6HwY3b2r74hs';

// Send email via EmailJS REST API
async function sendEmailJS(templateParams) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`EmailJS error: ${error}`);
  }

  return response;
}

// Calculate booking end time from date, time string, and duration
function getBookingEndTime(dateStr, timeStr, durationHours) {
  const date = new Date(dateStr);

  // Parse time like "2:30 PM"
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return null;

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const isPM = timeMatch[3].toUpperCase() === 'PM';

  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  date.setHours(hours + durationHours, minutes, 0, 0);
  return date;
}

// Scheduled function: runs every 15 mins, sends review emails for bookings that just ended
exports.sendReviewEmails = onSchedule({
  schedule: "every 15 minutes",
  timeZone: "Europe/London",
}, async (event) => {
  const now = new Date();
  console.log(`Checking for bookings that ended before ${now.toISOString()}`);

  // Query all checked-in bookings that haven't had a review email sent
  const bookingsSnapshot = await db.collection('bookings')
    .where('status', '==', 'checked_in')
    .where('reviewEmailSent', '==', false)
    .get();

  console.log(`Found ${bookingsSnapshot.size} checked-in bookings to check`);

  const emailPromises = [];

  for (const doc of bookingsSnapshot.docs) {
    const booking = doc.data();
    const endTime = getBookingEndTime(booking.date, booking.time, booking.duration);

    if (!endTime) {
      console.log(`Could not parse end time for booking ${doc.id}`);
      continue;
    }

    // Check if booking has ended (end time is in the past)
    if (endTime <= now) {
      console.log(`Sending review email for booking ${doc.id}`);

      const emailPromise = sendEmailJS({
        to_name: booking.user?.name || 'there',
        to_email: booking.user?.email,
        venue_name: booking.venue?.name || 'the venue',
        booking_date: new Date(booking.date).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }),
        review_link: `https://perch-tau.vercel.app/review.html?ref=${doc.id}`,
      }).then(async () => {
        // Mark email as sent
        await db.collection('bookings').doc(doc.id).update({
          reviewEmailSent: true,
          reviewEmailSentAt: FieldValue.serverTimestamp(),
        });
        console.log(`Review email sent for booking ${doc.id}`);
      }).catch(error => {
        console.error(`Failed to send review email for ${doc.id}:`, error);
      });

      emailPromises.push(emailPromise);
    }
  }

  await Promise.all(emailPromises);
  console.log(`Processed ${emailPromises.length} review emails`);
});

// When a booking is checked in, initialize reviewEmailSent flag
exports.onBookingCheckedIn = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Only trigger when status changes to 'checked_in'
  if (before.status !== 'checked_in' && after.status === 'checked_in') {
    console.log(`Booking ${event.params.bookingId} checked in, setting reviewEmailSent flag`);

    await event.data.after.ref.update({
      reviewEmailSent: false,
    });
  }
});
