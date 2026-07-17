export const initialBookings = [
  {
    id: 'VP-2940',
    customer: 'Meera Krishnan',
    phone: '+91 99401 23456',
    service: 'Cab: Chennai ➔ Madurai',
    details: 'Toyota Alphard (VIP)',
    schedule: 'Aug 26, 2024 - 08:30 AM',
    status: 'Confirmed',
    amount: '₹12,500'
  },
  {
    id: 'VP-2941',
    customer: 'David Warner',
    phone: '+61 2 9876 5432',
    service: 'Tour: Royal Nilgiris',
    details: 'Premium Package (7 Days)',
    schedule: 'Aug 27, 2024 - 10:00 AM',
    status: 'Pending',
    amount: '₹85,000'
  },
  {
    id: 'VP-2942',
    customer: 'Sarah Jenkins',
    phone: '+44 7712 3456',
    service: 'Room: ITC Grand Chola',
    details: 'Suite (2 Guests)',
    schedule: 'Aug 29 - Sep 2 (4 Nights)',
    status: 'Confirmed',
    amount: '₹48,000'
  },
  {
    id: 'VP-2943',
    customer: 'Rahul Sharma',
    phone: '+91 98840 11223',
    service: 'Event: Wedding Planning',
    details: 'Full Venue Setup',
    schedule: 'Sep 15, 2024',
    status: 'Processing',
    amount: '₹2,50,000'
  }
];

export const initialFleet = [
  {
    id: 'FL-001',
    model: 'Toyota Alphard',
    plate: 'TN 01 VP 1234',
    type: 'VIP MPV',
    status: 'Available',
    lastService: 'July 10, 2024'
  },
  {
    id: 'FL-002',
    model: 'Mercedes V-Class',
    plate: 'TN 07 AH 0001',
    type: 'Luxury Van',
    status: 'On Trip',
    lastService: 'August 02, 2024'
  },
  {
    id: 'FL-003',
    model: 'BMW 7 Series',
    plate: 'TN 09 BX 9999',
    type: 'Executive Sedan',
    status: 'Maintenance',
    lastService: 'August 15, 2024'
  }
];

export const initialDrivers = [
  {
    id: 'DR-101',
    name: 'Muthu Kumar',
    phone: '+91 94450 12345',
    experience: '12 Years',
    status: 'Active',
    rating: '4.9'
  },
  {
    id: 'DR-102',
    name: 'Senthil Raj',
    phone: '+91 94450 67890',
    experience: '8 Years',
    status: 'On Leave',
    rating: '4.8'
  },
  {
    id: 'DR-103',
    name: 'Prakash Raj',
    phone: '+91 94450 11223',
    experience: '15 Years',
    status: 'Active',
    rating: '5.0'
  }
];

export const initialMessages = [
  {
    id: 'MSG-001',
    customer: 'Anjali Gupta',
    subject: 'Corporate Booking Inquiry',
    date: '2 Hours Ago',
    status: 'Unread'
  },
  {
    id: 'MSG-002',
    customer: 'James Wilson',
    subject: 'Refund Request #VP-2890',
    date: '5 Hours Ago',
    status: 'Read'
  }
];
