# Lumen — Design Package

Complete design spec + implementation kit for **Lumen**, an AI image intelligence platform.

---

## What's in this package

```
lumen-design/
├── README.md                                  ← you are here
├── 00-PROMPT-KIT.md                           ← copy-paste prompts for AI coding tools
├── 01-DESIGN-SPEC.md                          ← master specification (read first)
│
├── tokens/
│   ├── design-tokens.json                     ← machine-readable tokens
│   ├── globals.css                            ← drop into your app
│   └── tailwind.config.js                     ← drop into your project
│
├── components/
│   ├── 01-ui-primitives.spec.md               ← Button, Chip, Tag, Input, Modal, etc.
│   ├── 02-gallery.spec.md                     ← MasonryGrid, ImageTile, FilterChips
│   ├── 03-feature-components.spec.md          ← Timeline, Detail, Search, Upload, Analytics, Ops
│   └── 04-layout.spec.md                      ← AppShell, Sidebar, Topbar, CommandPalette
│
└── architecture/
    ├── storage-abstraction.md                 ← local-first storage with cloud placeholder
    ├── api-contract.md                        ← REST + WebSocket endpoints
    └── data-model.md                          ← PostgreSQL schema
```

---

## How to use with AI coding tools

### For Cursor / Claude Code

1. Put the entire `lumen-design/` folder at the root of your empty repo
2. Open Cursor / Claude Code in that repo
3. Start a chat and say:
   > "Read `lumen-design/00-PROMPT-KIT.md` and follow the 'Bootstrap' section. Implement step 1 only."
4. Review the output, then say "continue with step 2", etc.

### For v0.dev / Bolt.new / Lovable

1. Open `00-PROMPT-KIT.md`
2. Copy the "One-shot v0 prompt" section
3. Paste into v0.dev / Bolt, attach the files from `/tokens/` and relevant `/components/` spec

### For general LLM API calls

Feed `01-DESIGN-SPEC.md` as system context, then ask for specific screens or components.

---

## Core principles (remind the AI of these)

1. **Images are the hero.** UI is quiet, whitespace generous.
2. **One accent color.** Iris purple (`#534AB7`). No gradients, no glows.
3. **Only 400 and 500 font weights.** No 600/700. No italics.
4. **Sentence case everywhere.** No Title Case, no ALL CAPS.
5. **Hairline borders.** `0.5px solid var(--border)`, never thicker.
6. **Storage is abstracted.** Use `StorageProvider` interface — implement `LocalFilesystemStorage` first, leave cloud classes as stubs.
7. **Real-time via WebSocket.** Frontend subscribes to `image.analyzed` and triggers signature reveal animation.

---

## Tech stack (recommended)

**Frontend:** React 18 + TypeScript + Vite + Tailwind + Radix UI + cmdk + react-masonry-css + Zustand + TanStack Query + Recharts + Framer Motion

**Backend:** Spring Boot 3.2 (Java 21) **OR** FastAPI (Python 3.11+)

**Data:** PostgreSQL 16 + pgvector

**AI:** Ollama (vision) + Tesseract (OCR)

**Storage:** Local filesystem (dev), S3/GCS/Azure (prod — stubs ready)

---

## Quick start (if implementing from scratch)

```bash
# 1. Scaffold frontend
npm create vite@latest lumen-web -- --template react-ts
cd lumen-web
npm install tailwindcss @tailwindcss/forms lucide-react @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-popover \
  cmdk react-masonry-css zustand @tanstack/react-query react-router-dom \
  recharts framer-motion date-fns

# 2. Drop token files
cp ../lumen-design/tokens/tailwind.config.js ./
cp ../lumen-design/tokens/globals.css ./src/

# 3. Follow 01-DESIGN-SPEC.md section 12 ("Implementation priority")
```

Backend scaffolding is in `00-PROMPT-KIT.md`.

---

## Local-first storage (key detail)

No AWS account needed to develop. The app writes to `./storage/images/{year}/{month}/{day}/{uuid}.{ext}` and serves files via a Spring controller. When you're ready for cloud, implement one class (`S3Storage`), change one line in `application.yml`, restart. Zero other code changes. See `architecture/storage-abstraction.md`.
