import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import MobileNav from '../components/navigation/MobileNav';
import Footer from '../components/footer/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import BookingModal from '../components/navigation/BookingModal';

export default function MainLayout() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => setIsBookingModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-white">
      <Navbar onBookClick={openBookingModal} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <MobileNav onBookClick={openBookingModal} />
      <ChatWidget />
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={closeBookingModal} 
      />
    </div>
  );
}
