import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Image as ImageIcon,
  Users,
  Layers,
  TrendingUp,
  Tag as TagIcon,
  RefreshCw,
  Loader2,
  AlertCircle,
  Upload,
  Send,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../components/ui/Button';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    setError(null);
    try {
      const [statsRes, trendRes, tagsRes, usersRes] = await Promise.allSettled([
        axios.get('/api/v1/analytics/stats'),
        axios.get('/api/v1/analytics/images/trend'),
        axios.get('/api/v1/analytics/tags/top'),
        axios.get('/api/v1/analytics/users/activity'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data);
      if (tagsRes.status === 'fulfilled') setTopTags(tagsRes.value.data);
      if (usersRes.status === 'fulfilled') setUserActivity(usersRes.value.data);
    } catch {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-fg-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-h1 font-medium text-fg-primary">Analytics</h1>
          <p className="text-small text-fg-tertiary mt-1">
            Platform overview and usage insights
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </motion.div>

      {error && (
        <div className="bg-danger-soft/40 border border-danger/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-danger" />
          <span className="text-[13px] text-danger-soft-fg">{error}</span>
        </div>
      )}

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              icon={<ImageIcon size={16} />}
              label="Total Images"
              value={stats.total_images}
              color="accent"
              delay={0}
            />
            <KpiCard
              icon={<Users size={16} />}
              label="Users"
              value={stats.total_users}
              color="info"
              delay={0.05}
            />
            <KpiCard
              icon={<Layers size={16} />}
              label="Workspaces"
              value={stats.total_workspaces}
              color="success"
              delay={0.1}
            />
            <KpiCard
              icon={<CheckCircle2 size={16} />}
              label="Analyzed"
              value={stats.images_by_status?.analyzed || 0}
              color="success"
              delay={0.15}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status breakdown */}
            <ChartCard title="Images by Status" icon={<BarChart3 size={14} />} delay={0.1}>
              <StatusBreakdown data={stats.images_by_status} total={stats.total_images} />
            </ChartCard>

            {/* Source breakdown */}
            <ChartCard title="Upload Sources" icon={<Globe size={14} />} delay={0.15}>
              <SourceBreakdown data={stats.images_by_source} total={stats.total_images} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category breakdown */}
            <ChartCard title="Categories" icon={<Layers size={14} />} delay={0.2}>
              <CategoryBreakdown data={stats.images_by_category} />
            </ChartCard>

            {/* Upload trend */}
            <ChartCard title="Upload Trend" icon={<TrendingUp size={14} />} delay={0.25}>
              <UploadTrend data={trend} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top tags */}
            <ChartCard title="Top Tags" icon={<TagIcon size={14} />} delay={0.3}>
              <TopTags data={topTags} />
            </ChartCard>

            {/* User activity */}
            <ChartCard title="Top Contributors" icon={<Users size={14} />} delay={0.35}>
              <UserActivityList data={userActivity} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── KPI Card ─────────────────────────────────────────────────────────────── */

const KpiCard = ({ icon, label, value, color, delay }) => {
  const colors = {
    accent: 'bg-accent-soft text-accent',
    info: 'bg-info-soft text-info',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface rounded-xl border border-border p-4"
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', colors[color])}>
        {icon}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.15 }}
        className="text-[24px] font-semibold text-fg-primary tabular-nums"
      >
        {value.toLocaleString()}
      </motion.p>
      <p className="text-[12px] text-fg-tertiary mt-0.5">{label}</p>
    </motion.div>
  );
};

/* ─── Chart Card wrapper ───────────────────────────────────────────────────── */

const ChartCard = ({ title, icon, delay, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="bg-surface rounded-xl border border-border p-5"
  >
    <h3 className="text-[13px] font-medium text-fg-primary flex items-center gap-2 mb-4">
      <span className="text-fg-tertiary">{icon}</span>
      {title}
    </h3>
    {children}
  </motion.div>
);

/* ─── Status Breakdown ─────────────────────────────────────────────────────── */

const statusMeta = {
  analyzed: { icon: CheckCircle2, color: 'bg-success', text: 'text-success' },
  processing: { icon: Clock, color: 'bg-warning', text: 'text-warning' },
  queued: { icon: HelpCircle, color: 'bg-fg-tertiary', text: 'text-fg-tertiary' },
  failed: { icon: XCircle, color: 'bg-danger', text: 'text-danger' },
};

const StatusBreakdown = ({ data, total }) => {
  if (!data || Object.keys(data).length === 0) return <EmptyChart />;

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([status, count], i) => {
        const meta = statusMeta[status] || statusMeta.queued;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const Icon = meta.icon;
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn('flex items-center gap-1.5 text-[12px] font-medium capitalize', meta.text)}>
                <Icon size={12} />
                {status}
              </span>
              <span className="text-[11px] text-fg-tertiary tabular-nums">
                {count} ({pct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-[6px] bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={cn('h-full rounded-full', meta.color)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Source Breakdown ──────────────────────────────────────────────────────── */

const sourceMeta = {
  web: { icon: Upload, color: 'bg-accent', label: 'Web Upload' },
  telegram: { icon: Send, color: 'bg-info', label: 'Telegram' },
  api: { icon: Globe, color: 'bg-success', label: 'API' },
};

const SourceBreakdown = ({ data, total }) => {
  if (!data || Object.keys(data).length === 0) return <EmptyChart />;

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([source, count], i) => {
        const meta = sourceMeta[source] || { icon: Globe, color: 'bg-fg-tertiary', label: source };
        const pct = total > 0 ? (count / total) * 100 : 0;
        const Icon = meta.icon;
        return (
          <motion.div
            key={source}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-fg-primary">
                <Icon size={12} className="text-fg-tertiary" />
                {meta.label}
              </span>
              <span className="text-[11px] text-fg-tertiary tabular-nums">
                {count} ({pct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-[6px] bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={cn('h-full rounded-full', meta.color)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Category Breakdown ───────────────────────────────────────────────────── */

const categoryColors = {
  receipt: { bg: 'bg-warning-soft', text: 'text-warning-soft-fg', bar: 'bg-warning' },
  screenshot: { bg: 'bg-info-soft', text: 'text-info-soft-fg', bar: 'bg-info' },
  document: { bg: 'bg-accent-soft', text: 'text-accent-soft-fg', bar: 'bg-accent' },
  photo: { bg: 'bg-success-soft', text: 'text-success-soft-fg', bar: 'bg-success' },
};

const CategoryBreakdown = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return <EmptyChart />;
  const max = Math.max(...Object.values(data));

  return (
    <div className="space-y-2.5">
      {Object.entries(data).map(([cat, count], i) => {
        const c = categoryColors[cat] || categoryColors.photo;
        const pct = max > 0 ? (count / max) * 100 : 0;
        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className={cn('text-[11px] font-medium capitalize w-20 text-right', c.text)}>
              {cat}
            </span>
            <div className="flex-1 h-[8px] bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={cn('h-full rounded-full', c.bar)}
              />
            </div>
            <span className="text-[11px] text-fg-tertiary tabular-nums w-8">{count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Upload Trend (mini bar chart) ────────────────────────────────────────── */

const UploadTrend = ({ data }) => {
  if (!data || data.length === 0) return <EmptyChart message="No upload data yet" />;
  const max = Math.max(...data.map((d) => d.count), 1);
  const recent = data.slice(-14); // last 14 days

  return (
    <div>
      <div className="flex items-end gap-[3px] h-[100px]">
        {recent.map((d, i) => (
          <motion.div
            key={d.date}
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 bg-accent/70 rounded-t-sm min-h-[2px] hover:bg-accent transition-colors cursor-default group relative"
            title={`${d.date}: ${d.count}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-fg-tertiary">{recent[0]?.date}</span>
        <span className="text-[10px] text-fg-tertiary">{recent[recent.length - 1]?.date}</span>
      </div>
    </div>
  );
};

/* ─── Top Tags ─────────────────────────────────────────────────────────────── */

const TopTags = ({ data }) => {
  if (!data || data.length === 0) return <EmptyChart message="No tags yet" />;

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
        >
          <div className="flex items-center gap-1.5">
            <Tag tone={t.tone || 'gray'} size="sm">
              {t.label}
            </Tag>
            <span className="text-[10px] text-fg-tertiary tabular-nums">×{t.usage}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ─── User Activity ────────────────────────────────────────────────────────── */

const UserActivityList = ({ data }) => {
  if (!data || data.length === 0) return <EmptyChart message="No user activity" />;

  return (
    <div className="space-y-2">
      {data.map((u, i) => {
        const initials = (u.name || '?')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        return (
          <motion.div
            key={u.user_id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-muted/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-[10px] font-medium text-accent-soft-fg flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-fg-primary truncate">{u.name}</p>
              <p className="text-[11px] text-fg-tertiary truncate">{u.email}</p>
            </div>
            <span className="text-[12px] font-medium text-fg-primary tabular-nums">
              {u.image_count}
            </span>
            <span className="text-[10px] text-fg-tertiary">images</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Empty Chart ──────────────────────────────────────────────────────────── */

const EmptyChart = ({ message = 'No data available' }) => (
  <div className="flex items-center justify-center py-8 text-[12px] text-fg-tertiary">
    {message}
  </div>
);

export default AnalyticsPage;
