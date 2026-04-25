import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  X,
  Filter as FilterIcon,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Clock,
  Tag as TagIcon,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Chip from '../components/ui/Chip';
import Tag from '../components/ui/Tag';
import { cn } from '../components/ui/Button';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'receipt', label: 'Receipts' },
  { id: 'screenshot', label: 'Screenshots' },
  { id: 'document', label: 'Documents' },
  { id: 'photo', label: 'Photos' },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  // Fetch all tags on mount
  useEffect(() => {
    axios.get('/api/v1/search/tags').then((r) => setTags(r.data)).catch(() => {});
    inputRef.current?.focus();
  }, []);

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('/api/v1/search/suggestions', { params: { q: query } });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const doSearch = useCallback(
    async (q, cat) => {
      const term = q || query;
      if (!term.trim()) return;
      setLoading(true);
      setShowSuggestions(false);
      try {
        const params = { q: term, limit: 50 };
        if (cat && cat !== 'all') params.category = cat;
        else if (category !== 'all') params.category = category;
        const res = await axios.get('/api/v1/search', { params });
        setResults(res.data);
      } catch {
        setResults({ query: term, total: 0, items: [] });
      } finally {
        setLoading(false);
      }
    },
    [query, category]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  const handleTagClick = (label) => {
    setQuery(label);
    doSearch(label);
  };

  const handleSuggestionClick = (s) => {
    setQuery(s);
    doSearch(s);
  };

  const handleCategoryChange = (id) => {
    setCategory(id);
    if (results) doSearch(query, id);
  };

  const statusColors = {
    analyzed: 'bg-success',
    processing: 'bg-warning',
    failed: 'bg-danger',
    queued: 'bg-fg-tertiary',
  };

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-h1 font-medium text-fg-primary">Search</h1>
        <p className="text-small text-fg-tertiary mt-1">
          Find images by filename, AI summary, OCR text, or tags
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative"
      >
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-tertiary"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => query.length > 0 && setShowSuggestions(true)}
              placeholder="Search images, tags, text content…"
              className="w-full h-[48px] bg-surface border border-border rounded-xl pl-11 pr-20 text-[14px] text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults(null);
                    inputRef.current?.focus();
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors"
                >
                  <X size={14} />
                </motion.button>
              )}
              <kbd className="hidden sm:flex h-[22px] px-1.5 rounded border border-border bg-surface-muted text-[10px] font-mono text-fg-tertiary items-center">
                ↵
              </kbd>
            </div>
          </div>
        </form>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-e-3 overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-fg-secondary hover:bg-surface-muted transition-colors text-left"
                >
                  <TagIcon size={12} className="text-fg-tertiary flex-shrink-0" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
      >
        <FilterIcon size={13} className="text-fg-tertiary flex-shrink-0" />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            onClick={() => handleCategoryChange(c.id)}
          >
            {c.label}
          </Chip>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 size={24} className="animate-spin text-fg-tertiary" />
          </motion.div>
        ) : results ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-fg-tertiary">
                <span className="font-medium text-fg-primary">{results.total}</span>{' '}
                {results.total === 1 ? 'result' : 'results'} for "
                <span className="font-medium text-fg-primary">{results.query}</span>"
              </p>
            </div>

            {results.items.length === 0 ? (
              <SearchEmpty query={results.query} />
            ) : (
              <div className="space-y-2">
                {results.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    onClick={() => navigate('/gallery')}
                    className="group bg-surface rounded-lg border border-border p-4 flex gap-4 cursor-pointer hover:border-border-strong hover:shadow-e-1 transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                      {item.category === 'document' ? (
                        <FileText size={16} className="text-info" />
                      ) : item.category === 'receipt' ? (
                        <FileText size={16} className="text-warning" />
                      ) : (
                        <ImageIcon size={16} className="text-accent" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn('w-[6px] h-[6px] rounded-full flex-shrink-0', statusColors[item.status])} />
                        <h4 className="text-[13px] font-medium text-fg-primary truncate">
                          {item.filename}
                        </h4>
                        <span className="text-[11px] text-fg-tertiary flex-shrink-0 tabular-nums">
                          {formatDistanceToNow(new Date(item.uploaded_at), { addSuffix: true })}
                        </span>
                      </div>

                      {item.ai_summary && (
                        <p className="text-[12px] text-fg-secondary line-clamp-2 mb-2 leading-relaxed">
                          {item.ai_summary}
                        </p>
                      )}

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 5).map((t) => (
                            <Tag key={t} tone="gray" size="xs">
                              {t}
                            </Tag>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="text-[10px] text-fg-tertiary self-center">
                              +{item.tags.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={14} className="text-fg-tertiary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Initial state — show popular tags */
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {tags.length > 0 && (
              <div>
                <h3 className="text-[12px] font-medium text-fg-tertiary tracking-wide mb-3">
                  BROWSE BY TAG
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Chip tone={t.tone || 'default'} onClick={() => handleTagClick(t.label)}>
                        {t.label}
                      </Chip>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <SearchTips />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchEmpty = ({ query }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mb-4">
      <SearchIcon size={24} className="text-fg-tertiary" />
    </div>
    <h3 className="text-[15px] font-medium text-fg-primary mb-1">No results found</h3>
    <p className="text-[12px] text-fg-tertiary max-w-[300px]">
      No images match "{query}". Try a different keyword or browse by tags.
    </p>
  </motion.div>
);

const SearchTips = () => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <h3 className="text-[13px] font-medium text-fg-primary mb-3 flex items-center gap-2">
      <Sparkles size={14} className="text-accent" />
      Search tips
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-fg-secondary">
      <div className="flex items-start gap-2">
        <span className="text-fg-tertiary mt-0.5">•</span>
        <span>Search by <strong>filename</strong> — e.g. "receipt_march"</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-fg-tertiary mt-0.5">•</span>
        <span>Search by <strong>AI summary</strong> — e.g. "coffee shop"</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-fg-tertiary mt-0.5">•</span>
        <span>Search by <strong>OCR text</strong> — e.g. "$42.50"</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-fg-tertiary mt-0.5">•</span>
        <span>Search by <strong>tag</strong> — click any tag above</span>
      </div>
    </div>
  </div>
);

export default SearchPage;
