import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import PrayersPage from "@/pages/PrayersPage";
import PrayerDetailPage from "@/pages/PrayerDetailPage";
import TemplePage from "@/pages/TemplePage";
import PujasPage from "@/pages/PujasPage";
import PujaDetailPage from "@/pages/PujaDetailPage";
import CalendarPage from "@/pages/CalendarPage";
import DeityDetailPage from "@/pages/DeityDetailPage";
import LearningPathPage from "@/pages/LearningPathPage";
import LearningModulePage from "@/pages/LearningModulePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";
import BookingsPage from "@/pages/BookingsPage";
import BookingDetailPage from "@/pages/BookingDetailPage";
import VideoPage from "@/pages/VideoPage";
import ProfilePage from "@/pages/ProfilePage";
import ContactPage from "@/pages/ContactPage";
import ContactUsPage from "@/pages/ContactUsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import SitemapPage from "@/pages/SitemapPage";
import SharedPrayerCreatePage from "@/pages/SharedPrayerCreatePage";
import SharedPrayerPage from "@/pages/SharedPrayerPage";

function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-state">Restoring your session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/prayers" element={<PrayersPage />} />
        <Route path="/prayers/:slug" element={<PrayerDetailPage />} />
        <Route path="/temple" element={<TemplePage />} />
        <Route path="/pujas" element={<PujasPage />} />
        <Route path="/pujas/:id" element={<PujaDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/deities/:id" element={<DeityDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/videos/:bookingId" element={<VideoPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/deities/:id/learn" element={<LearningPathPage />} />
          <Route path="/deities/:id/learn/:moduleId" element={<LearningModulePage />} />
          <Route path="/shared-prayer/create" element={<SharedPrayerCreatePage />} />
          <Route path="/shared-prayer/:sessionCode" element={<SharedPrayerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppShell>
  );
}
