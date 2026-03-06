import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  cancelBooking,
  createBooking,
  createGiftBooking,
  getBookingById,
  getBookings,
  getGiftBookingsReceived,
  getGiftBookingsSent,
  suggestGothram,
  getVideo,
  markVideoWatched,
  streamSharedVideo,
  streamVideo
} from "../controllers/bookingController.js";

const router = Router();
const bookingCreateLimiter = createRateLimiter({ key: "booking-create", windowMs: 60_000, max: 10 });
const bookingReadLimiter = createRateLimiter({ key: "booking-read", windowMs: 60_000, max: 120 });

router.get("/shared/:token", streamSharedVideo);
router.use(auth);
router.post("/", bookingCreateLimiter, createBooking);
router.post("/gift", bookingCreateLimiter, createGiftBooking);
router.post("/gothram-suggest", bookingCreateLimiter, suggestGothram);
router.get("/", bookingReadLimiter, getBookings);
router.get("/gifts-sent", bookingReadLimiter, getGiftBookingsSent);
router.get("/gifts-received", bookingReadLimiter, getGiftBookingsReceived);
router.get("/:id", bookingReadLimiter, getBookingById);
router.delete("/:id", bookingCreateLimiter, cancelBooking);
router.get("/:id/video", bookingReadLimiter, getVideo);
router.get("/:id/video/stream", bookingReadLimiter, streamVideo);
router.post("/:id/video/watched", bookingReadLimiter, markVideoWatched);

export default router;
