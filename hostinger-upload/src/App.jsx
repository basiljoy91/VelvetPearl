import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import RouteSeo from './components/RouteSeo';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const CabBooking = lazy(() => import('./pages/CabBooking'));
const TourBooking = lazy(() => import('./pages/TourBooking'));
const RoomBooking = lazy(() => import('./pages/RoomBooking'));
const EventBooking = lazy(() => import('./pages/EventBooking'));
const Services = lazy(() => import('./pages/Services'));
const RoutesPage = lazy(() => import('./pages/Routes'));
const Contact = lazy(() => import('./pages/Contact'));
const PackageDetail = lazy(() => import('./pages/PackageDetail'));
const FeedbackPage = lazy(() => import('./pages/Feedback'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function AppShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-on-surface-variant">
      Loading page...
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <RouteSeo />

      <Suspense fallback={<AppShellFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="packages/:slug" element={<PackageDetail />} />
            <Route path="book/cab" element={<CabBooking />} />
            <Route path="book/tour" element={<TourBooking />} />
            <Route path="book/room" element={<RoomBooking />} />
            <Route path="book/event" element={<EventBooking />} />
          </Route>

          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
