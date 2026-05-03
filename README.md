# DevFlow — Developer Productivity Dashboard

> Intern Assignment MVP — Turn raw engineering metrics into actionable insights.

---

## What This Is

DevFlow helps individual contributors and managers move from **raw metrics → understanding → action**. Instead of just showing numbers, it interprets what those numbers mean together and suggests concrete next steps.

Built for the intern assignment at the company. Full-stack, two views, 5 metrics, rule-based AI interpretation, dark/light mode.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 16.2** | Latest stable (March 2026). App Router, Turbopack, no middleware — uses `proxy.ts` |
| UI | **React 19.2** | Server Components, no forwardRef, React Compiler ready |
| Styling | **Tailwind CSS v4** | CSS-first config (`@theme` in globals.css), no `tailwind.config.js` |
| Fonts | **Syne + Space Mono + Instrument Serif** | Editorial display + data mono + readable body |
| Components | Custom (no shadcn) | Full control, no upgrade hell |
| Charts | **Recharts 2.15** | Declarative, React-native, recharts |
| Icons | **Lucide React** | Consistent, tree-shakeable |
| Animations | **tw-animate-css** | Tailwind v4 compatible (replaces tailwindcss-animate) |
| Toasts | **Sonner** | Replaces deprecated shadcn toast |
| Theme | **next-themes** | SSR-safe dark/light mode with `class` strategy |
| TypeScript | **5.8** | Strict mode throughout |
| Package manager | **pnpm** | Fast, disk-efficient |
| Node | **≥ 20** | Required for Next.js 16 |

**No login / auth needed** — this is a mock data MVP. No database, no Supabase. If you add real auth later, use Supabase Auth only.

**Security notes applied:**
- No secret keys in client code
- API routes validate inputs (404 on unknown devId)
- No user-provided data reaches the calculation engine (all mock)
- CSP-friendly — no inline scripts
- Dependencies pinned to avoid supply-chain issues

---

## Features

### IC Dashboard (main page `/`)
- [x] Developer selector — switch between 5 team members
- [x] Period selector — May 2026 or April 2026
- [x] All 5 metrics: Lead Time, Cycle Time, Bug Rate, Deploy Frequency, PR Throughput
- [x] Status badge per metric (healthy / warning / critical) with color-coded thresholds
- [x] Overall status roll-up badge
- [x] Month-over-month trend arrow + delta percentage
- [x] Flagged metrics highlighted with accent border
- [x] AI interpretation — rule-based story from metric combination
- [x] Next steps — 1-3 prioritised action items per priority
- [x] Loading skeletons during API fetch
- [x] Error state with retry
- [x] URL is shareable — dev + period synced to query params
- [x] Fully responsive (mobile → desktop)

### Manager View (`/manager`)
- [x] Team table — all 5 developers, all 5 metrics in one view
- [x] Status dots on each row (critical / warning / healthy)
- [x] Flagged cells highlighted in red
- [x] Summary pills (how many critical / warning / healthy)
- [x] 5 bar charts — one per metric, colour-coded by status
- [x] Link from each row to the developer's IC dashboard
- [x] Period selector
- [x] Responsive + horizontal scroll on small screens

### Global
- [x] Dark mode + light mode (persistent, system-aware)
- [x] Syne display font + Space Mono for data labels
- [x] Consistent design language throughout
- [x] No layout shift on theme toggle
- [x] Accessible — ARIA labels, keyboard-navigable selectors
- [x] TypeScript strict mode end-to-end

---

## Mock Data

All data lives in `src/data/` as JSON files — these simulate the "separate systems" described in the assignment:

| File | Simulates | Records |
|------|-----------|---------|
| `developers.json` | Developer dimension (Jira/Github user table) | 5 developers |
| `issues.json` | Jira-like issue tracking (In Progress → Done) | 58 issues, 2 months |
| `pull-requests.json` | GitHub/GitLab PR data (opened → merged) | 58 PRs, 2 months |
| `deployments.json` | CI/CD deployment log (success/fail per PR) | 57 deployments, 2 months |
| `bugs.json` | Post-release bug reports (linked to dev + month) | 16 bugs, 2 months |

### The 5 developers

| Name | Team | Role | May 2026 story |
|------|------|------|----------------|
| Arjun Sharma | Platform | Senior | Solid output, low bug rate |
| Priya Mehta | Frontend | Mid | High throughput, slight lead time |
| Alex Chen | Platform | Lead | Best overall metrics — the benchmark |
| Sarah Johnson | Frontend | Junior | Higher cycle time, some bugs — normal for junior |
| Marcus Rodriguez | Backend | Senior | Complex billing work, slightly elevated bug rate |

### Metric calculations (per assignment definitions)

```
Lead Time  = avg(first_successful_deploy.deployed_at - pr.opened_at) per developer per month
Cycle Time = avg(issue.completed_at - issue.started_at) per developer per month
Bug Rate   = (bugs in month / issues completed in month) × 100
Deploy Freq = count(successful deployments in month) per developer
PR Throughput = count(merged PRs in month) per developer
```

### Health thresholds (opinionated, configurable)

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|---------|
| Lead Time | ≤ 4d | 4-7d | > 7d |
| Cycle Time | ≤ 3d | 3-6d | > 6d |
| Bug Rate | ≤ 10% | 10-20% | > 20% |
| Deploy Freq | ≥ 4 | 2-4 | < 2 |
| PR Throughput | ≥ 5 | 3-5 | < 3 |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout — fonts, providers, navbar
│   ├── globals.css              # Tailwind v4 theme + CSS variables
│   ├── page.tsx                 # IC dashboard page
│   ├── manager/
│   │   └── page.tsx             # Manager team view page
│   └── api/
│       ├── developers/route.ts  # GET /api/developers
│       ├── metrics/[devId]/
│       │   └── route.ts         # GET /api/metrics/:devId?period=YYYY-MM
│       └── team/route.ts        # GET /api/team?period=YYYY-MM
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Top navigation + theme toggle
│   │   ├── ThemeToggle.tsx      # Sun/moon button
│   │   └── Skeleton.tsx         # Loading shimmer components
│   ├── providers/
│   │   └── ThemeProvider.tsx    # next-themes wrapper
│   ├── dashboard/
│   │   ├── MetricCard.tsx       # Single metric display card
│   │   ├── MetricGrid.tsx       # 5-column grid of metric cards
│   │   ├── InterpretationPanel.tsx  # AI story section
│   │   ├── NextStepsPanel.tsx   # Action items
│   │   ├── DeveloperSelector.tsx # Dev dropdown
│   │   ├── PeriodSelector.tsx   # Month picker
│   │   ├── StatusBadge.tsx      # Overall health badge
│   │   └── charts/
│   │       └── TrendSparkline.tsx  # Mini prev→current chart
│   └── manager/
│       ├── TeamTableRow.tsx     # One row in the team table
│       └── TeamMetricChart.tsx  # Bar chart per metric
├── data/
│   ├── developers.json
│   ├── issues.json
│   ├── pull-requests.json
│   ├── deployments.json
│   └── bugs.json
├── hooks/
│   ├── useMetrics.ts            # Fetch + state for IC metrics
│   └── useTeamMetrics.ts        # Fetch + state for team metrics
├── lib/
│   ├── utils.ts                 # cn, date helpers, formatters
│   ├── metrics.ts               # All metric calculation logic
│   └── interpretation.ts        # Rule-based insight engine
└── types/
    └── index.ts                 # All shared TypeScript types
```

---

## Getting Started

```bash
# 1. install dependencies
pnpm install

# 2. start dev server (turbopack, ~400% faster startup in Next 16.2)
pnpm dev

# 3. open http://localhost:3000
```

### Build for production

```bash
pnpm build
pnpm start
```

### Type check

```bash
pnpm type-check
```

---

## Design Decisions

**Why no login?**
The assignment is a mock data MVP. Adding auth would add complexity without demonstrating any of the evaluated skills. If this were a real product, Supabase Auth would be the right call.

**Why rule-based interpretation instead of LLM?**
Fast, deterministic, no API key needed, works offline. The logic is readable and defensible. An LLM call could replace `src/lib/interpretation.ts` cleanly if needed — the interface is already abstracted.

**Why Tailwind v4?**
It's the current standard in 2026. The CSS-first config (`@theme`) is cleaner and the `postcss.config.mjs` setup is minimal.

**Why no state management library?**
useEffect + fetch is enough for 2 pages with simple data flows. No Redux, Zustand, or TanStack Query — keeping the surface area minimal.

**Why Syne + Space Mono?**
Syne has an editorial/technical character that's unusual but purposeful. Space Mono keeps all data values monospaced and scannable. Instrument Serif gives body text warmth.

---

## License

MIT
