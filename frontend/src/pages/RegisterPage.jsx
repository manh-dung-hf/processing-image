import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, UserPlus, Check } from 'lucide-react';
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

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const passwordStrength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 6 ? 2 : password.length < 10 ? 3 : 4;
  const strengthColors = ['bg-surface-muted', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      navigate('/gallery', { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('. '));
      } else {
        setError('Unable to connect. Check if the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden bg-[#17161C]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-success/15 via-transparent to-accent/10" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-accent/12 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-[350px] h-[350px] bg-gradient-to-tl from-success/10 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <FloatingOrb className="absolute top-[20%] right-[20%] w-3 h-3 rounded-full bg-success/40 blur-[1px]" delay={0} />
        <FloatingOrb className="absolute top-[50%] left-[25%] w-2 h-2 rounded-full bg-accent/50 blur-[1px]" delay={1} duration={7} />
        <FloatingOrb className="absolute bottom-[25%] right-[35%] w-2.5 h-2.5 rounded-full bg-info/30 blur-[1px]" delay={0.5} duration={5} />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-[420px]"
          >
            <h2 className="text-[36px] font-semibold text-white leading-[1.15] tracking-tight mb-4">
              Start building
              <br />
              your visual library
            </h2>
            <p className="text-[15px] text-white/45 leading-relaxed mb-10">
              Create a free account and let AI organize your images automatically.
            </p>

            {/* Checklist */}
            <div className="space-y-3">
              {[
                'Unlimited image uploads',
                'AI-powered tagging & OCR',
                'Telegram bot integration',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-[13px] text-white/50"
                >
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Check size={11} className="text-success" />
                  </div>
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

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

      {/* ── Right panel — form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-canvas p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
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
            Create account
          </h1>
          <p className="text-[13px] text-fg-tertiary mb-7">
            Get started in under a minute
          </p>

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
            {/* Name */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-2">
                Full name
              </label>
              <motion.div animate={{ scale: focusedField === 'name' ? 1.005 : 1 }} transition={{ duration: 0.15 }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="John Doe"
                  required
                  autoFocus
                  autoComplete="name"
                  className="w-full h-[44px] bg-surface border border-border rounded-lg px-4 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all duration-200"
                />
              </motion.div>
            </div>

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
                  autoComplete="email"
                  className="w-full h-[44px] bg-surface border border-border rounded-lg px-4 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all duration-200"
                />
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-2">
                Password
              </label>
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
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
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

              {/* Strength bar */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5 flex items-center gap-2"
                >
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    passwordStrength <= 1 ? 'text-danger' : passwordStrength <= 3 ? 'text-warning' : 'text-success'
                  }`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </motion.div>
              )}
            </div>

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
                  <UserPlus size={14} />
                  Create account
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[0.5px] bg-border" />
            <span className="text-[11px] text-fg-disabled">or</span>
            <div className="flex-1 h-[0.5px] bg-border" />
          </div>

          <p className="text-center text-[12px] text-fg-tertiary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
