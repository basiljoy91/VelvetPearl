import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, getFleet, getDrivers, getAnalytics, addBooking, addFleet, addDriver, updateBookingStatus, deleteBookingRecord } from '../services/dataService';
import AdminForms from '../components/admin/AdminForms';
import { logoutAdmin, changePassword } from '../services/authService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  
  // Settings Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  
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
      await addFleet(newEntry);
      const f = await getFleet();
      setFleet(f);
    }
    if (activeTab === 'drivers') {
      await addDriver(newEntry);
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
  const updateStatus = async (id, newStatus) => {
    await updateBookingStatus(id, newStatus);
    const b = await getBookings();
    setBookings(b);
    setAnalytics(await getAnalytics());
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month', active: true },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin', active: true },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car', active: true },
    { id: 'routes', label: 'Routes', icon: 'map', active: false },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', active: false },
    { id: 'reports', label: 'Reports', icon: 'assessment', active: false },
    { id: 'settings', label: 'Settings', icon: 'settings', active: false },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-on-surface font-body overflow-hidden">
      {/* Side Navigation Bar */}
      <aside className="w-72 bg-[#0F0F0F] border-r border-white/5 flex flex-col z-50">
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
        <header className="flex justify-between items-center px-10 py-8 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-headline font-light tracking-tighter text-white capitalize">{activeTab} Center</h2>
            <p className="text-gray-500 text-sm mt-1">Operational Overview • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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

        <div className="px-10 pb-12 pt-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Stats Bento Grid */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Today's Bookings", val: analytics?.todayBookings ?? "-", icon: "event_available", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Active Drivers", val: analytics?.activeDrivers ?? "-", icon: "person_celebrate", color: "text-[#EFBF04]", bg: "bg-[#EFBF04]/10" },
                  { label: "Utilization", val: analytics ? `${analytics.utilization.toFixed(1)}%` : "-", icon: "speed", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Pending Payments", val: analytics ? `₹${analytics.pendingPayments}` : "-", icon: "account_balance_wallet", color: "text-rose-400", bg: "bg-rose-500/10" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl group hover:border-[#EFBF04]/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined p-2 ${stat.bg} ${stat.color} rounded-lg`}>{stat.icon}</span>
                      <span className="text-[10px] font-label text-emerald-400 font-bold">+12%</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-label">{stat.label}</p>
                    <h3 className="text-4xl font-headline font-bold text-white mt-1 group-hover:text-[#EFBF04] transition-colors">{stat.val}</h3>
                  </div>
                ))}
              </section>

              {/* Recent Bookings Table (Preview) */}
              <section className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h4 className="text-xl font-headline font-semibold text-white">Recent Requests</h4>
                  <button onClick={() => setActiveTab('bookings')} className="text-[#EFBF04] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
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
                              b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#EFBF04]/10 text-[#EFBF04]'
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
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-white">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6 text-[#EFBF04] font-mono text-xs">{b.id}</td>
                        <td className="px-4 py-6">
                          <div className="font-semibold">{b.customer}</div>
                          <div className="text-[10px] text-gray-500">{b.phone}</div>
                        </td>
                        <td className="px-4 py-6">
                          <div className="text-white font-medium">{b.service}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{b.details}</div>
                        </td>
                        <td className="px-4 py-6 text-xs text-gray-300">{b.schedule}</td>
                        <td className="px-4 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 
                            b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => updateStatus(b.id, 'Confirmed')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 transition-colors border-none">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                            <button onClick={() => deleteBooking(b.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 transition-colors border-none">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'fleet' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredFleet.map((v) => (
                <div key={v.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#EFBF04]/40 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#EFBF04]/10 text-[#EFBF04] rounded-xl">
                      <span className="material-symbols-outlined text-3xl">directions_car</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      v.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 
                      v.status === 'On Trip' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">{v.model}</h4>
                  <p className="text-[#EFBF04] font-mono text-xs uppercase tracking-widest">{v.plate}</p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>Type: {v.type}</span>
                    <span>Last Service: {v.lastService}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDrivers.map((d) => (
                <div key={d.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-6 group hover:border-[#EFBF04]/40 transition-all">
                  <div className="w-20 h-20 bg-[#EFBF04]/10 rounded-full flex items-center justify-center border-2 border-[#EFBF04]/20">
                    <span className="material-symbols-outlined text-4xl text-[#EFBF04]">person</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-white">{d.name}</h4>
                      <div className="flex items-center gap-1 text-[#EFBF04]">
                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                        <span className="text-xs font-bold">{d.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{d.phone}</p>
                    <div className="mt-4 flex gap-4">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{d.experience} Exp</span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${d.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>{d.status}</span>
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
