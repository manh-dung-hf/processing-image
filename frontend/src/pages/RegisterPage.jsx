import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, AlertCircle, Loader2, UserPlus, Check,
  Shield, Sparkles, Send, Image as ImageIcon, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Animated elements ───────────────────────────────────────────────────── */

const Orb = ({ className, delay = 0, dur = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -18, 0], x: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ─── Register Page ───────────────────────────────────────────────────────── */

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const strength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 6 ? 2 : password.length < 10 ? 3 : 4;
  const barColors = ['bg-[#E5E4DF]', 'bg-[#A32D2D]', 'bg-[#BA7517]', 'bg-[#BA7517]', 'bg-[#1D9E75]'];
  const barLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const barTextColors = ['', 'text-danger', 'text-warning', 'text-warning', 'text-success'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/gallery', { replace: true });
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x.msg).join('. ') : 'Unable to connect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0c0b10]">
      {/* ── LEFT — showcase ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[56%] relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-[-8%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#1D9E75]/18 blur-[120px]" />
          <div className="absolute bottom-[-8%] left-[-5%] w-[420px] h-[420px] rounded-full bg-[#534AB7]/15 blur-[100px]" />
          <div className="absolute top-[50%] left-[40%] w-[280px] h-[280px] rounded-full bg-[#BA7517]/8 blur-[80px]" />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Orbs */}
        <Orb className="absolute top-[18%] right-[18%] w-2 h-2 rounded-full bg-[#5DCAA5]" delay={0} />
        <Orb className="absolute top-[45%] left-[22%] w-1.5 h-1.5 rounded-full bg-[#7F77DD]" delay={1} dur={7} />
        <Orb className="absolute bottom-[22%] right-[30%] w-2.5 h-2.5 rounded-full bg-[#378ADD]" delay={0.5} dur={5} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#534AB7] rounded-lg flex items-center justify-center shadow-lg shadow-[#534AB7]/30">
              <div className="w-4 h-4 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[20px] font-semibold text-white tracking-tight">Lumen</span>
          </motion.div>

          {/* Center */}
          <div className="flex-1 flex flex-col justify-center py-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[38px] xl:text-[44px] font-bold text-white leading-[1.1] tracking-tight mb-4"
            >
              Start building
              <br />
              <span className="bg-gradient-to-r from-[#5DCAA5] to-[#378ADD] bg-clip-text text-transparent">
                your visual library
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[15px] text-white/40 leading-relaxed max-w-[380px] mb-10"
            >
              Create a free account and let AI organize your images automatically.
            </motion.p>

            {/* Checklist */}
            <div className="space-y-3.5">
              {[
                { icon: <ImageIcon size={13} />, text: 'Unlimited image uploads', color: '#7F77DD' },
                { icon: <Sparkles size={13} />, text: 'AI-powered tagging & OCR', color: '#5DCAA5' },
                { icon: <Send size={13} />, text: 'Telegram bot integration', color: '#378ADD' },
                { icon: <Shield size={13} />, text: 'Secure workspace & roles', color: '#EF9F27' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}18`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="text-[13px] text-white/55">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-[11px] text-white/15">
            Lumen AI Image Platform · v1.0
          </motion.p>
        </div>
      </div>

      {/* ── RIGHT — register form ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-canvas p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[18px] font-semibold text-fg-primary tracking-tight">Lumen</span>
          </div>

          <h1 className="text-[24px] font-bold text-fg-primary tracking-tight mb-1">Create account</h1>
          <p className="text-[13px] text-fg-tertiary mb-8">Get started in under a minute</p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-danger-soft border border-danger/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-danger-soft-fg leading-relaxed">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Full name" focused={focused === 'name'}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="John Doe" required autoFocus autoComplete="name" className="form-input" />
            </FormField>

            <FormField label="Email address" focused={focused === 'email'}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="you@example.com" required autoComplete="email" className="form-input" />
            </FormField>

            <div>
              <FormField label="Password" focused={focused === 'password'}>
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Min 6 characters" required minLength={6} autoComplete="new-password"
                  className="form-input pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </FormField>

              {/* Strength bar */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 flex items-center gap-2.5 overflow-hidden">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div key={i}
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className={`h-[4px] flex-1 rounded-full origin-left transition-colors duration-300 ${i <= strength ? barColors[strength] : 'bg-surface-muted'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold min-w-[36px] ${barTextColors[strength]}`}>
                      {barLabels[strength]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-[46px] bg-accent text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/25"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><UserPlus size={14} /><span>Create account</span></>}
            </motion.button>
          </form>

          <Divider />

          <p className="text-center text-[12px] text-fg-tertiary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Shared ──────────────────────────────────────────────────────────────── */

const FormField = ({ label, focused, children }) => (
  <div>
    <label className="block text-[12px] font-medium text-fg-secondary mb-2">{label}</label>
    <motion.div animate={{ scale: focused ? 1.005 : 1 }} transition={{ duration: 0.15 }} className="relative">
      {children}
    </motion.div>
  </div>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-6">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[11px] text-fg-disabled select-none">or</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

export default RegisterPage;
