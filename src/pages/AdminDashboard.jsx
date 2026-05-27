import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, getFleet, getDrivers, getAnalytics, addBooking, addFleet, addDriver, updateBookingStatus, deleteBookingRecord, updateDriverRecord, deleteDriverRecord, updateFleetRecord, deleteFleetRecord, assignDriverToBooking } from '../services/dataService';
import AdminForms from '../components/admin/AdminForms';
import BookingActionCell from '../components/admin/BookingActionCell';
import StatCard from '../components/admin/StatCard';
import DriverProfileModal from '../components/admin/DriverProfileModal';
import VehicleConditionModal from '../components/admin/VehicleConditionModal';
import { logoutAdmin, changePassword, verifyToken, generateSetupKey } from '../services/authService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
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
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const [setupKey, setSetupKey] = useState('');
  const [setupKeyError, setSetupKeyError] = useState('');
  const [isSetupKeyLoading, setIsSetupKeyLoading] = useState(false);
  
  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Reload data when switching tabs to stay fresh
  useEffect(() => {
    const loadAuth = async () => {
      const auth = await verifyToken();
      setIsMainAdmin(auth.isMainAdmin);
    };
    loadAuth();

    const loadData = async () => {
      const [b, f, d, a] = await Promise.all([getBookings(), getFleet(), getDrivers(), getAnalytics()]);
      setBookings(b);
      setFleet(f);
      setDrivers(d);
      setAnalytics(a);
    };
    loadData();
  }, [activeTab]);

  // Handlers
  const handleAddEntry = async (newEntry) => {
    if (activeTab === 'bookings') {
      await addBooking(newEntry);
      const b = await getBookings();
      setBookings(b);
    }
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
  };

  // Filtered Data based on Search
  const filteredBookings = useMemo(() => 
    bookings.filter(b => b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase())),
    [bookings, searchQuery]
  );

  const filteredFleet = useMemo(() => 
    fleet.filter(f => f.model.toLowerCase().includes(searchQuery.toLowerCase()) || f.plate.toLowerCase().includes(searchQuery.toLowerCase())),
    [fleet, searchQuery]
  );

  const filteredDrivers = useMemo(() => 
    drivers.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [drivers, searchQuery]
  );

  // Actions
  const deleteBooking = async (id) => {
    await deleteBookingRecord(id);
    const b = await getBookings();
    setBookings(b);
    setAnalytics(await getAnalytics());
  };

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
  const updateStatus = async (id, newStatus) => {
    await updateBookingStatus(id, newStatus);
    const b = await getBookings();
    setBookings(b);
    setAnalytics(await getAnalytics());
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
    } catch (err) {
      setPwdError(err.message || 'Failed to update password');
    } finally {
      setIsPwdLoading(false);
    }
  };

  const handleGenerateSetupKey = async () => {
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
    } finally {
      setIsSetupKeyLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month', active: true },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin', active: true },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', active: true },
    { id: 'routes', label: 'Routes', icon: 'map', active: false },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', active: false },
    { id: 'reports', label: 'Reports', icon: 'assessment', active: false },
    ...(isMainAdmin ? [{ id: 'settings', label: 'Settings', icon: 'settings', active: true }] : []),
  ];

  return (
    <div className="flex h-screen w-full bg-background text-on-surface font-body overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Side Navigation Bar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0F0F0F] border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-8 py-10 cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-xl font-headline font-bold text-[#EFBF04] tracking-tight">Velvet Pearl</h1>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1">Premium Travel Admin</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
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

      {/* Main Content Canvas */}
      <main className="flex-1 overflow-y-auto bg-[#050505] relative">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EFBF04]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>

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

        <div className="px-10 pb-12 pt-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-4 py-4">Assigned Driver</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
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
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'fleet' && (
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
            </div>
          )}

          {activeTab === 'drivers' && (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <section className="bg-white/5 p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                      <span className="material-symbols-outlined text-2xl">security</span>
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-white">Security & Authentication</h3>
                  </div>
                  <p className="text-gray-400 text-sm pl-16">Manage your admin access credentials securely.</p>
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
            </div>
          )}

        </div>
      </main>

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
      />
    </div>
  );
}
