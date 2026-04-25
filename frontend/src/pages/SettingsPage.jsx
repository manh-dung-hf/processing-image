import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  UserPlus,
  Trash2,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { cn } from '../components/ui/Button';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'users', label: 'User Management', icon: Shield, adminOnly: true },
];

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-h1 font-medium text-fg-primary">Settings</h1>
        <p className="text-small text-fg-tertiary mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-1 border-b-[0.5px] border-border"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all -mb-[0.5px]',
                activeTab === tab.id
                  ? 'border-accent text-fg-primary'
                  : 'border-transparent text-fg-tertiary hover:text-fg-secondary'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && <ProfileTab key="profile" />}
        {activeTab === 'password' && <PasswordTab key="password" />}
        {activeTab === 'users' && isAdmin && <UsersTab key="users" />}
      </AnimatePresence>
    </div>
  );
};

/* ─── Profile Tab ──────────────────────────────────────────────────────────── */

const ProfileTab = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile({ name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-surface rounded-lg border-[0.5px] border-border p-6">
        <h3 className="text-[15px] font-medium text-fg-primary mb-5">
          Profile Information
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-[20px] font-medium text-accent-soft-fg">
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-medium text-fg-primary">{user?.name}</p>
            <p className="text-[12px] text-fg-tertiary">{user?.email}</p>
            <span
              className={cn(
                'inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
                user?.role === 'admin'
                  ? 'bg-accent-soft text-accent-soft-fg'
                  : 'bg-surface-muted text-fg-tertiary'
              )}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-[400px]">
          <div>
            <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-[40px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full h-[40px] bg-surface-muted border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-disabled cursor-not-allowed"
            />
            <p className="text-[11px] text-fg-tertiary mt-1">
              Email cannot be changed
            </p>
          </div>

          <FeedbackMessage error={error} success={success} />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon={success ? <Check size={14} /> : undefined}
          >
            {success ? 'Saved' : 'Save changes'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

/* ─── Password Tab ─────────────────────────────────────────────────────────── */

const PasswordTab = () => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPwd !== confirm) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await changePassword(current, newPwd);
      setSuccess(true);
      setCurrent('');
      setNewPwd('');
      setConfirm('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-surface rounded-lg border-[0.5px] border-border p-6">
        <h3 className="text-[15px] font-medium text-fg-primary mb-5">
          Change Password
        </h3>

        <form onSubmit={handleSave} className="space-y-4 max-w-[400px]">
          <div>
            <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="w-full h-[40px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              minLength={6}
              className="w-full h-[40px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full h-[40px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[13px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <FeedbackMessage error={error} success={success} successMsg="Password changed successfully" />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
          >
            Change password
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

/* ─── Users Tab (Admin) ────────────────────────────────────────────────────── */

const UsersTab = () => {
  const { api, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api().get('/users', { params: { search: search || undefined } });
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full h-[34px] bg-surface border-[0.5px] border-border rounded-md pl-9 pr-3 text-[12px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus size={13} />}
          onClick={() => setShowCreate(!showCreate)}
        >
          Add user
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserForm
            onCreated={() => {
              setShowCreate(false);
              fetchUsers();
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>

      {/* Users table */}
      <div className="bg-surface rounded-lg border-[0.5px] border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_80px_60px] gap-3 px-4 py-2.5 border-b-[0.5px] border-border bg-surface-muted/50">
          <span className="text-[11px] font-medium text-fg-tertiary tracking-wide">USER</span>
          <span className="text-[11px] font-medium text-fg-tertiary tracking-wide">EMAIL</span>
          <span className="text-[11px] font-medium text-fg-tertiary tracking-wide">ROLE</span>
          <span />
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 size={18} className="animate-spin text-fg-tertiary" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-fg-tertiary">
            No users found
          </div>
        ) : (
          users.map((u, idx) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={u.id === currentUser?.id}
              onUpdated={fetchUsers}
              index={idx}
            />
          ))
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 border-t-[0.5px] border-border bg-surface-muted/30">
          <span className="text-[11px] text-fg-tertiary">{total} users total</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── User Row ─────────────────────────────────────────────────────────────── */

const UserRow = ({ user, isSelf, onUpdated, index }) => {
  const { api } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [changingRole, setChangingRole] = useState(false);

  const initials = (user.name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = async () => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api().delete(`/users/${user.id}`);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleToggle = async () => {
    setChangingRole(true);
    try {
      await api().patch(`/users/${user.id}`, {
        role: user.role === 'admin' ? 'user' : 'admin',
      });
      onUpdated();
    } catch {
      // ignore
    } finally {
      setChangingRole(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="grid grid-cols-[1fr_140px_80px_60px] gap-3 px-4 py-3 items-center border-b-[0.5px] border-border last:border-b-0 hover:bg-surface-muted/30 transition-colors"
    >
      {/* Name + avatar */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-[10px] font-medium text-accent-soft-fg flex-shrink-0">
          {initials}
        </div>
        <span className="text-[13px] font-medium text-fg-primary truncate">
          {user.name}
          {isSelf && (
            <span className="ml-1.5 text-[10px] text-fg-tertiary font-normal">(you)</span>
          )}
        </span>
      </div>

      {/* Email */}
      <span className="text-[12px] text-fg-secondary truncate">{user.email}</span>

      {/* Role */}
      <button
        onClick={handleRoleToggle}
        disabled={isSelf || changingRole}
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-all w-fit',
          user.role === 'admin'
            ? 'bg-accent-soft text-accent-soft-fg'
            : 'bg-surface-muted text-fg-tertiary',
          !isSelf && 'hover:opacity-80 cursor-pointer',
          isSelf && 'cursor-default'
        )}
      >
        {changingRole ? <Loader2 size={10} className="animate-spin" /> : null}
        {user.role}
      </button>

      {/* Actions */}
      <div className="flex justify-end">
        {!isSelf && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-danger hover:bg-danger-soft/50 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Create User Form ─────────────────────────────────────────────────────── */

const CreateUserForm = ({ onCreated, onCancel }) => {
  const { api } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api().post('/users', { name, email, password, role });
      onCreated();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-surface rounded-lg border-[0.5px] border-accent/30 p-5">
        <h4 className="text-[13px] font-medium text-fg-primary mb-4">
          Create new user
        </h4>

        {error && (
          <div className="bg-danger-soft/40 border-[0.5px] border-danger/20 rounded-md px-3 py-2 mb-4 flex items-center gap-2">
            <AlertCircle size={12} className="text-danger" />
            <span className="text-[11px] text-danger-soft-fg">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-fg-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-[36px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[12px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-fg-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[36px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[12px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-fg-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-[36px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[12px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-fg-secondary mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-[36px] bg-canvas border-[0.5px] border-border rounded-md px-3 text-[12px] text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-span-2 flex gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Create user
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

/* ─── Feedback Message ─────────────────────────────────────────────────────── */

const FeedbackMessage = ({ error, success, successMsg = 'Changes saved' }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-danger-soft/40 border-[0.5px] border-danger/20 rounded-md px-3 py-2 flex items-center gap-2">
          <AlertCircle size={12} className="text-danger" />
          <span className="text-[11px] text-danger-soft-fg">{error}</span>
        </div>
      </motion.div>
    )}
    {success && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-success-soft/40 border-[0.5px] border-success/20 rounded-md px-3 py-2 flex items-center gap-2">
          <Check size={12} className="text-success" />
          <span className="text-[11px] text-success-soft-fg">{successMsg}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SettingsPage;
