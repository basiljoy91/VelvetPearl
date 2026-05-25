import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import CabBooking from './pages/CabBooking';
import TourBooking from './pages/TourBooking';
import RoomBooking from './pages/RoomBooking';
import EventBooking from './pages/EventBooking';
import Services from './pages/Services';
import RoutesPage from './pages/Routes';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './guards/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="book/cab" element={<CabBooking />} />
          <Route path="book/tour" element={<TourBooking />} />
          <Route path="book/room" element={<RoomBooking />} />
          <Route path="book/event" element={<EventBooking />} />
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
