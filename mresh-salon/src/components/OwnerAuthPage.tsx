import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Loader, KeyRound, CheckCircle2, UserPlus, LogIn, UserCheck } from 'lucide-react';
import { getApiUrl } from '../lib/api';

interface OwnerAuthPageProps {
  onSuccessLogin: (user: any, token: string) => void;
  onQuickOwnerLogin?: () => Promise<void>;
}

export default function OwnerAuthPage({ onSuccessLogin, onQuickOwnerLogin }: OwnerAuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ownerExists, setOwnerExists] = useState<boolean>(true);
  const [registeredOwnerEmail, setRegisteredOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    checkOwnerStatus();
  }, []);

  const checkOwnerStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/api/auth/owner-status'));
      if (res.ok) {
        const data = await res.json();
        setOwnerExists(data.ownerExists);
        if (data.ownerEmail) setRegisteredOwnerEmail(data.ownerEmail);
      }
    } catch (err) {
      console.error('Failed to check owner status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (ownerExists) {
          setError('An owner account already exists on this platform. Only 1 owner account is permitted.');
          setLoading(false);
          return;
        }

        const res = await fetch(getApiUrl('/api/auth/owner-register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('mresh_token', data.token);
          onSuccessLogin(data.user, data.token);
        } else {
          setError(data.error || 'Owner registration failed.');
        }
      } else {
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, requiredRole: 'admin' })
        });

        const data = await res.json();
        if (res.ok) {
          if (data.user.role !== 'admin') {
            setError('Access Denied: Account lacks Salon Owner administrative permissions.');
            setLoading(false);
            return;
          }
          localStorage.setItem('mresh_token', data.token);
          onSuccessLogin(data.user, data.token);
        } else {
          setError(data.error || 'Authentication failed. Please verify owner credentials.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check network and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* EXECUTIVE OWNER AUTHENTICATION CARD */}
      <div className="bg-[#121214] border border-rose-900/30 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/40 px-3.5 py-1.5 rounded-full text-rose-300 text-[11px] font-mono font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Sole Owner Access • Single Slot</span>
          </div>

          <div className="pt-2">
            <h2 className="font-serif text-2xl font-bold text-white">Salon Owner Portal</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
              Authenticate to unlock real-time revenue analytics, M-Pesa ledger logs, appointment controls & lookbook publishing.
            </p>
          </div>
        </div>

        {/* MODE SWITCHER TABS (Owner Sign In vs Owner Sign Up) */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signin' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Owner Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Owner Sign Up</span>
          </button>
        </div>

        {/* OWNER SINGLE SLOT STATUS NOTICE */}
        {ownerExists && mode === 'signup' && (
          <div className="bg-amber-950/40 border border-amber-800/40 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-300 text-xs font-medium">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">Sole Owner Account Already Claimed (1 / 1)</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                The platform owner account is registered ({registeredOwnerEmail || 'admin@mreshsalon.com'}). Only 1 owner is permitted. Please switch to "Owner Sign In".
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/50 border border-rose-800/50 p-3.5 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* OWNER CREDENTIALS FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">Owner Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Faith Mresh"
                disabled={ownerExists}
                className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono disabled:opacity-50"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">Owner Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mreshsalon.com"
              disabled={mode === 'signup' && ownerExists}
              className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono disabled:opacity-50"
              required
              id="owner-auth-email-input"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider">Passcode</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={mode === 'signup' && ownerExists}
              className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono disabled:opacity-50"
              required
              id="owner-auth-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && ownerExists)}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white text-xs font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed"
            id="owner-auth-submit-btn"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {mode === 'signup' ? 'Create Sole Owner Account' : 'Authenticate Owner Session'}
          </button>
        </form>

        {/* PRIVACY & RESTRICTION FOOTER */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-zinc-600" />
            <span>Encrypted SSL • Confidential Mresh Salon Management System</span>
          </p>
        </div>

      </div>

    </div>
  );
}
