import "dotenv/config";
import Stripe from "stripe";
import { PujaBooking } from "../models/PujaBooking.js";
import { User } from "../models/User.js";
import { sendGiftReceivedEmail, sendPaymentFailedEmail, sendWaitlistConfirmationEmail } from "../utils/email.js";
import {
  syncUserSubscriptionFromCheckoutSession,
  syncUserSubscriptionFromStripeSubscription
} from "../utils/subscriptionBilling.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function handleStripeWebhook(req, res, next) {
  try {
    let event = req.body;

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else if (Buffer.isBuffer(req.body)) {
      event = JSON.parse(req.body.toString("utf8"));
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const booking = await PujaBooking.findOne({ stripePaymentIntentId: paymentIntent.id }).populate("puja temple user");
      if (booking) {
        booking.paymentStatus = "paid";
        booking.chargedAt = new Date();
        booking.notifications.push({
          type: "waitlist_confirmed",
          channel: "both",
          sentAt: new Date(),
          success: true
        });
        await booking.save();
        await sendWaitlistConfirmationEmail({
          to: booking.user.email,
          name: booking.user.name,
          ctaUrl: `divya://booking/${booking._id}`,
          booking: {
            bookingReference: booking.bookingReference,
            pujaName: booking.puja.name.en,
            devoteeName: booking.devoteeName,
            nakshatra: booking.nakshatra,
            prayerIntention: booking.prayerIntention,
            presentedAmount: booking.presentedAmount,
            presentedCurrency: booking.presentedCurrency,
            estimatedWaitWeeks: booking.puja.estimatedWaitWeeks,
            heroImage: booking.temple.heroImage
          }
        });

        if (booking.giftDetails?.isGift && booking.giftDetails?.recipientEmail) {
          await sendGiftReceivedEmail({
            to: booking.giftDetails.recipientEmail,
            recipientName: booking.giftDetails.recipientName,
            giftedByName: booking.user.name,
            pujaName: booking.puja.name.en,
            templeImage: booking.temple.heroImage,
            personalMessage: booking.giftDetails.personalMessage,
            ctaUrl: `divya://booking/${booking._id}`
          });

          const recipient = await User.findOne({
            email: booking.giftDetails.recipientEmail.toLowerCase().trim()
          });
          if (recipient && !recipient.giftsReceived.some((id) => id.toString() === booking._id.toString())) {
            recipient.giftsReceived.push(booking._id);
            await recipient.save();
          }

          booking.giftDetails.notificationSent = true;
          booking.giftDetails.notificationSentAt = new Date();
          await booking.save();
        }
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription") {
        await syncUserSubscriptionFromCheckoutSession(session);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncUserSubscriptionFromStripeSubscription(event.data.object);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const booking = await PujaBooking.findOne({ stripePaymentIntentId: paymentIntent.id }).populate("puja temple user");
      if (booking) {
        booking.paymentStatus = "failed";
        booking.notifications.push({
          type: "payment_failed",
          channel: "both",
          sentAt: new Date(),
          success: true
        });
        await booking.save();
        await sendPaymentFailedEmail({
          to: booking.user.email,
          ctaUrl: `divya://booking/${booking._id}`,
          booking: {
            pujaName: booking.puja.name.en,
            heroImage: booking.temple.heroImage
          }
        });
      }
    }

    if (event.type === "charge.refunded") {
      const paymentIntentId = event.data.object.payment_intent;
      const booking = await PujaBooking.findOne({ stripePaymentIntentId: paymentIntentId });
      if (booking) {
        booking.paymentStatus = "refunded";
        booking.status = "cancelled";
        await booking.save();
      }
    }

    return res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
