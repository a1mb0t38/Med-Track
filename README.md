# MedTrack — Frontend

The frontend for **MedTrack**, a medication adherence tracking platform. Built with Next.js (App Router), HeroUI, Tailwind CSS, and Better Auth's React client. Patients track their medicine schedules and log doses; caregivers monitor linked patients' adherence remotely.

---

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **UI Library**: HeroUI (v3)
- **Styling**: Tailwind CSS
- **Auth**: Better Auth React client (`better-auth/react`)
- **Charts**: Recharts
- **Notifications**: `react-hot-toast`, browser push notifications via Service Worker

---

## Prerequisites

- Node.js 18+
- The MedTrack **backend** running (see backend README) — this frontend expects it at `http://localhost:5000` in development.

---

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the `frontend/` directory:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `NEXT_PUBLIC_APP_URL` must be set (not just the server-side `BETTER_AUTH_URL`) since the Better Auth client runs in the browser and can only read env vars prefixed `NEXT_PUBLIC_`.

### 3. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Session check + redirect, wraps Header + NotificationManager
│   │   ├── dashboard/page.tsx      # Patient home — today's schedule, add medicine, refill alerts
│   │   ├── history/page.tsx        # Patient adherence history + chart
│   │   ├── caregiver/page.tsx      # Caregiver home — invite patients, view linked patients
│   │   ├── caregiver/[patientId]/  # Caregiver's detail view for one patient
│   │   └── settings/page.tsx
│   └── api/auth/[...all]/route.ts  # Better Auth's catch-all API handler
├── components/
│   ├── dashboard/
│   │   ├── Header.tsx
│   │   ├── TodayScheduleCard.tsx
│   │   ├── AddMedicineButton.tsx
│   │   ├── RefillAlertBanner.tsx
│   │   └── InviteBanner.tsx
│   └── history/
│       └── AdherenceDashboard.tsx
├── lib/
│   ├── auth-client.ts    # Better Auth client (browser-safe)
│   ├── api.ts             # fetchClient — client-side fetch helper (no next/headers)
│   └── api-server.ts      # fetchServer — server-side fetch helper (forwards cookies via next/headers)
└── .env.local
```

> **Note:** `lib/api.ts` and `lib/api-server.ts` are intentionally separate files. `fetchServer` uses `next/headers`, which only works in Server Components — importing it into a file also used by Client Components will break the build. Server Components (like page.tsx files) import from `api-server`; Client Components import from `api`.

---

## How to Use MedTrack

### Signing up

1. Go to `/signup`.
2. Fill in name, email, and password.
3. Choose your role: **Patient** or **Caregiver**. This determines your dashboard and permissions — it can't be changed later without a backend update.
4. On success, you're redirected to your role's dashboard.

### As a Patient

**Adding a medicine**
1. From your Dashboard, click **+ Add Medicine**.
2. Fill in the medicine name, dosage, how many doses per day, and the exact time(s) for each dose.
3. Set your current pill count and a low-stock alert threshold.
4. Toggle **Ongoing Prescription** off if the medicine has a known end date.
5. Submit — today's doses for this medicine appear on your dashboard immediately (no need to wait until the next day).

**Logging a dose**
- Each dose on your dashboard shows **Skip** and **Mark Taken** buttons while it's `pending`.
- You can mark a dose **Taken** starting 30 minutes before its scheduled time — trying to log it earlier shows a message telling you how much longer to wait.
- **Skip** has no time restriction.
- Doses left unactioned past their scheduled time (plus a grace period) are automatically marked **Missed** by an hourly background job — you don't need to do anything for this to happen.

**Refill alerts**
- If a medicine's remaining pill count drops to or below its configured low-stock threshold, a refill alert banner appears on your dashboard.

**Viewing your history**
- Go to **History** in the nav bar.
- Choose a range: last 7, 30, or 90 days.
- See your overall adherence rate, current streak (consecutive fully-adherent days), total doses logged, a stacked bar chart (taken/skipped/missed per day), and a detailed log of every individual dose.

**Linking a caregiver**
- If a caregiver sends you an invite, it appears as a banner at the top of your dashboard with their name and email.
- Click **Accept** to let them view your adherence (read-only — they cannot edit your medicines), or **Decline** to reject it.
- You can unlink an accepted caregiver at any time from your Settings.

### As a Caregiver

**Inviting a patient**
1. From your dashboard, enter the patient's registered email in the **Invite Patient** form and click **Send Invite**.
2. The invite appears in your **Pending Sent Invites** list until the patient responds.
3. You can **Revoke** a pending invite at any time.

**Monitoring linked patients**
- Once a patient accepts, they appear under **Linked Patients** with a live summary: doses taken today out of total scheduled, shown as a percentage with a color-coded progress bar.
- Click **View Details** on any patient to see their full today's schedule and 30-day adherence chart.
- You can **Unlink** a patient at any time — this is mutual, and the patient can also unlink you from their side.

> Caregivers have **read-only** access. You cannot add, edit, or mark doses on behalf of a linked patient.

### Signing out

Click **Sign Out** in the top-right corner of the header, available from any authenticated page.

---

## Notifications

MedTrack registers a Service Worker to support browser push notifications for upcoming doses (handled by `NotificationManager`, mounted in the dashboard layout). Your browser will prompt you to allow notifications on first load.

---

## Troubleshooting

**"No doses scheduled for today" right after adding a medicine**
This should no longer happen — dose generation is triggered immediately on medicine creation. If you still see this, confirm the backend terminal shows no errors and that the medicine's scheduled `times` were entered correctly.

**A newly logged dose doesn't show up in History**
Make sure you're looking at the correct date range. If a dose is scheduled later today than the current time, ensure your browser/date-range logic treats "today" as the full day (00:00–23:59), not just "up to this exact moment."

**"Too early to mark this dose as taken"**
This is expected — doses can only be logged starting 30 minutes before their scheduled time. Wait for the window to open, or contact whoever manages the backend if this threshold needs adjusting.

**Sign out button doesn't respond**
Ensure you're on the latest build — this was a known issue in earlier versions caused by a stray HeroUI prop mismatch, since fixed.