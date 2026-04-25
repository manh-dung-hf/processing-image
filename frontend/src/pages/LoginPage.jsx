import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, AlertCircle, ArrowRight, Loader2,
  Sparkles, Zap, Layers, Image as ImageIcon, Send, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Animated background elements ────────────────────────────────────────── */

const Orb = ({ className, delay = 0, dur = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -18, 0], x: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const MockCard = ({ delay, className, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotateX: 8 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Login Page ──────────────────────────────────────────────────────────── */

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/gallery';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to connect. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0c0b10]">
      {/* ── LEFT — showcase panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[56%] relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#534AB7]/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#1D9E75]/15 blur-[100px]" />
          <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#185FA5]/10 blur-[80px]" />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Orbs */}
        <Orb className="absolute top-[12%] left-[18%] w-2 h-2 rounded-full bg-[#7F77DD]" delay={0} />
        <Orb className="absolute top-[30%] right-[22%] w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" delay={1.2} dur={7} />
        <Orb className="absolute bottom-[28%] left-[32%] w-2.5 h-2.5 rounded-full bg-[#EF9F27]" delay={0.6} dur={5} />
        <Orb className="absolute top-[65%] right-[12%] w-1.5 h-1.5 rounded-full bg-[#378ADD]" delay={2} dur={8} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#534AB7] rounded-lg flex items-center justify-center shadow-lg shadow-[#534AB7]/30">
              <div className="w-4 h-4 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[20px] font-semibold text-white tracking-tight">Lumen</span>
          </motion.div>

          {/* Center — hero + mock cards */}
          <div className="flex-1 flex flex-col justify-center py-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[38px] xl:text-[44px] font-bold text-white leading-[1.1] tracking-tight mb-4"
            >
              See more in
              <br />
              <span className="bg-gradient-to-r from-[#7F77DD] to-[#5DCAA5] bg-clip-text text-transparent">
                every image
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[15px] text-white/40 leading-relaxed max-w-[380px] mb-10"
            >
              AI-powered analysis that automatically tags, categorizes, and extracts text from your images.
            </motion.p>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 max-w-[440px]">
              {[
                { icon: <Sparkles size={16} />, label: 'Smart Tags', color: '#7F77DD' },
                { icon: <Zap size={16} />, label: 'Instant OCR', color: '#5DCAA5' },
                { icon: <Layers size={16} />, label: 'Auto Sort', color: '#378ADD' },
              ].map((f, i) => (
                <MockCard key={f.label} delay={0.35 + i * 0.08} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${f.color}20`, color: f.color }}>
                    {f.icon}
                  </div>
                  <p className="text-[12px] font-medium text-white/70">{f.label}</p>
                </MockCard>
              ))}
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-6 mt-8"
            >
              {[
                { icon: <ImageIcon size={12} />, val: '10K+', label: 'Images' },
                { icon: <Send size={12} />, val: 'Telegram', label: 'Integrated' },
                { icon: <BarChart3 size={12} />, val: 'Real-time', label: 'Analytics' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-white/20">{s.icon}</span>
                  <div>
                    <p className="text-[12px] font-semibold text-white/60">{s.val}</p>
                    <p className="text-[10px] text-white/25">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-[11px] text-white/15">
            Lumen AI Image Platform · v1.0
          </motion.p>
        </div>
      </div>

      {/* ── RIGHT — login form ────────────────────────────────── */}
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

          <h1 className="text-[24px] font-bold text-fg-primary tracking-tight mb-1">Welcome back</h1>
          <p className="text-[13px] text-fg-tertiary mb-8">Sign in to your workspace</p>

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
            <FormField label="Email address" focused={focused === 'email'}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="you@example.com" required autoFocus autoComplete="email"
                className="form-input"
              />
            </FormField>

            <FormField label="Password" focused={focused === 'password'}>
              <input
                type={showPwd ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                placeholder="••••••••" required autoComplete="current-password"
                className="form-input pr-11"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-[46px] bg-accent text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/25"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign in</span><ArrowRight size={14} /></>}
            </motion.button>
          </form>

          <Divider />

          <p className="text-center text-[12px] text-fg-tertiary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">Create one</Link>
          </p>

          {/* Demo hint */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-6 p-3.5 bg-surface rounded-xl border border-border">
            <p className="text-[11px] text-fg-tertiary text-center leading-relaxed">
              <span className="font-semibold text-fg-secondary">Demo accounts</span><br />
              <span className="font-mono text-[10px]">admin@lumen.local</span> / <span className="font-mono text-[10px]">admin1234</span><br />
              <span className="font-mono text-[10px]">minh@lumen.local</span> / <span className="font-mono text-[10px]">minh1234</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Shared components ───────────────────────────────────────────────────── */

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

export default LoginPage;
