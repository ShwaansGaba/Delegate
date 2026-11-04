# Student Events Platform — MUN Conference Module (v1.0)

A modular, extensible platform for student events (Model United Nations, debates, hackathons, college fests, theatre, and sports), providing every student with a lifelong verified portfolio of their event participation.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and design tokens adhering strictly to the visual reference.

---

## 🌟 Highlights & Design Compliance

1. **Design System & Tokens**:
   - **Colors**: Flat UN blue background (`#1560BD`), darker blue desktop sidebar (`#0F4C96`), white flat cards (`#FFFFFF`), single yellow action button (`#FFD23F` with `#0B1B33` dark text).
   - **Typography**: Headings in **Bricolage Grotesque (weight 800)**, body in **DM Sans**.
   - **Hard Rule**: No text smaller than `16px`. Zero emojis (clean country monogram circles `IN`, `BR`, `JP` used instead). No shadows, gradients, or decorative clutter.
   - **Fluid Layout**:
     - **Mobile (390px target)**: 1-question-per-screen delegate flow, thick progress bar with back arrow `←`, full-screen searchable sheets for dropdowns, stacked rows & cards (no tables).
     - **Desktop (1280px target)**: Organizer portal with dark blue left sidebar (`Dashboard`, `Registrations`, `Allotment`, `Setup`), side-by-side list + detail panels, and centered delegate experience.

2. **Seeded Realistic Data Layer**:
   - Pre-populated with **212 registrations** across leading Indian schools (*Delhi Public School, Modern School Barakhamba, Sanskriti School, The Mother's International School, etc.*).
   - 6 committees (*UNSC, DISEC, UNHRC, UNEP, UNGA, WHO*).
   - Seed metrics matching design screens: **212 Registered, 188 Paid, 24 Unpaid, 31 Not allotted**.
   - Dual-mode architecture: connects to Supabase if configured, or falls back to the in-memory/localStorage seeded store with zero setup required.

3. **Key User Flows**:
   - **Delegate Flows**:
     - Landing screen with dates, deadline, and dual entry (alone vs. school team).
     - Browse committees with seat vacancies, expandable open/taken portfolios, and background guides.
     - Individual 1-question-per-screen registration (Name -> School & Class -> 3 Ranked Committee Preferences, each with 3 ranked country portfolios -> Credential Review Card -> Confirmation).
     - School team registration with live delegate counter, price calculation, and shared delegate invite links.
     - Confirmation screen featuring yellow **RECEIVED** stamp, unique registration number (e.g. `MUN 2048`), online pay simulation, and proof upload.
     - Status lookup: displays payment pending checklist or allotted **Placard Credential** (*UNSC / INDIA / Aarav Mehta / Delhi Public School*).
   - **Organizer Flows**:
     - Setup wizard (*Basics, Committees, Countries, Rules toggles, One-click Publish link*).
     - Dashboard with live seats filled bars and latest registrations.
     - Registrations management with search, filter chips, payment proof verification, stubbed email reminders, and CSV export.
     - Allotment matrix with manual assign, deterministic **Auto Allot** engine, preview modal (*188 first choice, 19 second choice, 5 conflicts*), and conflict resolver.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node v20 / v22 / v26)
- npm

### 2. Installation & Start
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Delegate Portal**: [http://localhost:3000](http://localhost:3000)
- **Organizer Dashboard**: [http://localhost:3000/organizer](http://localhost:3000/organizer)
- **Check Status (Sample Numbers)**:
  - `MUN 2048` (Allotted delegate with Placard view)
  - `MUN 2049` (Payment pending view)

---

## 🧩 How to Add a New Event Type (e.g., Hackathon, Debate)

The core data architecture is deliberately event-type agnostic.

```
Core Entities (Event Agnostic):
  - Organization
  - User (Organizers)
  - StudentProfile (Unified student portfolio across all events)
  - Event (type: 'mun' | 'hackathon' | 'debate' | 'fest' | 'sports')
  - Registration (unique number, payment status, proof, student ID)
```

To add a new event type (for example, **Hackathon**):

1. **Extend `EventType` in `lib/types.ts`**:
   ```ts
   export type EventType = "mun" | "hackathon" | "debate" | "fest" | "theatre" | "sports";
   ```

2. **Add Domain-Specific Module in `lib/` (e.g. `lib/hackathon/types.ts`)**:
   ```ts
   export interface HackathonTrack {
     id: string;
     eventId: string;
     name: string; // e.g., "AI / ML", "FinTech", "Open Innovation"
     maxTeams: number;
     problemStatementUrl?: string;
   }

   export interface HackathonSubmission {
     registrationId: string;
     repoUrl: string;
     demoUrl: string;
     techStack: string[];
   }
   ```

3. **Plug into Unified Registration**:
   - The core `Registration` model holds `eventId`, `studentId`, `delegateName`, `email`, `phone`, `school`, `paymentStatus`.
   - In `app/register/`, render the module-specific preference step:
     - If `event.type === 'mun'`, render the 3 committee & 3 portfolio ranking.
     - If `event.type === 'hackathon'`, render track selection & team member roster.

4. **Future Student Portfolio Integration**:
   - Every registration links to `studentId` in `StudentProfile`.
   - When any event completes, an entry is appended to `student.attendedEvents`:
     ```json
     {
       "eventId": "yamuna-mun-2026",
       "eventName": "Yamuna MUN 2026",
       "eventType": "mun",
       "year": 2026,
       "roleOrAllotment": "Delegate of India (UNSC)",
       "status": "attended"
     }
     ```
   - A single portfolio route `/students/[id]` can then display their complete verified student event record.
