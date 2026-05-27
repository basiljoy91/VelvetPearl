import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeAdmin } from '../services/authService';

export default function InitializeAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await initializeAdmin(email, password, setupKey);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Initialization failed. Please check your setup key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8 cursor-pointer" onClick={() => navigate('/')}>
        <h1 className="text-2xl font-headline font-bold text-[#EFBF04] tracking-tight">Velvet Pearl</h1>
      </div>

      <div className="w-full max-w-md bg-[#0F0F0F] rounded-3xl p-10 border border-white/5 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#EFBF04]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-[#EFBF04]">key</span>
          </div>
          <h2 className="text-3xl font-headline font-bold text-white mb-2">Initialize Admin</h2>
          <p className="text-gray-500 text-sm font-label uppercase tracking-widest">Secure Setup Portal</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-2xl text-center">
            <span className="material-symbols-outlined text-4xl mb-4">check_circle</span>
            <p className="font-bold mb-2">Admin Account Created</p>
            <p className="text-sm opacity-80">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleInitialize} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Setup Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#EFBF04] transition-colors">
                  <span className="material-symbols-outlined text-sm">vpn_key</span>
                </div>
                <input 
                  type="text" 
                  value={setupKey} 
                  onChange={(e) => setSetupKey(e.target.value)} 
                  className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-[#EFBF04] transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none" 
                  placeholder="Paste your 32-character key" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#EFBF04] transition-colors">
                  <span className="material-symbols-outlined text-sm">mail</span>
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-[#EFBF04] transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none" 
                  placeholder="admin@velvetpearl.com" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#EFBF04] transition-colors">
                  <span className="material-symbols-outlined text-sm">lock</span>
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-black/40 border-none focus:ring-0 focus:border-l-2 focus:border-[#EFBF04] transition-all rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-gray-600 font-body text-sm outline-none" 
                  placeholder="Minimum 6 characters" 
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-[#EFBF04] text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(239,191,4,0.3)] hover:shadow-[0_0_30px_rgba(239,191,4,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 mt-4"
              type="submit"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Initializing...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
