import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import MobileNav from '../components/navigation/MobileNav';
import Footer from '../components/footer/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import FloatingWhatsAppButton from '../components/chat/FloatingWhatsAppButton';
import BookingModal from '../components/navigation/BookingModal';

export default function MainLayout() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [hasPrefetchedBookingRoutes, setHasPrefetchedBookingRoutes] = useState(false);

  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => setIsBookingModalOpen(false);

  useEffect(() => {
    if (!isBookingModalOpen || hasPrefetchedBookingRoutes) return;

    setHasPrefetchedBookingRoutes(true);

    void Promise.allSettled([
      import('../pages/CabBooking'),
      import('../pages/RoomBooking'),
      import('../pages/TourBooking'),
      import('../pages/EventBooking'),
    ]);
  }, [hasPrefetchedBookingRoutes, isBookingModalOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-white">
      <Navbar onBookClick={openBookingModal} />
      <div className="flex-1 pb-28 md:pb-0">
        <Outlet />
      </div>
      <Footer />
      <MobileNav />
      <FloatingWhatsAppButton />
      <ChatWidget />
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={closeBookingModal} 
      />
    </div>
  );
}
