import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Trash2,
  Zap,
  Shield,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { cn } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:8000/api/v1/telegram';

const TelegramConfigPage = () => {
  const { token, isAdmin } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [botToken, setBotToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch existing config
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API}/config`, { headers });
      setConfig(res.data);
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  // Test token
  const handleTest = async () => {
    if (!botToken.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post(`${API}/test`, { bot_token: botToken }, { headers });
      setTestResult(res.data);
    } catch (err) {
      setTestResult({
        success: false,
        error: err.response?.data?.detail || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  // Save config
  const handleSave = async () => {
    if (!botToken.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await axios.post(`${API}/config`, { bot_token: botToken }, { headers });
      setConfig(res.data);
      setBotToken('');
      setTestResult(null);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Disconnect Telegram bot? Images will no longer be received.')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/config`, { headers });
      setConfig(null);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-fg-tertiary" />
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#229ED9]/10 flex items-center justify-center">
            <Send size={18} className="text-[#229ED9]" />
          </div>
          <div>
            <h1 className="text-h1 font-medium text-fg-primary">Telegram Integration</h1>
            <p className="text-small text-fg-tertiary">
              Connect a Telegram bot to upload and analyze images directly from chat
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Card */}
      <AnimatePresence mode="wait">
        {config?.is_active ? (
          <ConnectedCard
            key="connected"
            config={config}
            onDisconnect={handleDisconnect}
            deleting={deleting}
          />
        ) : (
          <SetupCard
            key="setup"
            botToken={botToken}
            setBotToken={setBotToken}
            testing={testing}
            testResult={testResult}
            saving={saving}
            saveError={saveError}
            isAdmin={isAdmin}
            onTest={handleTest}
            onSave={handleSave}
            copyText={copyText}
            copied={copied}
          />
        )}
      </AnimatePresence>

      {/* How it works */}
      <HowItWorks />

      {/* Setup Guide */}
      <SetupGuide copyText={copyText} copied={copied} />
    </div>
  );
};

/* ─── Connected Card ───────────────────────────────────────────────────────── */

const ConnectedCard = ({ config, onDisconnect, deleting }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-surface rounded-xl border-[0.5px] border-success/30 overflow-hidden"
  >
    {/* Green status bar */}
    <div className="h-1 bg-gradient-to-r from-success via-success/80 to-success/40" />

    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 flex items-center justify-center">
            <Bot size={24} className="text-[#229ED9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-medium text-fg-primary">
                @{config.bot_username}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success-soft-fg text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Connected
              </span>
            </div>
            <p className="text-[12px] text-fg-tertiary mt-0.5">
              {config.bot_name} · Token: {config.bot_token_masked}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={13} />}
          className="text-danger hover:bg-danger-soft/30"
          onClick={onDisconnect}
          loading={deleting}
        >
          Disconnect
        </Button>
      </div>

      {/* Quick info */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <InfoBox
          icon={<ImageIcon size={14} />}
          label="Send photos"
          desc="Forward or send any image to the bot"
        />
        <InfoBox
          icon={<Sparkles size={14} />}
          label="Auto-analyzed"
          desc="AI processes images automatically"
        />
        <InfoBox
          icon={<Zap size={14} />}
          label="Instant sync"
          desc="Images appear in your gallery"
        />
      </div>

      {/* Bot link */}
      <div className="mt-4 p-3 bg-surface-muted/50 rounded-lg flex items-center justify-between">
        <span className="text-[12px] text-fg-secondary">
          Open bot in Telegram:
        </span>
        <a
          href={`https://t.me/${config.bot_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#229ED9] hover:underline"
        >
          t.me/{config.bot_username}
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  </motion.div>
);

const InfoBox = ({ icon, label, desc }) => (
  <div className="p-3 bg-surface-muted/40 rounded-lg">
    <div className="text-accent mb-1.5">{icon}</div>
    <p className="text-[12px] font-medium text-fg-primary">{label}</p>
    <p className="text-[11px] text-fg-tertiary leading-relaxed">{desc}</p>
  </div>
);

/* ─── Setup Card ───────────────────────────────────────────────────────────── */

const SetupCard = ({
  botToken, setBotToken, testing, testResult, saving, saveError,
  isAdmin, onTest, onSave, copyText, copied,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-surface rounded-xl border-[0.5px] border-border overflow-hidden"
  >
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key size={16} className="text-fg-tertiary" />
        <h3 className="text-[15px] font-medium text-fg-primary">Bot Token</h3>
      </div>

      <p className="text-[12px] text-fg-tertiary mb-4 leading-relaxed">
        Paste your Telegram Bot token below. You can get one from{' '}
        <a
          href="https://t.me/BotFather"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#229ED9] font-medium hover:underline"
        >
          @BotFather
        </a>{' '}
        on Telegram. See the guide below for step-by-step instructions.
      </p>

      {/* Token input */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
            className="w-full h-[42px] bg-canvas border-[0.5px] border-border rounded-lg px-3.5 pr-10 text-[13px] text-fg-primary font-mono placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-[#229ED9]/30 focus:border-[#229ED9] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Key size={14} className="text-fg-disabled" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="md"
          onClick={onTest}
          loading={testing}
          disabled={!botToken.trim()}
        >
          Test
        </Button>
      </div>

      {/* Test result */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div
              className={cn(
                'rounded-lg px-4 py-3 flex items-center gap-3 border-[0.5px]',
                testResult.success
                  ? 'bg-success-soft/30 border-success/20'
                  : 'bg-danger-soft/30 border-danger/20'
              )}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-success-soft-fg">
                      Connected to @{testResult.bot_username}
                    </p>
                    <p className="text-[11px] text-fg-tertiary">
                      {testResult.bot_name} — Token is valid and ready to save
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-danger flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-danger-soft-fg">
                      Connection failed
                    </p>
                    <p className="text-[11px] text-fg-tertiary">{testResult.error}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save error */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="bg-danger-soft/30 border-[0.5px] border-danger/20 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
              <AlertCircle size={13} className="text-danger flex-shrink-0" />
              <span className="text-[12px] text-danger-soft-fg">{saveError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={onSave}
          loading={saving}
          disabled={!botToken.trim() || !isAdmin}
          icon={<Send size={13} />}
        >
          Save & Connect
        </Button>
        {!isAdmin && (
          <span className="text-[11px] text-fg-tertiary flex items-center gap-1">
            <Shield size={11} />
            Admin access required to save
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

/* ─── How It Works ─────────────────────────────────────────────────────────── */

const HowItWorks = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-surface rounded-xl border-[0.5px] border-border p-6"
  >
    <h3 className="text-[15px] font-medium text-fg-primary mb-4">How it works</h3>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        {
          step: '1',
          icon: <Bot size={18} />,
          title: 'Create bot',
          desc: 'Get a bot token from @BotFather',
        },
        {
          step: '2',
          icon: <Key size={18} />,
          title: 'Paste token',
          desc: 'Enter the token above and test it',
        },
        {
          step: '3',
          icon: <ImageIcon size={18} />,
          title: 'Send photos',
          desc: 'Send or forward images to your bot',
        },
        {
          step: '4',
          icon: <Sparkles size={18} />,
          title: 'Auto-analyze',
          desc: 'AI tags, categorizes & extracts text',
        },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + idx * 0.06 }}
          className="relative text-center p-4"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-soft/60 flex items-center justify-center text-accent mx-auto mb-3">
            {item.icon}
          </div>
          <p className="text-[12px] font-medium text-fg-primary mb-0.5">{item.title}</p>
          <p className="text-[11px] text-fg-tertiary leading-relaxed">{item.desc}</p>

          {/* Arrow between steps */}
          {idx < 3 && (
            <ChevronRight
              size={14}
              className="absolute top-1/2 -right-3 -translate-y-1/2 text-border-strong hidden sm:block"
            />
          )}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

/* ─── Setup Guide (Accordion) ──────────────────────────────────────────────── */

const SetupGuide = ({ copyText, copied }) => {
  const [openStep, setOpenStep] = useState(null);

  const steps = [
    {
      id: 'create',
      title: 'Step 1: Create a Telegram Bot',
      content: (
        <div className="space-y-3 text-[12px] text-fg-secondary leading-relaxed">
          <p>
            1. Open Telegram and search for{' '}
            <CopyableCode text="@BotFather" copyText={copyText} copied={copied} /> or click{' '}
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#229ED9] hover:underline">
              this link
            </a>
          </p>
          <p>2. Send the command <CopyableCode text="/newbot" copyText={copyText} copied={copied} /></p>
          <p>3. Choose a <strong>display name</strong> for your bot (e.g., "My Lumen Bot")</p>
          <p>
            4. Choose a <strong>username</strong> ending in "bot" (e.g.,{' '}
            <CopyableCode text="my_lumen_bot" copyText={copyText} copied={copied} />)
          </p>
          <p>5. BotFather will reply with your bot token — it looks like:</p>
          <div className="bg-surface-muted rounded-md p-3 font-mono text-[11px] text-fg-primary">
            123456789:ABCdefGHIjklMNOpqrsTUVwxyz
          </div>
        </div>
      ),
    },
    {
      id: 'token',
      title: 'Step 2: Copy and Paste the Token',
      content: (
        <div className="space-y-3 text-[12px] text-fg-secondary leading-relaxed">
          <p>1. Copy the entire token from BotFather's message</p>
          <p>2. Paste it in the "Bot Token" field above</p>
          <p>3. Click <strong>"Test"</strong> to verify the connection</p>
          <p>4. If the test passes, click <strong>"Save & Connect"</strong></p>
          <div className="bg-info-soft/30 rounded-md p-3 flex items-start gap-2">
            <Shield size={13} className="text-info mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-info-soft-fg">
              Your token is stored securely and never exposed in the UI. Only admins can configure the bot.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'use',
      title: 'Step 3: Start Sending Images',
      content: (
        <div className="space-y-3 text-[12px] text-fg-secondary leading-relaxed">
          <p>Once connected, you can:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Send any photo directly to your bot</li>
            <li>Forward images from other chats to the bot</li>
            <li>Send multiple photos at once</li>
          </ul>
          <p>
            Each image will be automatically downloaded, saved to your workspace, and analyzed by the AI pipeline
            (categorization, OCR text extraction, smart tagging).
          </p>
          <p>
            Processed images will appear in your <strong>Gallery</strong> and <strong>Timeline</strong> with source
            marked as "telegram".
          </p>
        </div>
      ),
    },
    {
      id: 'webhook',
      title: 'Step 4: Webhook Setup (Production)',
      content: (
        <div className="space-y-3 text-[12px] text-fg-secondary leading-relaxed">
          <p>
            For the bot to receive messages in real-time, your server needs to be publicly accessible.
            In local development, you can use <strong>ngrok</strong> or <strong>Cloudflare Tunnel</strong>:
          </p>
          <div className="bg-surface-muted rounded-md p-3 font-mono text-[11px] text-fg-primary space-y-1">
            <p># Install ngrok and run:</p>
            <p>ngrok http 8000</p>
            <p># Then update the webhook URL in the backend</p>
          </div>
          <p>
            In production, the webhook is automatically registered when you save the config. Make sure your
            server has a valid HTTPS URL.
          </p>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-surface rounded-xl border-[0.5px] border-border overflow-hidden"
    >
      <div className="p-6 pb-0">
        <h3 className="text-[15px] font-medium text-fg-primary mb-1">Setup Guide</h3>
        <p className="text-[12px] text-fg-tertiary mb-4">
          Follow these steps to create and connect your Telegram bot
        </p>
      </div>

      <div className="divide-y divide-border">
        {steps.map((step) => (
          <div key={step.id}>
            <button
              onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
              className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface-muted/30 transition-colors"
            >
              <span className="text-[13px] font-medium text-fg-primary text-left">
                {step.title}
              </span>
              <motion.div
                animate={{ rotate: openStep === step.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-fg-tertiary" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openStep === step.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5">{step.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Copyable Code Snippet ────────────────────────────────────────────────── */

const CopyableCode = ({ text, copyText, copied }) => (
  <button
    onClick={() => copyText(text, text)}
    className="inline-flex items-center gap-1 bg-surface-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-fg-primary hover:bg-accent-soft/50 transition-colors"
  >
    {text}
    {copied === text ? (
      <CheckCircle2 size={10} className="text-success" />
    ) : (
      <Copy size={10} className="text-fg-tertiary" />
    )}
  </button>
);

export default TelegramConfigPage;
