import React, { useState, useEffect } from 'react';
import { getUserStats, getAllUsers, getUserProfile, getUserBookings } from '../../services/dataService';

export default function UserProfileTab({ searchQuery = '' }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getUserStats(),
        getAllUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    try {
      const profileData = await getUserProfile(user.phone_number);
      setUserProfile(profileData);
      setSelectedBookingType(null);
    } catch (error) {
      console.error('Error fetching user profile', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBookingTypeClick = async (type) => {
    setSelectedBookingType(type);
    setLoadingDetails(true);
    try {
      const bookingsData = await getUserBookings(selectedUser.phone_number, type);
      setUserBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching user bookings', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (u.customer_name && u.customer_name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phone_number && u.phone_number.toLowerCase().includes(query))
    );
    if (!matchesSearch) return false;

    if (!selectedFilter || selectedFilter === 'total') return true;
    if (selectedFilter === 'cab') return Number(u.cab_bookings) > 0;
    if (selectedFilter === 'room') return Number(u.room_bookings) > 0;
    if (selectedFilter === 'tour') return Number(u.tour_bookings) > 0;
    if (selectedFilter === 'event') return Number(u.event_bookings) > 0;
    
    return true;
  });

  const renderLocationDetails = (booking) => {
    try {
      const details = booking.service_details_json || {};
      const type = booking.enquiry_type;
      
      if (type === 'cab') {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="truncate max-w-[150px]" title={details.pickup}>P: {details.pickup || 'N/A'}</span>
            <span className="truncate max-w-[150px]" title={details.drop}>D: {details.drop || 'N/A'}</span>
          </div>
        );
      }
      if (type === 'tour') {
        return (
          <div className="flex flex-col gap-0.5">
            {details.pickup && <span className="truncate max-w-[150px]" title={details.pickup}>P: {details.pickup}</span>}
            <span className="truncate max-w-[150px]" title={details.destination}>D: {details.destination || 'N/A'}</span>
          </div>
        );
      }
      if (type === 'room') {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="truncate max-w-[150px]" title={details.hotelName}>H: {details.hotelName || 'N/A'}</span>
            {details.location && <span className="truncate max-w-[150px]" title={details.location}>L: {details.location}</span>}
          </div>
        );
      }
      if (type === 'custom' || type === 'event') {
        return (
          <span className="truncate max-w-[150px]" title={details.destination || details.venue}>
            {details.destination || details.venue || 'N/A'}
          </span>
        );
      }
      return <span className="text-gray-500">-</span>;
    } catch (e) {
      return <span className="text-gray-500">-</span>;
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setSelectedUser(null);
            setUserProfile(null);
            setSelectedBookingType(null);
          }}
          className="flex items-center gap-2 text-sm font-medium text-[#EFBF04] hover:text-[#EFBF04]/80 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Users List
        </button>

        {loadingDetails && !userProfile ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#EFBF04]" />
          </div>
        ) : userProfile && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFBF04]/10 text-2xl font-bold text-[#EFBF04]">
                  {userProfile.customer_name ? userProfile.customer_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userProfile.customer_name || 'Unknown'}</h2>
                  <p className="text-gray-400">{userProfile.email || 'No email provided'}</p>
                  <p className="text-gray-400">{userProfile.phone_number}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500">Total Bookings</p>
                  <p className="text-xl font-bold text-white">{userProfile.total_bookings}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500">First Interaction</p>
                  <p className="text-sm font-medium text-white">{new Date(userProfile.registration_date).toLocaleDateString()}</p>
                </div>
                {userProfile.last_interaction_date && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-500">Last Interaction</p>
                    <p className="text-sm font-medium text-white">{new Date(userProfile.last_interaction_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xl font-semibold text-white">Booking Summary</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { key: 'cab', label: 'Cab Bookings', count: userProfile.cab_bookings, icon: 'local_taxi' },
                  { key: 'room', label: 'Room Bookings', count: userProfile.room_bookings, icon: 'hotel' },
                  { key: 'tour', label: 'Tour Bookings', count: userProfile.tour_bookings, icon: 'tour' },
                  { key: 'event', label: 'Event Bookings', count: userProfile.event_bookings, icon: 'event' }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => handleBookingTypeClick(type.key)}
                    className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                      selectedBookingType === type.key
                        ? 'border-[#EFBF04] bg-[#EFBF04]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-2 text-[#EFBF04]">{type.icon}</span>
                    <span className="text-2xl font-bold text-white">{type.count || 0}</span>
                    <span className="text-sm text-gray-400">{type.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {selectedBookingType && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-xl font-semibold text-white capitalize">{selectedBookingType} History</h3>
                {loadingDetails ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-[#EFBF04]" />
                  </div>
                ) : userBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bookings found for this category.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/5 text-xs uppercase text-gray-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Reference</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-white/5">
                            <td className="px-4 py-4">{new Date(booking.submitted_at).toLocaleDateString()}</td>
                            <td className="px-4 py-4 font-mono text-xs text-[#EFBF04]">{booking.reference_id}</td>
                            <td className="px-4 py-4 text-xs">{renderLocationDetails(booking)}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{booking.status}</span>
                            </td>
                            <td className="px-4 py-4 font-medium">{booking.quote_amount ? `₹${booking.quote_amount}` : 'Pending'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-white">Platform Statistics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {loading && !stats ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          )) : stats && [
            { id: 'total', label: 'Total Users', count: stats.total_users, icon: 'group', unit: 'Users' },
            { id: 'cab', label: 'Cab Booked Users', count: stats.cab_bookings, icon: 'local_taxi', unit: 'Cabs' },
            { id: 'room', label: 'Room Booked Users', count: stats.room_bookings, icon: 'hotel', unit: 'Rooms' },
            { id: 'tour', label: 'Tour Booked Users', count: stats.tour_bookings, icon: 'tour', unit: 'Tours' },
            { id: 'event', label: 'Event Booked Users', count: stats.event_bookings, icon: 'event', unit: 'Events' },
          ].map((card) => {
            const isActive = selectedFilter === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setSelectedFilter(prev => prev === card.id ? null : card.id)}
                className={`flex flex-col rounded-2xl border p-5 text-left shadow-lg transition-transform hover:-translate-y-1 ${
                  isActive
                    ? 'border-[#EFBF04] bg-[#EFBF04]/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <h3 className="text-sm font-medium text-gray-400">{card.label}</h3>
                <p className="mt-2 text-3xl font-bold text-white">{card.count}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#EFBF04]">
                  <span className="material-symbols-outlined text-sm">{card.icon}</span> {card.unit}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Registered Users</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && users.length === 0 ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[28px] border border-white/10 bg-white/5 animate-pulse" />
          )) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No users found matching your search.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <article
                key={user.phone_number}
                onClick={() => handleUserClick(user)}
                className="group cursor-pointer rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl transition-all hover:bg-white/10 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFBF04]/10 text-lg font-bold text-[#EFBF04]">
                    {user.customer_name ? user.customer_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  {Number(user.total_bookings) > 5 && (
                    <span className="whitespace-nowrap translate-x-3 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400">
                      Active Customer
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="truncate font-bold text-white" title={user.customer_name}>{user.customer_name || 'Unknown'}</h3>
                  <p className="mt-1 truncate text-sm text-gray-400" title={user.email}>{user.email || 'No email'}</p>
                  <p className="truncate text-sm text-gray-400">{user.phone_number}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-gray-500">Total Bookings</span>
                  <span className="font-bold text-white">{user.total_bookings}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
