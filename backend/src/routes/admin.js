import { Router } from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  assignDate,
  cancelAdminBooking,
  getBookingById,
  getAnalytics,
  getContactRequests,
  getBookings,
  getDashboard,
  getPrayerCorrections,
  markCompleted,
  markInProgress,
  reviewPrayerCorrection,
  uploadBookingVideo
} from "../controllers/adminController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }
});

router.use(auth, adminOnly);
router.get("/dashboard", getDashboard);
router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.get("/contact-requests", getContactRequests);
router.get("/analytics", getAnalytics);
router.get("/prayer-corrections", getPrayerCorrections);
router.put("/bookings/:id/assign-date", assignDate);
router.put("/bookings/:id/mark-in-progress", markInProgress);
router.put("/bookings/:id/mark-completed", markCompleted);
router.post("/bookings/:id/upload-video", upload.single("video"), uploadBookingVideo);
router.put("/bookings/:id/cancel", cancelAdminBooking);
router.put("/prayer-corrections/:correctionId/review", reviewPrayerCorrection);

export default router;
