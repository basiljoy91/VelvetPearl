import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addBooking,
  addDriver,
  addFleet,
  assignDriverToBooking,
  deleteBookingRecord,
  getAnalytics,
  getBookings,
  getDrivers,
  getFleet,
  updateBookingStatus,
} from '../services/dataService';
import AdminForms from '../components/admin/AdminForms';
import {
  changePassword,
  generateAdminSetupKey,
  getAdminProfile,
  logoutAdmin,
} from '../services/authService';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Confirmed':
    case 'Available':
    case 'Active':
    case 'Verified':
    case 'Valid':
      return 'bg-emerald-500/15 text-emerald-400';
    case 'Pending':
    case 'Expiring Soon':
      return 'bg-amber-500/15 text-amber-400';
    case 'On Trip':
      return 'bg-blue-500/15 text-blue-400';
    case 'Expired':
    case 'Unavailable':
      return 'bg-rose-500/15 text-rose-400';
    default:
      return 'bg-white/10 text-gray-300';
  }
};

const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(parsed)) return value;
  return `₹${parsed.toLocaleString('en-IN')}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [setupKeyData, setSetupKeyData] = useState(null);
  const [isSetupKeyLoading, setIsSetupKeyLoading] = useState(false);
  const [assigningBookingId, setAssigningBookingId] = useState('');
  const [driverSelections, setDriverSelections] = useState({});

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  const refreshOperationalData = async () => {
    const [nextBookings, nextFleet, nextDrivers, nextAnalytics] = await Promise.all([
      getBookings(),
      getFleet(),
      getDrivers(),
      getAnalytics(),
    ]);

    setBookings(nextBookings);
    setFleet(nextFleet);
    setDrivers(nextDrivers);
    setAnalytics(nextAnalytics);
    setDriverSelections((current) => {
      const nextSelections = { ...current };
      nextBookings.forEach((booking) => {
        if (booking.driver_id) {
          nextSelections[booking.id] = booking.driver_id;
        }
      });
      return nextSelections;
    });
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setIsLoading(true);
      setDashboardError('');
      try {
        const [nextBookings, nextFleet, nextDrivers, nextAnalytics] = await Promise.all([
          getBookings(),
          getFleet(),
          getDrivers(),
          getAnalytics(),
        ]);

        if (ignore) return;

        setBookings(nextBookings);
        setFleet(nextFleet);
        setDrivers(nextDrivers);
        setAnalytics(nextAnalytics);
        setDriverSelections((current) => {
          const nextSelections = { ...current };
          nextBookings.forEach((booking) => {
            if (booking.driver_id) {
              nextSelections[booking.id] = booking.driver_id;
            }
          });
          return nextSelections;
        });
      } catch (error) {
        if (!ignore) {
          setDashboardError(error.message || 'Failed to load admin dashboard data.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  useEffect(() => {
    let ignore = false;

    const loadAdminProfile = async () => {
      try {
        const profile = await getAdminProfile();
        if (!ignore) {
          setAdminProfile(profile);
        }
      } catch {
        if (!ignore) {
          setAdminProfile(null);
        }
      }
    };

    loadAdminProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddEntry = async (newEntry) => {
    setDashboardError('');

    try {
      if (activeTab === 'bookings') {
        await addBooking(newEntry);
      }
      if (activeTab === 'fleet') {
        await addFleet(newEntry);
      }
      if (activeTab === 'drivers') {
        await addDriver(newEntry);
      }

      await refreshOperationalData();
    } catch (error) {
      setDashboardError(error.message || `Failed to add ${activeTab} entry.`);
    }
  };

  const deleteBooking = async (id) => {
    setDashboardError('');
    try {
      await deleteBookingRecord(id);
      await refreshOperationalData();
    } catch (error) {
      setDashboardError(error.message || 'Failed to delete booking.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    setDashboardError('');
    try {
      await updateBookingStatus(id, newStatus);
      await refreshOperationalData();
    } catch (error) {
      setDashboardError(error.message || 'Failed to update booking status.');
    }
  };

  const handleAssignDriver = async (bookingId) => {
    const driverId = driverSelections[bookingId];
    const driver = drivers.find((item) => item.id === driverId);
    if (!driver) return;

    setDashboardError('');
    setAssigningBookingId(bookingId);

    try {
      await assignDriverToBooking(bookingId, {
        driver_id: driver.id,
        driver_name: driver.name,
      });
      await refreshOperationalData();
    } catch (error) {
      setDashboardError(error.message || 'Failed to assign driver.');
    } finally {
      setAssigningBookingId('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');
    setIsPwdLoading(true);

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setPwdMessage('Password updated successfully. You can use it on your next login.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPwdError(error.message || 'Failed to update password');
    } finally {
      setIsPwdLoading(false);
    }
  };

  const handleGenerateSetupKey = async () => {
    setDashboardError('');
    setIsSetupKeyLoading(true);

    try {
      const result = await generateAdminSetupKey();
      setSetupKeyData(result);
    } catch (error) {
      setDashboardError(error.message || 'Failed to generate setup key.');
    } finally {
      setIsSetupKeyLoading(false);
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredBookings = useMemo(() => {
    if (!normalizedSearch) return bookings;
    return bookings.filter((booking) =>
      [
        booking.id,
        booking.customer,
        booking.phone,
        booking.service,
        booking.details,
        booking.driver_name,
        booking.status,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
    );
  }, [bookings, normalizedSearch]);

  const filteredFleet = useMemo(() => {
    if (!normalizedSearch) return fleet;
    return fleet.filter((vehicle) =>
      [
        vehicle.model,
        vehicle.plate,
        vehicle.type,
        vehicle.status,
        vehicle.insurance_status,
        vehicle.insurance_provider,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
    );
  }, [fleet, normalizedSearch]);

  const filteredDrivers = useMemo(() => {
    if (!normalizedSearch) return drivers;
    return drivers.filter((driver) =>
      [
        driver.name,
        driver.phone,
        driver.status,
        driver.licence_status,
        driver.assigned_vehicle,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
    );
  }, [drivers, normalizedSearch]);

  const bookingsNeedingDrivers = bookings.filter((booking) => !booking.driver_id).length;
  const insuranceAlerts = fleet.filter((vehicle) => ['Expired', 'Expiring Soon'].includes(vehicle.insurance_status)).length;
  const activeDrivers = drivers.filter((driver) => driver.status === 'Active').length;
  const utilizationValue = analytics ? Number(analytics.utilization || 0) : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month', active: true },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin', active: true },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', active: true },
    { id: 'settings', label: 'Settings', icon: 'settings', active: true },
    { id: 'routes', label: 'Routes', icon: 'map', active: false },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', active: false },
    { id: 'reports', label: 'Reports', icon: 'assessment', active: false },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-on-surface font-body overflow-hidden">
      <aside className="w-72 bg-[#0F0F0F] border-r border-white/5 flex flex-col z-50">
        <div className="px-8 py-10 cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-xl font-headline font-bold text-[#EFBF04] tracking-tight">Velvet Pearl</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-500">Premium Travel Admin</p>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${adminProfile?.isMainAdmin ? 'bg-[#EFBF04]/15 text-[#EFBF04]' : 'bg-white/10 text-gray-300'}`}>
              {adminProfile?.isMainAdmin ? 'Main Admin' : 'Admin'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => item.active && setActiveTab(item.id)}
              disabled={!item.active}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border-none outline-none ${
                !item.active
                  ? 'opacity-50 cursor-not-allowed text-gray-500'
                  : activeTab === item.id
                    ? 'bg-[#EFBF04]/10 text-[#EFBF04] border-l-4 border-[#EFBF04]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {!item.active && (
                <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Soon</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition" onClick={handleLogout}>
            <div className="w-10 h-10 rounded-lg bg-[#EFBF04]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#EFBF04]">person</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin Panel</p>
              <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Logout</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#050505] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EFBF04]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

        <header className="flex justify-between items-center px-10 py-8 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-headline font-light tracking-tighter text-white capitalize">{activeTab} Center</h2>
            <p className="text-gray-500 text-sm mt-1">
              Operational Overview • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 focus-within:border-[#EFBF04]/40 transition-colors">
              <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-600 w-48 outline-none text-white"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <button
              type="button"
              onClick={() => ['bookings', 'fleet', 'drivers'].includes(activeTab) && setIsEntryModalOpen(true)}
              disabled={!['bookings', 'fleet', 'drivers'].includes(activeTab)}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border-none ${
                ['bookings', 'fleet', 'drivers'].includes(activeTab)
                  ? 'bg-[#EFBF04] text-black hover:scale-95 cursor-pointer'
                  : 'bg-white/5 text-gray-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              New Entry
            </button>
          </div>
        </header>

        <div className="px-10 pb-12 pt-8 space-y-8">
          {dashboardError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined text-lg mt-0.5">error</span>
              <div>
                <p className="font-semibold">Dashboard attention needed</p>
                <p className="text-sm text-rose-200/80">{dashboardError}</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
                {[
                  { label: "Today's Bookings", value: analytics?.todayBookings ?? '-', icon: 'event_available', accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Active Drivers', value: analytics?.activeDrivers ?? activeDrivers, icon: 'person_celebrate', accent: 'text-[#EFBF04]', bg: 'bg-[#EFBF04]/10' },
                  { label: 'Fleet Utilization', value: utilizationValue !== null ? `${utilizationValue.toFixed(1)}%` : '-', icon: 'speed', accent: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Pending Payments', value: analytics ? formatCurrency(analytics.pendingPayments) : '-', icon: 'account_balance_wallet', accent: 'text-rose-400', bg: 'bg-rose-500/10' },
                  { label: 'Driver Assignment Queue', value: bookingsNeedingDrivers, icon: 'assignment_ind', accent: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Insurance Alerts', value: insuranceAlerts, icon: 'verified_user', accent: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                ].map((card) => (
                  <div key={card.label} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl group hover:border-[#EFBF04]/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined p-2 rounded-lg ${card.bg} ${card.accent}`}>{card.icon}</span>
                      {isLoading && <span className="text-[10px] font-label text-gray-500">Syncing...</span>}
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-label">{card.label}</p>
                    <h3 className="text-3xl font-headline font-bold text-white mt-1 group-hover:text-[#EFBF04] transition-colors">{card.value}</h3>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
                <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                      <h4 className="text-xl font-headline font-semibold text-white">Recent Requests</h4>
                      <p className="text-xs text-gray-500 mt-1">Latest booking flow with driver visibility and payout context.</p>
                    </div>
                    <button type="button" onClick={() => setActiveTab('bookings')} className="text-[#EFBF04] text-xs font-bold uppercase tracking-widest hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/30 text-gray-500 text-[10px] uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-4">Ref</th>
                          <th className="px-4 py-4">Customer</th>
                          <th className="px-4 py-4">Driver</th>
                          <th className="px-4 py-4">Amount</th>
                          <th className="px-4 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {bookings.slice(0, 4).map((booking) => (
                          <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6 text-[#EFBF04] font-mono text-xs">{booking.id}</td>
                            <td className="px-4 py-6">
                              <div className="font-semibold text-white">{booking.customer}</div>
                              <div className="text-[10px] text-gray-500">{booking.phone}</div>
                            </td>
                            <td className="px-4 py-6">
                              <div className="text-white">{booking.driver_name || 'Unassigned'}</div>
                              <div className="text-[10px] text-gray-500">{booking.driver_id || 'Needs assignment'}</div>
                            </td>
                            <td className="px-4 py-6 text-gray-300">{formatCurrency(booking.amount)}</td>
                            <td className="px-4 py-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="bg-white/5 rounded-3xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                        <span className="material-symbols-outlined">assignment_ind</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-headline text-white">Assignment Watch</h4>
                        <p className="text-xs text-gray-500">Bookings still waiting for drivers.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {bookings.filter((booking) => !booking.driver_id).slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between gap-4 bg-black/20 rounded-2xl px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-semibold">{booking.customer}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{booking.service} • {formatDate(booking.schedule)}</p>
                          </div>
                          <button type="button" onClick={() => setActiveTab('bookings')} className="text-[#EFBF04] text-xs font-bold uppercase tracking-widest">
                            Assign
                          </button>
                        </div>
                      ))}
                      {!bookings.some((booking) => !booking.driver_id) && (
                        <p className="text-sm text-emerald-400">All visible bookings have driver assignments.</p>
                      )}
                    </div>
                  </section>

                  <section className="bg-white/5 rounded-3xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                        <span className="material-symbols-outlined">verified_user</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-headline text-white">Insurance Status</h4>
                        <p className="text-xs text-gray-500">Fleet records with expiring or expired insurance.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {fleet.filter((vehicle) => ['Expired', 'Expiring Soon'].includes(vehicle.insurance_status)).slice(0, 3).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between gap-4 bg-black/20 rounded-2xl px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-semibold">{vehicle.model}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{vehicle.plate} • {formatDate(vehicle.insurance_expiry)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(vehicle.insurance_status)}`}>
                            {vehicle.insurance_status}
                          </span>
                        </div>
                      ))}
                      {!fleet.some((vehicle) => ['Expired', 'Expiring Soon'].includes(vehicle.insurance_status)) && (
                        <p className="text-sm text-emerald-400">No immediate fleet insurance alerts.</p>
                      )}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'bookings' && (
            <section className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-black/40 text-gray-500 text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Ref</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Service</th>
                      <th className="px-4 py-4">Schedule</th>
                      <th className="px-4 py-4">Driver</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-white">
                    {filteredBookings.map((booking) => {
                      const selectedDriverId = driverSelections[booking.id] || booking.driver_id || '';
                      return (
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors group align-top">
                          <td className="px-8 py-6 text-[#EFBF04] font-mono text-xs">{booking.id}</td>
                          <td className="px-4 py-6">
                            <div className="font-semibold">{booking.customer}</div>
                            <div className="text-[10px] text-gray-500">{booking.phone}</div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="text-white font-medium">{booking.service}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{booking.details}</div>
                            <div className="text-[10px] text-gray-500 mt-1">Amount: {formatCurrency(booking.amount)}</div>
                          </td>
                          <td className="px-4 py-6 text-xs text-gray-300">{formatDate(booking.schedule)}</td>
                          <td className="px-4 py-6 min-w-[240px]">
                            <div className="space-y-2">
                              <div className="text-xs text-gray-300">
                                {booking.driver_name ? `${booking.driver_name} (${booking.driver_id})` : 'No driver assigned'}
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={selectedDriverId}
                                  onChange={(e) => setDriverSelections((current) => ({ ...current, [booking.id]: e.target.value }))}
                                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#EFBF04]/40"
                                >
                                  <option value="" className="bg-[#0F0F0F]">Select driver</option>
                                  {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id} className="bg-[#0F0F0F]">
                                      {driver.name} ({driver.id})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleAssignDriver(booking.id)}
                                  disabled={!selectedDriverId || assigningBookingId === booking.id}
                                  className="px-3 py-2 rounded-lg bg-blue-500/15 text-blue-300 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                                >
                                  {assigningBookingId === booking.id ? 'Saving' : booking.driver_id ? 'Reassign' : 'Assign'}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => updateStatus(booking.id, 'Confirmed')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors border-none">
                                <span className="material-symbols-outlined text-sm">check</span>
                              </button>
                              <button type="button" onClick={() => deleteBooking(booking.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-black transition-colors border-none">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'fleet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFleet.map((vehicle) => (
                <div key={vehicle.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#EFBF04]/40 transition-all group">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div className="p-3 bg-[#EFBF04]/10 text-[#EFBF04] rounded-xl">
                      <span className="material-symbols-outlined text-3xl">directions_car</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(vehicle.status)}`}>{vehicle.status}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(vehicle.insurance_status)}`}>{vehicle.insurance_status || 'Unknown'}</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">{vehicle.model}</h4>
                  <p className="text-[#EFBF04] font-mono text-xs uppercase tracking-widest">{vehicle.plate}</p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-300">
                    <div className="bg-black/20 rounded-xl p-3">
                      <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Type</p>
                      <p>{vehicle.type || 'Not set'}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3">
                      <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Condition</p>
                      <p>{vehicle.condition || 'Unknown'}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3">
                      <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Fuel Status</p>
                      <p>{vehicle.fuel_status ?? 0}%</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3">
                      <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Next Service</p>
                      <p>{formatDate(vehicle.next_service)}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 space-y-2 text-xs text-gray-400">
                    <p><span className="text-gray-500">Last Service:</span> {formatDate(vehicle.lastservice || vehicle.lastService)}</p>
                    <p><span className="text-gray-500">Insurance:</span> {vehicle.insurance_provider || 'Not set'} {vehicle.insurance_policy ? `• ${vehicle.insurance_policy}` : ''}</p>
                    <p><span className="text-gray-500">Insurance Expiry:</span> {formatDate(vehicle.insurance_expiry)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start gap-6 group hover:border-[#EFBF04]/40 transition-all">
                  <div className="w-20 h-20 bg-[#EFBF04]/10 rounded-full flex items-center justify-center border-2 border-[#EFBF04]/20 shrink-0">
                    <span className="material-symbols-outlined text-4xl text-[#EFBF04]">person</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-white">{driver.name}</h4>
                        <p className="text-gray-400 text-sm">{driver.phone}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[#EFBF04]">
                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                        <span className="text-xs font-bold">{driver.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(driver.status)}`}>{driver.status}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(driver.licence_status)}`}>{driver.licence_status || 'Pending'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                      <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Experience</p>
                        <p>{driver.experience || 'New'}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Total Rides</p>
                        <p>{driver.total_rides ?? 0}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 col-span-2">
                        <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Assigned Vehicle</p>
                        <p>{driver.assigned_vehicle || 'Not assigned'}</p>
                      </div>
                      {driver.address && (
                        <div className="bg-black/20 rounded-xl p-3 col-span-2">
                          <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Address</p>
                          <p>{driver.address}</p>
                        </div>
                      )}
                      {driver.notes && (
                        <div className="bg-black/20 rounded-xl p-3 col-span-2">
                          <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Notes</p>
                          <p>{driver.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <section className="bg-white/5 p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                      <span className="material-symbols-outlined text-2xl">security</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-white">Security & Authentication</h3>
                      <p className="text-gray-400 text-sm">Manage admin credentials and main-admin onboarding access.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {pwdError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {pwdError}
                    </div>
                  )}
                  {pwdMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {pwdMessage}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Current Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#EFBF04] transition-colors">
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                      </div>
                      <input
                        className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-[#EFBF04] transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none"
                        placeholder="Enter your current password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">New Password</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                          <span className="material-symbols-outlined text-sm">lock</span>
                        </div>
                        <input
                          className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-blue-400 transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none"
                          placeholder="New password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                          <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                        </div>
                        <input
                          className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-emerald-400 transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none"
                          placeholder="Confirm new password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                      disabled={isPwdLoading}
                      className="bg-[#EFBF04] text-black font-bold py-3 px-8 rounded-lg shadow-xl hover:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-none"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      {isPwdLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white/5 p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#EFBF04]/10 text-[#EFBF04] rounded-xl">
                      <span className="material-symbols-outlined text-2xl">vpn_key</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-white">Admin Onboarding Keys</h3>
                      <p className="text-gray-400 text-sm">Generate a one-time setup key to initialize another admin account.</p>
                    </div>
                  </div>
                </div>

                {adminProfile?.isMainAdmin ? (
                  <div className="space-y-6">
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <p className="text-sm text-gray-300">
                        Setup keys are single-use tokens with a 24 hour expiry. Share them only through a secure channel.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={handleGenerateSetupKey}
                        disabled={isSetupKeyLoading}
                        className="bg-[#EFBF04] text-black font-bold py-3 px-8 rounded-lg shadow-xl hover:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-none"
                      >
                        <span className="material-symbols-outlined text-sm">key</span>
                        {isSetupKeyLoading ? 'Generating...' : 'Generate Setup Key'}
                      </button>
                      <span className="text-xs text-gray-500 uppercase tracking-widest">
                        Main admin access confirmed
                      </span>
                    </div>

                    {setupKeyData?.setupKey && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Generated Setup Key</p>
                        <p className="text-2xl font-mono break-all text-white">{setupKeyData.setupKey}</p>
                        <p className="text-sm text-emerald-200/80">Expires: {formatDate(setupKeyData.expiresAt)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                    <p className="text-sm text-blue-200">
                      Setup key generation is restricted to the main admin account. You can still manage your password from this section.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <AdminForms
        type={activeTab}
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
