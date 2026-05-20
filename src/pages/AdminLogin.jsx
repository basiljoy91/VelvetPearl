import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, signupAdmin, changePassword } from '../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'changepass'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginAdmin(email, password);
        navigate('/admin/dashboard');
      } else if (mode === 'signup') {
        await signupAdmin(email, password);
        setMessage('Admin created successfully. You can now login.');
        setMode('login');
      } else if (mode === 'changepass') {
        // changePassword needs a valid JWT token but here we're not logged in.
        // We verify the old password first via login, then change.
        // Step 1: login with old password to get token
        await loginAdmin(email, oldPassword);
        // Step 2: now change the password
        await changePassword(oldPassword, newPassword, confirmPassword);
        setMessage('Password updated successfully. Please login with your new password.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPassword('');
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassword('');
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen flex items-center justify-center relative px-6 py-20 overflow-hidden">
      {/* Atmospheric Background Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-container/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary-container/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Anchor */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>diamond</span>
            </div>
            <span className="font-headline font-bold text-2xl text-on-surface tracking-tight">Velvet Pearl</span>
          </div>
          <h1 className="font-headline font-light text-4xl tracking-tighter text-on-surface mb-2">
            {mode === 'login' ? 'Admin Login' : mode === 'signup' ? 'Admin Initialization' : 'Change Password'}
          </h1>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">Secured Management Portal</p>
        </div>

        {/* Glass Login Card */}
        <div className="glass-panel p-10 rounded-xl border border-white/10 shadow-2xl bg-surface-container-low/50 backdrop-blur-3xl">
          <form className="space-y-6" onSubmit={handleAction}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center font-body">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm text-center font-body">
                {message}
              </div>
            )}
            
            {/* Conditional Fields based on Mode */}

            {/* Login / Signup: Email field */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold ml-1">Email / Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
              </div>
            )}

            {/* Login / Signup: Password field */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchMode('changepass')} className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim hover:text-white transition-colors bg-transparent border-none cursor-pointer">Forgot password?</button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </div>
                  <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
              </div>
            )}

            {/* Change Password: Email + Old + New + Confirm fields */}
            {mode === 'changepass' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="Your admin email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold ml-1">Old Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                    </div>
                    <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="Enter your current password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-sm">lock</span>
                    </div>
                    <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="Enter your new password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                    </div>
                    <input className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all rounded-sm py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant font-body text-sm outline-none" placeholder="Confirm your new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Action */}
            <div className="pt-4">
              <button disabled={isLoading} className="w-full bg-primary-container text-white font-headline font-bold py-4 rounded-lg shadow-xl shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200 border-none uppercase tracking-widest text-sm disabled:opacity-50" type="submit">
                {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Initialize Admin' : 'Update Password'}
              </button>
            </div>
            
            {/* Secondary Action Toggles */}
            <div className="text-center pt-2">
              {mode !== 'login' && (
                <button type="button" onClick={() => switchMode('login')} className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                  Back to Login
                </button>
              )}
            </div>
          </form>

          {/* Help Link */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
            <button type="button" onClick={() => switchMode('signup')} className="font-body text-sm text-on-surface-variant hover:text-secondary transition-colors bg-transparent border-none cursor-pointer">
              First time setup? Initialize System
            </button>
            <a className="inline-flex items-center justify-center gap-2 group" href="#">
              <span className="font-body text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Contact support for admin issues.</span>
              <span className="material-symbols-outlined text-xs text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-12 text-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">
            © 2024 Velvet Pearl Tours. Protected Environment.
          </p>
        </div>
      </div>

      {/* Visual Polish: Floating Detail */}
      <div className="hidden lg:block fixed right-12 bottom-12 z-0 opacity-5">
        <h2 className="font-headline font-black text-[12em] leading-none tracking-tighter text-white pointer-events-none select-none">VP</h2>
      </div>
    </div>
  );
}
