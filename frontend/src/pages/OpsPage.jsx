import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Heart,
  Server,
  Cpu,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Database,
  Globe,
  Terminal,
  Image as ImageIcon,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { cn } from '../components/ui/Button';

const OpsPage = () => {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [pingMs, setPingMs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pingHistory, setPingHistory] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const start = performance.now();
      const [healthRes, infoRes] = await Promise.all([
        axios.get('/api/v1/ops/health'),
        axios.get('/api/v1/ops/info'),
      ]);
      const latency = Math.round(performance.now() - start);

      setHealth(healthRes.data);
      setInfo(infoRes.data);
      setPingMs(latency);
      setPingHistory((prev) => [...prev.slice(-29), { time: Date.now(), ms: latency }]);
    } catch {
      setHealth(null);
      setPingMs(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handlePing = async () => {
    const start = performance.now();
    try {
      await axios.get('/api/v1/ops/ping');
      const ms = Math.round(performance.now() - start);
      setPingMs(ms);
      setPingHistory((prev) => [...prev.slice(-29), { time: Date.now(), ms }]);
    } catch {
      setPingMs(null);
    }
  };

  const isOnline = health?.status === 'ok';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-fg-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-h1 font-medium text-fg-primary">Operations</h1>
            <StatusBadge online={isOnline} />
          </div>
          <p className="text-small text-fg-tertiary">
            System health, performance, and runtime information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all border',
              autoRefresh
                ? 'bg-success-soft border-success/30 text-success-soft-fg'
                : 'bg-surface border-border text-fg-tertiary hover:text-fg-secondary'
            )}
          >
            <div className={cn('w-1.5 h-1.5 rounded-full', autoRefresh ? 'bg-success animate-pulse' : 'bg-fg-disabled')} />
            Auto-refresh
          </button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatusCard
          icon={<Heart size={16} />}
          label="Health"
          value={isOnline ? 'Healthy' : 'Offline'}
          color={isOnline ? 'success' : 'danger'}
          delay={0}
        />
        <StatusCard
          icon={<Zap size={16} />}
          label="Latency"
          value={pingMs !== null ? `${pingMs}ms` : '—'}
          color={pingMs !== null && pingMs < 200 ? 'success' : pingMs !== null && pingMs < 500 ? 'warning' : 'danger'}
          delay={0.05}
        />
        <StatusCard
          icon={<Server size={16} />}
          label="Version"
          value={info?.version || '—'}
          color="accent"
          delay={0.1}
        />
        <StatusCard
          icon={<Cpu size={16} />}
          label="Platform"
          value={info?.architecture || '—'}
          color="info"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ping chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-surface rounded-xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium text-fg-primary flex items-center gap-2">
              <Activity size={14} className="text-fg-tertiary" />
              Latency Monitor
            </h3>
            <Button variant="ghost" size="sm" onClick={handlePing}>
              Ping
            </Button>
          </div>

          {pingHistory.length > 0 ? (
            <div>
              <div className="flex items-end gap-[2px] h-[80px]">
                {pingHistory.map((p, i) => {
                  const max = Math.max(...pingHistory.map((h) => h.ms), 1);
                  const pct = (p.ms / max) * 100;
                  const color = p.ms < 100 ? 'bg-success' : p.ms < 300 ? 'bg-warning' : 'bg-danger';
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn('flex-1 rounded-t-sm min-h-[2px]', color)}
                      title={`${p.ms}ms`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-fg-tertiary">
                  Min: {Math.min(...pingHistory.map((p) => p.ms))}ms
                </span>
                <span className="text-[10px] text-fg-tertiary">
                  Avg: {Math.round(pingHistory.reduce((a, b) => a + b.ms, 0) / pingHistory.length)}ms
                </span>
                <span className="text-[10px] text-fg-tertiary">
                  Max: {Math.max(...pingHistory.map((p) => p.ms))}ms
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[80px] text-[12px] text-fg-tertiary">
              Click "Ping" to start monitoring
            </div>
          )}
        </motion.div>

        {/* System info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-surface rounded-xl border border-border p-5"
        >
          <h3 className="text-[13px] font-medium text-fg-primary flex items-center gap-2 mb-4">
            <Terminal size={14} className="text-fg-tertiary" />
            System Information
          </h3>

          {info ? (
            <div className="space-y-2.5">
              <InfoRow label="Application" value={info.app} />
              <InfoRow label="Version" value={info.version} />
              <InfoRow label="Status" value={info.status} badge={info.status === 'running' ? 'success' : 'danger'} />
              <InfoRow label="Server Time" value={new Date(info.server_time_utc).toLocaleString()} />
              <InfoRow label="Python" value={info.python_version?.split(' ')[0]} />
              <InfoRow label="Platform" value={info.platform} />
              <InfoRow label="Architecture" value={info.architecture} />
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-[12px] text-fg-tertiary">
              Backend unreachable
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Processing Progress */}
      <ProcessingProgress />

      {/* Endpoints health */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-surface rounded-xl border border-border p-5"
      >
        <h3 className="text-[13px] font-medium text-fg-primary flex items-center gap-2 mb-4">
          <Globe size={14} className="text-fg-tertiary" />
          Endpoint Health
        </h3>
        <EndpointChecker />
      </motion.div>
    </div>
  );
};

/* ─── Status Badge ─────────────────────────────────────────────────────────── */

const StatusBadge = ({ online }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
      online ? 'bg-success-soft text-success-soft-fg' : 'bg-danger-soft text-danger-soft-fg'
    )}
  >
    <span className={cn('w-1.5 h-1.5 rounded-full', online ? 'bg-success animate-pulse' : 'bg-danger')} />
    {online ? 'Online' : 'Offline'}
  </motion.span>
);

/* ─── Status Card ──────────────────────────────────────────────────────────── */

const StatusCard = ({ icon, label, value, color, delay }) => {
  const colors = {
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    warning: 'bg-warning-soft text-warning',
    accent: 'bg-accent-soft text-accent',
    info: 'bg-info-soft text-info',
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
      <p className="text-[18px] font-semibold text-fg-primary">{value}</p>
      <p className="text-[11px] text-fg-tertiary mt-0.5">{label}</p>
    </motion.div>
  );
};

/* ─── Info Row ─────────────────────────────────────────────────────────────── */

const InfoRow = ({ label, value, badge }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
    <span className="text-[12px] text-fg-tertiary">{label}</span>
    <span className="text-[12px] font-medium text-fg-primary flex items-center gap-1.5">
      {badge && (
        <span className={cn('w-1.5 h-1.5 rounded-full', badge === 'success' ? 'bg-success' : 'bg-danger')} />
      )}
      {value}
    </span>
  </div>
);

/* ─── Endpoint Checker ─────────────────────────────────────────────────────── */

const ENDPOINTS = [
  { path: '/api/v1/ops/health', label: 'Health Check', method: 'GET' },
  { path: '/api/v1/ops/ping', label: 'Ping', method: 'GET' },
  { path: '/api/v1/ops/info', label: 'System Info', method: 'GET' },
  { path: '/api/v1/images', label: 'Images API', method: 'GET' },
  { path: '/api/v1/search/tags', label: 'Tags API', method: 'GET' },
  { path: '/api/v1/analytics/stats', label: 'Analytics API', method: 'GET' },
];

const EndpointChecker = () => {
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    const newResults = {};
    for (const ep of ENDPOINTS) {
      const start = performance.now();
      try {
        const res = await axios.get(ep.path);
        newResults[ep.path] = {
          status: res.status,
          ms: Math.round(performance.now() - start),
          ok: true,
        };
      } catch (err) {
        newResults[ep.path] = {
          status: err.response?.status || 0,
          ms: Math.round(performance.now() - start),
          ok: false,
        };
      }
    }
    setResults(newResults);
    setChecking(false);
  };

  useEffect(() => {
    checkAll();
  }, []);

  return (
    <div>
      <div className="space-y-1.5">
        {ENDPOINTS.map((ep, i) => {
          const r = results[ep.path];
          return (
            <motion.div
              key={ep.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-surface-muted/30 transition-colors"
            >
              {r ? (
                r.ok ? (
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-danger flex-shrink-0" />
                )
              ) : (
                <div className="w-3.5 h-3.5 rounded-full shimmer flex-shrink-0" />
              )}
              <span className="text-[11px] font-mono text-fg-tertiary w-10">{ep.method}</span>
              <span className="text-[12px] text-fg-primary flex-1">{ep.label}</span>
              <span className="text-[11px] font-mono text-fg-tertiary">{ep.path}</span>
              {r && (
                <span className={cn('text-[11px] tabular-nums font-medium', r.ok ? 'text-success' : 'text-danger')}>
                  {r.status} · {r.ms}ms
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={checkAll} loading={checking}>
          Re-check all
        </Button>
      </div>
    </div>
  );
};

/* ─── AI Processing Progress ───────────────────────────────────────────────── */

const ProcessingProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await axios.get('/api/v1/ops/progress');
      setProgress(res.data);
    } catch {
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
    const id = setInterval(fetchProgress, 3000);
    return () => clearInterval(id);
  }, [fetchProgress]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await axios.post('/api/v1/ops/retry-failed');
      await fetchProgress();
    } catch {
      // ignore
    } finally {
      setRetrying(false);
    }
  };

  if (loading || !progress) return null;

  const { total, queued, processing, analyzed, failed, percent_done, recent_failures } = progress;
  const inProgress = queued + processing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.4 }}
      className="bg-surface rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium text-fg-primary flex items-center gap-2">
          <ImageIcon size={14} className="text-fg-tertiary" />
          AI Processing Progress
        </h3>
        <div className="flex items-center gap-2">
          {failed > 0 && (
            <Button variant="ghost" size="sm" onClick={handleRetry} loading={retrying}>
              <RotateCcw size={12} className="mr-1" />
              Retry {failed} failed
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={fetchProgress}>
            <RefreshCw size={12} />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-fg-tertiary">
            {analyzed} / {total} analyzed
          </span>
          <span className="text-[12px] font-semibold text-fg-primary">{percent_done}%</span>
        </div>
        <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden flex">
          {analyzed > 0 && (
            <div
              className="bg-success transition-all duration-500 rounded-l-full"
              style={{ width: `${(analyzed / total) * 100}%` }}
            />
          )}
          {processing > 0 && (
            <div
              className="bg-accent animate-pulse"
              style={{ width: `${(processing / total) * 100}%` }}
            />
          )}
          {queued > 0 && (
            <div
              className="bg-fg-disabled/30"
              style={{ width: `${(queued / total) * 100}%` }}
            />
          )}
          {failed > 0 && (
            <div
              className="bg-danger rounded-r-full"
              style={{ width: `${(failed / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="text-center">
          <p className="text-[16px] font-semibold text-success">{analyzed}</p>
          <p className="text-[10px] text-fg-tertiary">Analyzed</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-accent">{processing}</p>
          <p className="text-[10px] text-fg-tertiary">Processing</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-fg-tertiary">{queued}</p>
          <p className="text-[10px] text-fg-tertiary">Queued</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-danger">{failed}</p>
          <p className="text-[10px] text-fg-tertiary">Failed</p>
        </div>
      </div>

      {/* Active indicator */}
      {inProgress > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-soft rounded-lg">
          <Loader2 size={13} className="animate-spin text-accent" />
          <span className="text-[11px] text-accent font-medium">
            AI is processing {inProgress} image{inProgress > 1 ? 's' : ''}…
          </span>
        </div>
      )}

      {/* Recent failures */}
      {recent_failures?.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] text-fg-tertiary flex items-center gap-1 mb-1">
            <AlertTriangle size={11} /> Recent failures
          </p>
          {recent_failures.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 bg-danger-soft/30 rounded text-[11px]">
              <XCircle size={11} className="text-danger flex-shrink-0" />
              <span className="text-fg-secondary truncate flex-1">{f.filename}</span>
              <span className="text-fg-tertiary truncate max-w-[200px]">{f.reason}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OpsPage;
