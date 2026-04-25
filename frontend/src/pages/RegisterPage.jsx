import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-fg-primary relative overflow-hidden flex-col justify-between p-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[18px] font-medium text-white tracking-tight">
              Lumen
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-[28px] font-medium text-white leading-tight mb-3">
            Start organizing
            <br />
            your images today
          </h2>
          <p className="text-[14px] text-white/50 leading-relaxed max-w-[320px]">
            Create a free account and let AI handle the heavy lifting — tagging,
            categorization, and text extraction.
          </p>
        </motion.div>

        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full rotate-45" />
            </div>
            <span className="text-[18px] font-medium text-fg-primary tracking-tight">
              Lumen
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-h1 font-medium text-fg-primary">Create account</h1>
          </div>
          <p className="text-small text-fg-tertiary mb-8">
            Fill in the details below to get started
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-danger-soft/40 border-[0.5px] border-danger/20 rounded-lg px-3.5 py-2.5 flex items-center gap-2.5">
                  <AlertCircle size={14} className="text-danger flex-shrink-0" />
                  <span className="text-[12px] text-danger-soft-fg">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoFocus
                className="w-full h-[40px] bg-surface border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-[40px] bg-surface border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full h-[40px] bg-surface border-[0.5px] border-border rounded-md px-3 pr-10 text-[13px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                      password.length >= i * 3
                        ? password.length >= 10
                          ? 'bg-success'
                          : password.length >= 6
                            ? 'bg-warning'
                            : 'bg-danger'
                        : 'bg-surface-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-[42px] bg-fg-primary text-surface rounded-md text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

          <p className="text-center text-[12px] text-fg-tertiary mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
