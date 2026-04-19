# Gleuhr Performance Dashboard — Build Summary v2

**Updated:** April 11, 2026
**Deployed at:** https://sales-appointment-overview.vercel.app
**Repo:** github.com/aman-cf/Sales-appointment-overview
**Vercel Project ID:** prj_mCTRqK7Pe7cQRw9cF5fEYvdgbdFP
**Vercel Team:** team_E3tQVI8rDViAjYDNaZMyQYRl (Cubical Frames)

---

## 1. WHAT'S BUILT (Frontend UI — Mock Data)

A React performance dashboard with **three role-based views**: Agent, Team Lead, and Admin. Single `App.jsx` file (~703 lines), deployed via Vite + Vercel.

### 1.1 Navigation Structure

**All roles** see team tabs: Online Team | Appointment Team

**Agent:** Overview | Leaderboard (page tabs)
**TL:** Team | Leaderboard (page tabs) — no personal overview since TLs don't sell
**Admin:** No page tabs — just team tabs switching between Online and Appointment views directly

### 1.2 Agent View

**Overview page (top to bottom):**

1. **Today Strip** — leads needing action, follow-ups overdue, orders/visits today, today's revenue, best day reference
2. **Contest Hero** (conditional) — golden banner with progress bar, achievement tracker, 3 reward tiers
3. **Target Hero** — revenue achieved with pace-based coloring (green/amber/red comparing actual % vs expected % by time elapsed), progress bar with pace marker, remaining/days left/need per day
4. **Tabbed Overview Box:**
   - **Online tabs:** Total (revenue + orders + new patient revenue/% + repeat patient revenue/%), New/Revisit, Prepaid/COD, ROAS, Activity
   - **Appointment tabs:** Overview (booked + visited with visit% + no-shows with % + rescheduled with count/% + deltas), Patient Opted For, By Clinic, ROAS, Activity
   - **ROAS tab:** ROAS value, attributed spend, daily lead allocation, contextual budget impact card (green/amber/red)
   - **Activity tab:** calls made, connected (with rate), WhatsApp, FU done/overdue, benchmarks vs expected
5. **Lead Funnel** (collapsible) — 4-step visual funnel with drop-off indicators, lead age distribution (fresh/aging/stale), expandable detailed metrics (contact rate, response rate, speed, FU compliance, stale leads, channel split, avg touches, conversion rate, intent pipeline)
6. **Appointments Section** (online only) — booked/visited/no-shows/visit rate + by clinic
7. **Reschedule Alert** (appointment only) — red warning with count + multi-reschedule count
8. **Pipeline Value** (appointment only) — estimated value from upcoming appointments
9. **Incentive Section** — total earned, revenue/slab + ROAS bonus cards, ROAS bonus slab pills

**Leaderboard page:**
- Category pills for different rankings (Revenue, Conv Rate, Contact Rate, AOV, Speed, etc.)
- Current user highlighted with "(You)" label
- Top 3 colored rank badges
- Compare ON by default — shows Prev column + delta arrows (contextual: lower speed = green)

### 1.3 TL View

**Team page (landing page):**
- Today strip (team-level: team orders/visits, actionable leads, overdue FUs, today's revenue)
- Team target hero with pace bar
- Agent cards grid (2-column) — each card shows:
  - Revenue + % target with pace color
  - **Daily activity counts** (calls today, contacts today, follow-ups today, orders/visits today) — NOT percentages
  - Bottleneck flag (worst metric vs team avg — red alert with specific metric + tip)
  - Click → full agent drill-in (reuses all agent components)
- Team funnel at bottom

**Bottleneck detection logic:** Checks contact rate (vs team avg -5%), speed to contact (+1h), conversion rate (-1.5%), FU overdue (>20), stale leads (>25), revenue pace (<65% of expected). Sorted by severity.

### 1.4 Admin View

**No page tabs** — just Online/Appointment team tabs. Simplest navigation.

**Online Team page:**
- Today strip (today's revenue, orders today, stale leads with delta)
- Target hero for online team
- Single agent table (no tabs) with columns: Name, Revenue (with delta + prev column when compare ON), % Target (pace-colored), New, Cross-sell, Prepaid, COD, ROAS (with delta), Contact % (with delta), Conv % (with delta)
- All cells heat-colored (green/amber/red thresholds)

**Appointment Team page (3 tabs):**
- Today strip (today's revenue, visits today, stale leads with delta)
- Target hero for appointment team
- **Overview tab:** Booked/Visited/No-Shows/Advance (all with deltas), Patient Opted For breakdown (count + % of visited), Operations section (reschedules with delta, multi-reschedule, pipeline value)
- **By Agent tab:** Name, Revenue (with delta + prev), Visits (with delta), % Target, ROAS, Contact % (with delta), Pkg Conv %, No-Shows, Reschedules (with delta)
- **By Clinic tab:** Clinic, Revenue, Visits, No-Show Count, No-Show %, Reschedule Count, Patient Opted For split (Packages, Single Session, Product Only, Consultation)

### 1.5 Compare Feature

- **Default ON** across all roles
- Contextual labels: "vs yesterday" / "vs last week" / "vs last month"
- Works on all admin tables (adds Prev column + delta arrows)
- Works on agent overview metrics, leaderboard, ROAS tab

---

## 2. DATA ARCHITECTURE (Mock → Production)

### 2.1 Current Mock Data Structure

**Agent factories:** `makeOnlineAgent(overrides)`, `makeApptAgent(overrides)` — generate full data objects from key overrides. 5 online agents, 4 appointment agents. Per-agent previous period data in `AGENTS_ONLINE_PREV` / `AGENTS_APPT_PREV`.

**Team aggregates:** `aggregateTeam(agents, isOnline)` — dynamically computes team totals/averages from agent arrays. `TEAM_OL`, `TEAM_AP` for current; `PREV_TEAM_OL`, `PREV_TEAM_AP` for previous.

**Admin data:** `ADMIN_DATA` — company targets, clinic revenue (7 cities with targets/visits/no-shows/orders), lead source revenue (8 sources), aggregated new/cross-sell/prepaid/COD splits.

### 2.2 Airtable Tables Needed for Production

| Table | Purpose | Status |
|---|---|---|
| Orders (OTP) table | Revenue, orders, payment mode, dispatch status | Exists (app438MeJMTac8gYN) |
| Installments table | Package installment payments | Exists |
| Packages table | Treatment packages, balance tracking | Exists |
| Appointments table | Booked, visited, no-show, clinic, advance, patient opted for | Exists |
| Team table | Agent info, department, reporting to | Exists |
| **Targets table** | Monthly + contest targets per agent | **NEEDS CREATION** |
| **Agent Spend Attribution** | Agent name + daily ad spend attributed | **NEEDS CREATION** |
| Lead Management Base | All lead data, call logs, follow-ups | Separate base (planned) |

### 2.3 Integration Plan

- **Backend:** Airtable API from React/Vite (or Next.js migration)
- **Auth:** PIN-based initially (matching existing ad dashboard pattern)
- **Sync:** Interakt via Make.com (30-min polling for WhatsApp sync)
- **IVR:** MyOperator call logs via Make.com webhooks
- **Rate limits:** Airtable 5 req/sec per base — needs queuing layer

---

## 3. KEY DECISIONS (Settled — Do Not Revisit)

1. **ROAS = new patient revenue / attributed spend** (both teams)
2. **Contact rate = 3+ attempts** (not single touch)
3. **Online funnel endpoint = dispatched orders** (not just created)
4. **Appointment funnel endpoint = Visit Done** (not just booked)
5. **No Company page for Admin** — removed, each team has its own page
6. **No Leaderboard for Admin** — agent table already serves that purpose
7. **No "My Overview" for TL** — TLs don't sell, land on Team page
8. **Compare defaults ON** across all roles
9. **TL agent cards show daily activity counts** (calls/contacts/FUs/orders today) — not percentages
10. **Online Total tab:** No CPL. Shows New Patient + Repeat Patient revenue with % breakdown
11. **Appointment Overview tab:** No advance. Shows Booked, Visited (with visit%), No-Shows (with %), Rescheduled (with count + % of booked + delta)
12. **Admin Online:** Single flat table, no tabs. No lead source (that's marketing's domain)
13. **Admin Appointment:** 3 tabs (Overview, By Agent, By Clinic)
14. **Softr + Airtable** for CRM portal migration (decision made, phased approach)
15. **Two Airtable accounts** — non-negotiable separation for access control

---

## 4. TECH STACK

- **Frontend:** React 18 + Vite 6, single App.jsx file
- **Deployment:** Vercel via GitHub auto-deploy (aman-cf/Sales-appointment-overview)
- **Styling:** Pure CSS (no external UI libraries), Inter font, #d54402 accent
- **Design:** Notion/Apple minimal — white background, light theme
- **Build output:** ~66KB gzipped

---

## 5. WHAT'S NEXT (Backend Integration)

### Phase 1: Connect to Live Data
- Replace mock data with Airtable API calls
- Create Targets and Spend Attribution tables
- Implement period switching (Today/Week/Month with real data filtering)
- PIN-based auth matching existing ad dashboard pattern

### Phase 2: Lead Dashboard Backend
- New Airtable base for leads
- Interakt 30-min polling sync via Make.com
- MyOperator IVR integration
- Lead allocation automation

### Phase 3: Portal Migration
- Softr + Airtable replacing 38 Airtable Interfaces
- Phased rollout across 150+ portal users
- Cost reduction from Airtable seat costs

---

## 6. OTHER DASHBOARDS IN THE ECOSYSTEM

| Dashboard | URL | Purpose |
|---|---|---|
| Ad Performance (existing) | gleuhr-dashboard.vercel.app | Marketing/ad performance, owner executive view, team leaderboard |
| Performance Dashboard (this build) | sales-appointment-overview.vercel.app | Sales operations — agent/TL/admin views for Online + Appointment teams |
| Lead Management (planned) | leads-management-panel.vercel.app | Lead workspace — call/WA/FU logging, lead categorization, conversion |

The ad performance dashboard covers marketing metrics (CPL, campaign performance, ad spend). The performance dashboard covers sales operations (revenue, targets, agent activity, ROAS). No overlap between them.
