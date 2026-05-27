import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
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
=======
import { getBookings, getFleet, getDrivers, getAnalytics, addBooking, addFleet, addDriver, updateBookingStatus, deleteBookingRecord, updateDriverRecord, deleteDriverRecord, updateFleetRecord, deleteFleetRecord, assignDriverToBooking } from '../services/dataService';
import AdminForms from '../components/admin/AdminForms';
import BookingActionCell from '../components/admin/BookingActionCell';
import StatCard from '../components/admin/StatCard';
import DriverProfileModal from '../components/admin/DriverProfileModal';
import VehicleConditionModal from '../components/admin/VehicleConditionModal';
import { logoutAdmin, changePassword, verifyToken, generateSetupKey } from '../services/authService';
>>>>>>> feature/Admin-pannel-Sachin-update-004

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
<<<<<<< HEAD

=======
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetToEdit, setFleetToEdit] = useState(null);
  const [fleetToDelete, setFleetToDelete] = useState(null);
  const [driverToEdit, setDriverToEdit] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [assigningDriverBookingId, setAssigningDriverBookingId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  
  // Settings Form State
>>>>>>> feature/Admin-pannel-Sachin-update-004
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdLoading, setIsPwdLoading] = useState(false);

<<<<<<< HEAD
=======
  const [setupKey, setSetupKey] = useState('');
  const [setupKeyError, setSetupKeyError] = useState('');
  const [isSetupKeyLoading, setIsSetupKeyLoading] = useState(false);
  
  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };
  
  // Data States
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
<<<<<<< HEAD
    let ignore = false;
=======
    const loadAuth = async () => {
      const auth = await verifyToken();
      setIsMainAdmin(auth.isMainAdmin);
    };
    loadAuth();
>>>>>>> feature/Admin-pannel-Sachin-update-004

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
<<<<<<< HEAD
=======
    if (activeTab === 'fleet') {
      if (fleetToEdit) {
        await updateFleetRecord(newEntry.id, newEntry);
        setFleetToEdit(null);
      } else {
        await addFleet(newEntry);
      }
      const f = await getFleet();
      setFleet(f);
    }
    if (activeTab === 'drivers') {
      if (driverToEdit) {
        await updateDriverRecord(newEntry.id, newEntry);
        setDriverToEdit(null);
      } else {
        await addDriver(newEntry);
      }
      const d = await getDrivers();
      setDrivers(d);
    }
    const a = await getAnalytics();
    setAnalytics(a);
>>>>>>> feature/Admin-pannel-Sachin-update-004
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

<<<<<<< HEAD
=======
  const deleteFleetRecordById = async (id) => {
    setIsDeleting(true);
    try {
      await deleteFleetRecord(id);
      const f = await getFleet();
      setFleet(f);
      setAnalytics(await getAnalytics());
    } catch (err) {
      console.error('Failed to delete fleet', err);
    } finally {
      setIsDeleting(false);
      setFleetToDelete(null);
    }
  };

  const deleteDriver = async (id) => {
    setIsDeleting(true);
    try {
      await deleteDriverRecord(id);
      const d = await getDrivers();
      setDrivers(d);
      setAnalytics(await getAnalytics());
    } catch (err) {
      console.error('Failed to delete driver', err);
    } finally {
      setIsDeleting(false);
      setDriverToDelete(null);
    }
  };
>>>>>>> feature/Admin-pannel-Sachin-update-004
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

  const handleAssignDriver = async (bookingId) => {
    if (!selectedDriverId) return;
    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) return;
    setAssignError('');
    setAssignSuccess('');
    setAssigningDriverBookingId(bookingId);
    try {
      await assignDriverToBooking(bookingId, driver.id, driver.name);
      const b = await getBookings();
      setBookings(b);
      setAssignSuccess(`Driver "${driver.name}" assigned successfully!`);
      setSelectedDriverId('');
      setTimeout(() => {
        setExpandedBookingId(null);
        setAssignSuccess('');
      }, 2000);
    } catch (err) {
      setAssignError(err.message || 'Failed to assign driver.');
    } finally {
      setAssigningDriverBookingId(null);
    }
  };

  // Only Cab, Tour, and Travel bookings require a driver
  const requiresDriver = (service = '') => {
    const s = service.toLowerCase();
    return s.startsWith('cab') || s.startsWith('tour') || s.startsWith('travel');
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
<<<<<<< HEAD
    setDashboardError('');
    setIsSetupKeyLoading(true);

    try {
      const result = await generateAdminSetupKey();
      setSetupKeyData(result);
    } catch (error) {
      setDashboardError(error.message || 'Failed to generate setup key.');
=======
    setIsSetupKeyLoading(true);
    setSetupKeyError('');
    setSetupKey('');
    try {
      const res = await generateSetupKey();
      if (res.success) {
        setSetupKey(res.setupKey);
      } else {
        setSetupKeyError(res.message);
      }
    } catch (err) {
      setSetupKeyError(err.message || 'Failed to generate key');
>>>>>>> feature/Admin-pannel-Sachin-update-004
    } finally {
      setIsSetupKeyLoading(false);
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> feature/Admin-pannel-Sachin-update-004
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month', active: true },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin', active: true },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', active: true },
    { id: 'settings', label: 'Settings', icon: 'settings', active: true },
    { id: 'routes', label: 'Routes', icon: 'map', active: false },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', active: false },
    { id: 'reports', label: 'Reports', icon: 'assessment', active: false },
<<<<<<< HEAD
=======
    ...(isMainAdmin ? [{ id: 'settings', label: 'Settings', icon: 'settings', active: true }] : []),
>>>>>>> feature/Admin-pannel-Sachin-update-004
  ];

  return (
    <div className="flex h-screen w-full bg-background text-on-surface font-body overflow-hidden">
<<<<<<< HEAD
      <aside className="w-72 bg-[#0F0F0F] border-r border-white/5 flex flex-col z-50">
=======
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Side Navigation Bar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0F0F0F] border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
>>>>>>> feature/Admin-pannel-Sachin-update-004
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

<<<<<<< HEAD
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
=======
        {/* Top App Bar */}
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 px-6 md:px-10 py-6 md:py-8 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-light tracking-tighter text-white capitalize">{activeTab} Center</h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Operational Overview • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {activeTab !== 'dashboard' && (
              <div className="flex flex-1 items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 focus-within:border-[#EFBF04]/40 transition-colors w-full sm:w-auto">
                <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-600 w-full sm:w-48 outline-none text-white" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                />
              </div>
            )}
            <button 
              onClick={() => {
                if (['bookings', 'fleet', 'drivers'].includes(activeTab)) {
                  setIsEntryModalOpen(true);
                }
              }}
>>>>>>> feature/Admin-pannel-Sachin-update-004
              disabled={!['bookings', 'fleet', 'drivers'].includes(activeTab)}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border-none w-full sm:w-auto ${
                ['bookings', 'fleet', 'drivers'].includes(activeTab)
                  ? 'bg-[#EFBF04] text-black hover:scale-95 cursor-pointer'
                  : 'bg-white/5 text-gray-500 opacity-50 cursor-not-allowed hidden sm:flex'
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
<<<<<<< HEAD
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
=======
              {/* Stats Bento Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Today's Bookings", val: analytics?.todayBookings ?? "-", icon: "event_available", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10" },
                  { label: "Active Drivers", val: analytics?.activeDrivers ?? "-", icon: "person_celebrate", colorClass: "text-[#EFBF04]", bgClass: "bg-[#EFBF04]/10" },
                  { label: "Utilization", val: analytics ? `${analytics.utilization.toFixed(1)}%` : "-", icon: "speed", colorClass: "text-blue-400", bgClass: "bg-blue-500/10" },
                  { label: "Pending Payments", val: analytics ? `₹${analytics.pendingPayments}` : "-", icon: "account_balance_wallet", colorClass: "text-rose-400", bgClass: "bg-rose-500/10" }
                ].map((stat, i) => (
                  <StatCard
                    key={i}
                    label={stat.label}
                    value={stat.val}
                    icon={stat.icon}
                    colorClass={stat.colorClass}
                    bgClass={stat.bgClass}
                    isLoading={!analytics}
                  />
                ))}
              </section>

              {/* Recent Bookings Table (Preview) */}
              <section className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h4 className="text-xl font-headline font-semibold text-white">Recent Requests</h4>
                  <button onClick={() => setActiveTab('bookings')} className="text-[#EFBF04] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[600px]">
                    <tbody className="divide-y divide-white/5 text-sm">
                      {bookings.slice(0, 3).map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6 text-[#EFBF04] font-mono text-xs">{b.id}</td>
                          <td className="px-4 py-6">
                            <div className="font-semibold text-white">{b.customer}</div>
                            <div className="text-[10px] text-gray-500">{b.phone}</div>
                          </td>
                          <td className="px-4 py-6 text-gray-300">{b.service}</td>
                          <td className="px-4 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              b.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-400' : 
                              b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
                      <th className="px-4 py-4">Assigned Driver</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
<<<<<<< HEAD
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
=======
                  <tbody className="text-sm text-white">
                    {filteredBookings.map((b) => (
                      <React.Fragment key={b.id}>
                        <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                          <td className="px-8 py-5 text-[#EFBF04] font-mono text-xs">{b.id}</td>
                          <td className="px-4 py-5">
                            <div className="font-semibold">{b.customer}</div>
                            <div className="text-[10px] text-gray-500">{b.phone}</div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="text-white font-medium">{b.service}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{b.details}</div>
                          </td>
                          <td className="px-4 py-5 text-xs text-gray-300">{b.schedule}</td>
                          <td className="px-4 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              b.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-400' : 
                              b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            {!requiresDriver(b.service) ? (
                              <span className="text-[10px] text-gray-600 italic">N/A</span>
                            ) : b.driver_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#EFBF04]/20 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#EFBF04] text-sm">person</span>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-white">{b.driver_name}</div>
                                  <div className="text-[10px] text-gray-500">{b.driver_id}</div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setExpandedBookingId(expandedBookingId === b.id ? null : b.id);
                                  setSelectedDriverId('');
                                  setAssignError('');
                                  setAssignSuccess('');
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#EFBF04] hover:text-white border border-[#EFBF04]/30 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Assign
                              </button>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <BookingActionCell 
                              booking={b}
                              onUpdateStatus={updateStatus}
                              onDelete={deleteBooking}
                            />
                          </td>
                        </tr>
                        {/* Expanded Driver Assignment Row */}
                        {expandedBookingId === b.id && (
                          <tr className="bg-[#EFBF04]/5 border-b border-[#EFBF04]/20">
                            <td colSpan="7" className="px-8 py-5">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[#EFBF04] text-lg">directions_car</span>
                                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Assign Driver to {b.id}</span>
                                </div>
                                <select
                                  value={selectedDriverId}
                                  onChange={(e) => setSelectedDriverId(e.target.value)}
                                  className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#EFBF04]/40 min-w-[220px]"
                                >
                                  <option value="">-- Select Available Driver --</option>
                                  {drivers
                                    .filter(d => d.status === 'Active' && d.availability_status !== 'Unavailable')
                                    .map(d => (
                                      <option key={d.id} value={d.id}>
                                        {d.name} ({d.id})
                                      </option>
                                    ))
                                  }
                                </select>
                                <button
                                  onClick={() => handleAssignDriver(b.id)}
                                  disabled={!selectedDriverId || assigningDriverBookingId === b.id}
                                  className="flex items-center gap-2 bg-[#EFBF04] text-black text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {assigningDriverBookingId === b.id ? (
                                    <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Assigning...</>
                                  ) : (
                                    <><span className="material-symbols-outlined text-sm">check_circle</span> Confirm</>
                                  )}
                                </button>
                                <button
                                  onClick={() => setExpandedBookingId(null)}
                                  className="text-gray-500 hover:text-white transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                                {assignSuccess && <span className="text-emerald-400 text-xs font-bold">{assignSuccess}</span>}
                                {assignError && <span className="text-rose-400 text-xs font-bold">{assignError}</span>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
>>>>>>> feature/Admin-pannel-Sachin-update-004
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'fleet' && (
<<<<<<< HEAD
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
=======
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
              {filteredFleet.map((v) => {
                const getConditionColor = (cond) => {
                  switch (cond) {
                    case 'Moderate': return 'bg-amber-500/20 text-amber-500';
                    case 'Critical': return 'bg-rose-500/20 text-rose-500';
                    default: return 'bg-emerald-500/20 text-emerald-500';
                  }
                };
                
                return (
                  <div key={v.id} className="bg-white/5 rounded-2xl border border-white/10 hover:border-[#EFBF04]/40 transition-all group overflow-hidden flex flex-col">
                    {/* Vehicle Image Header */}
                    <div className="h-32 bg-black/40 relative flex items-center justify-center overflow-hidden">
                      {v.photo ? (
                        <img src={v.photo} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-gray-600">directions_car</span>
                      )}
                      
                      {/* Status Badge overlays image */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                          v.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                          v.status === 'On Trip' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {v.status}
                        </span>
                      </div>

                      {/* Condition Indicator */}
                      <div className={`absolute bottom-4 left-4 px-2 py-1 rounded border backdrop-blur-md text-[10px] uppercase font-bold flex items-center gap-1 ${getConditionColor(v.condition)} border-current/30`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                        {v.condition || 'Good'}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="text-xl font-bold text-white mb-1">{v.model}</h4>
                      <p className="text-[#EFBF04] font-mono text-xs uppercase tracking-widest mb-4">{v.plate}</p>
                      
                      {/* Insurance Alert */}
                      {v.insurance_status === 'Expired' && (
                        <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2 flex items-center gap-2 text-rose-400">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest">Insurance Expired</span>
                        </div>
                      )}
                      {v.insurance_status === 'Expiring Soon' && (
                        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 flex items-center gap-2 text-amber-500">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest">Expiring Soon</span>
                        </div>
                      )}
                      {v.insurance_status === 'Valid' && (
                        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2 text-emerald-400">
                          <span className="material-symbols-outlined text-[16px]">verified_user</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest">Insurance Valid</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500 mb-6 mt-auto">
                        <span>Type: {v.type}</span>
                        <span>Age: {v.age || 0} yrs</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-stretch gap-2">
                        <button 
                          onClick={() => setSelectedFleet(v)}
                          className="flex-1 h-10 rounded-lg bg-white/5 hover:bg-[#EFBF04] text-gray-300 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                          Check Conditions
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFleetToEdit(v);
                            setIsEntryModalOpen(true);
                          }}
                          className="h-10 w-10 bg-white/5 hover:bg-[#EFBF04] text-gray-400 hover:text-black rounded-lg transition-colors border border-white/10 hover:border-transparent flex items-center justify-center shrink-0"
                          title="Edit Vehicle"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        
                        <div className="relative h-10 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFleetToDelete(v.id);
                            }}
                            className="h-10 w-10 bg-white/5 hover:bg-rose-500 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/10 hover:border-transparent flex items-center justify-center"
                            title="Delete Vehicle"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>

                          {/* Delete Confirmation Popover */}
                          {fleetToDelete === v.id && (
                            <div 
                              className="absolute bottom-12 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl z-50 w-48 animate-in fade-in zoom-in duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-3 font-bold text-center">Delete this vehicle?</p>
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => deleteFleetRecordById(v.id)}
                                  disabled={isDeleting}
                                  className="w-full bg-rose-500 text-black py-2 rounded font-bold text-xs hover:bg-rose-400 transition-colors border-none disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {isDeleting && <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>}
                                  Confirm Delete
                                </button>
                                <button 
                                  onClick={() => setFleetToDelete(null)}
                                  disabled={isDeleting}
                                  className="w-full bg-white/5 text-gray-300 py-2 rounded font-bold text-xs hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
>>>>>>> feature/Admin-pannel-Sachin-update-004
            </div>
          )}

          {activeTab === 'drivers' && (
<<<<<<< HEAD
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
=======
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
              {filteredDrivers.map((d) => (
                <div 
                  key={d.id} 
                  onClick={() => setSelectedDriver(d)}
                  className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group hover:border-[#EFBF04]/40 transition-all cursor-pointer relative"
                >


                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#EFBF04]/10 rounded-full flex items-center justify-center border-2 border-[#EFBF04]/20 overflow-hidden relative shrink-0">
                    {d.photo ? (
                      <img src={d.photo} alt={d.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#EFBF04]">person</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">{d.name}</h4>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{d.phone}</p>
                    <div className="mt-4 flex flex-wrap justify-between items-center gap-y-3">
                      <div className="flex gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold whitespace-nowrap">{d.experience} Exp</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold whitespace-nowrap">{d.completed_trips || 0} Trips</span>
                        <span className={`text-[10px] uppercase tracking-widest font-bold whitespace-nowrap ${d.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>{d.status}</span>
                        {d.availability_status === 'Unavailable' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            On Trip
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDriverToEdit(d);
                            setIsEntryModalOpen(true);
                          }}
                          className="p-2 bg-white/5 hover:bg-[#EFBF04] text-gray-400 hover:text-black rounded-lg transition-colors border border-white/10 hover:border-transparent flex items-center justify-center"
                          title="Edit Driver"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDriverToDelete(d.id);
                            }}
                            className="p-2 bg-white/5 hover:bg-rose-500 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/10 hover:border-transparent flex items-center justify-center"
                            title="Delete Driver"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>

                          {/* Delete Confirmation Popover */}
                          {driverToDelete === d.id && (
                            <div 
                              className="absolute bottom-10 right-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl z-50 w-48 animate-in fade-in zoom-in duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-3 font-bold text-center">Delete this driver?</p>
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => deleteDriver(d.id)}
                                  disabled={isDeleting}
                                  className="w-full bg-rose-500 text-black py-2 rounded font-bold text-xs hover:bg-rose-400 transition-colors border-none disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {isDeleting && <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>}
                                  Confirm Delete
                                </button>
                                <button 
                                  onClick={() => setDriverToDelete(null)}
                                  disabled={isDeleting}
                                  className="w-full bg-white/5 text-gray-300 py-2 rounded font-bold text-xs hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
>>>>>>> feature/Admin-pannel-Sachin-update-004
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

<<<<<<< HEAD
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
=======
              {isMainAdmin && (
                <section className="bg-white/5 p-10 rounded-3xl border border-white/5 shadow-2xl mt-8">
                  <div className="mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                      </div>
                      <h3 className="text-2xl font-headline font-bold text-white">Admin Management</h3>
                    </div>
                    <p className="text-gray-400 text-sm pl-16">Generate a one-time setup key to onboard a new administrator.</p>
                  </div>

                  <div className="space-y-6">
                    {setupKeyError && (
                      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {setupKeyError}
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-black/40 p-6 rounded-2xl border border-white/5">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">Generate Initialization Key</p>
                        <p className="text-xs text-gray-500">This key will expire in 24 hours and can only be used once.</p>
                      </div>
                      <button 
                        onClick={handleGenerateSetupKey}
                        disabled={isSetupKeyLoading}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors border border-white/10 text-sm flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">key</span>
                        {isSetupKeyLoading ? 'Generating...' : 'Generate Key'}
                      </button>
                    </div>

                    {setupKey && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl">
                        <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Key Generated Successfully
                        </p>
                        <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-emerald-500/20">
                          <code className="text-white font-mono text-lg tracking-wider flex-1">{setupKey}</code>
                          <button 
                            onClick={() => navigator.clipboard.writeText(setupKey)}
                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                            title="Copy to clipboard"
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                        </div>
                        <p className="text-xs text-emerald-400/70 mt-4">
                          Share this key securely with the new admin. They can initialize their account at <span className="font-bold text-white">/admin/setup</span>
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
>>>>>>> feature/Admin-pannel-Sachin-update-004
            </div>
          )}
        </div>
      </main>

<<<<<<< HEAD
      <AdminForms
        type={activeTab}
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSubmit={handleAddEntry}
=======
      <AdminForms 
        type={activeTab} 
        isOpen={isEntryModalOpen} 
        onClose={() => {
          setIsEntryModalOpen(false);
          setDriverToEdit(null);
          setFleetToEdit(null);
        }} 
        onSubmit={handleAddEntry} 
        initialData={activeTab === 'drivers' ? driverToEdit : activeTab === 'fleet' ? fleetToEdit : null}
      />

      <DriverProfileModal 
        driver={selectedDriver}
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        bookings={bookings}
      />

      <VehicleConditionModal 
        vehicle={selectedFleet}
        isOpen={!!selectedFleet}
        onClose={() => setSelectedFleet(null)}
>>>>>>> feature/Admin-pannel-Sachin-update-004
      />
    </div>
  );
}
