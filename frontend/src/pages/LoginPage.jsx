import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Sparkles, ImageIcon, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatingOrb = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/gallery';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Unable to connect. Check if the backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — visual branding ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden bg-[#17161C]">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/20 via-transparent to-success/10" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-accent/15 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-gradient-to-br from-info/10 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        {/* Floating orbs */}
        <FloatingOrb className="absolute top-[15%] left-[20%] w-3 h-3 rounded-full bg-accent/40 blur-[1px]" delay={0} />
        <FloatingOrb className="absolute top-[35%] right-[25%] w-2 h-2 rounded-full bg-success/50 blur-[1px]" delay={1.5} duration={7} />
        <FloatingOrb className="absolute bottom-[30%] left-[35%] w-2.5 h-2.5 rounded-full bg-warning/30 blur-[1px]" delay={0.8} duration={5} />
        <FloatingOrb className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-info/40" delay={2} duration={8} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
              <div className="w-4 h-4 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[20px] font-semibold text-white tracking-tight">Lumen</span>
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-[420px]"
          >
            <h2 className="text-[36px] font-semibold text-white leading-[1.15] tracking-tight mb-4">
              See more in
              <br />
              every image
            </h2>
            <p className="text-[15px] text-white/45 leading-relaxed mb-10">
              AI-powered analysis that automatically tags, categorizes, and extracts text from your images.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: <Sparkles size={12} />, label: 'Smart tagging' },
                { icon: <Zap size={12} />, label: 'Instant OCR' },
                { icon: <ImageIcon size={12} />, label: 'Auto categorize' },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[12px] text-white/60"
                >
                  {f.icon}
                  {f.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[11px] text-white/20"
          >
            Lumen AI Image Platform · v1.0
          </motion.p>
        </div>
      </div>

      {/* ── Right panel — login form ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-canvas p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 mb-10 lg:hidden"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[18px] font-semibold text-fg-primary tracking-tight">Lumen</span>
          </motion.div>

          <h1 className="text-[22px] font-semibold text-fg-primary tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-fg-tertiary mb-7">
            Sign in to your workspace
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-danger-soft border-[0.5px] border-danger/20 rounded-lg px-3.5 py-3 flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-danger-soft-fg leading-relaxed">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-2">
                Email address
              </label>
              <motion.div animate={{ scale: focusedField === 'email' ? 1.005 : 1 }} transition={{ duration: 0.15 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full h-[44px] bg-surface border border-border rounded-lg px-4 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all duration-200"
                />
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-medium text-fg-secondary">
                  Password
                </label>
              </div>
              <motion.div
                animate={{ scale: focusedField === 'password' ? 1.005 : 1 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-[44px] bg-surface border border-border rounded-lg px-4 pr-11 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              className="w-full h-[44px] bg-accent text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-accent/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[0.5px] bg-border" />
            <span className="text-[11px] text-fg-disabled">or</span>
            <div className="flex-1 h-[0.5px] bg-border" />
          </div>

          <p className="text-center text-[12px] text-fg-tertiary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo credentials hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-3 bg-surface-muted/60 rounded-lg border border-border"
          >
            <p className="text-[11px] text-fg-tertiary text-center leading-relaxed">
              <span className="font-medium text-fg-secondary">Demo accounts:</span>
              <br />
              admin@lumen.local / admin1234
              <br />
              minh@lumen.local / minh1234
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
