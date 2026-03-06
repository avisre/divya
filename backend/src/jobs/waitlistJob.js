import { PujaBooking } from "../models/PujaBooking.js";
import { sendCardExpiryReminderEmail } from "../utils/email.js";

export async function runWaitlistJob() {
  const now = new Date();
  const target = new Date(now);
  target.setUTCDate(target.getUTCDate() + 7);

  const bookings = await PujaBooking.find({
    status: "confirmed",
    scheduledDate: {
      $gte: new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())),
      $lt: new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate() + 1))
    }
  }).populate("user puja temple");

  for (const booking of bookings) {
    await sendCardExpiryReminderEmail({
      to: booking.user.email,
      ctaUrl: `divya://booking/${booking._id}`,
      booking: {
        heroImage: booking.temple.heroImage,
        scheduledDate: new Date(booking.scheduledDate).toDateString(),
        cardLast4: "XXXX"
      }
    });
  }
}

