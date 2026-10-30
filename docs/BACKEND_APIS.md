# Backend services the School LMS needs

**Status: none of the services below exist yet.**

Today the app has only:

- **Syllabus and exam data**, read on the server from `src/data/syllabus.json`.
- **AI routes** (`/api/ai/*`), which call Ollama on the server.
- **Learner state**, stored in each browser (`localStorage`: the `school-lms` and `school-lms-school` keys).

The teacher, parent and principal dashboards therefore start in an honest **"School data is not connected"** state. Their figures appear only after the user chooses **Explore with demo data**. Demo data is invented, bannered on every page, and never sent anywhere.

This document describes what a real deployment has to provide. Paths are suggestions under `/api/v1`, and the shapes are TypeScript.

---

## 1. Authentication and authorisation (required before any real data)

**The app currently has no authentication and no role-based access control.**

- Every route (`/student`, `/teacher`, `/parent`, `/principal`, `/admin`, `/settings`) is open to anyone who can reach the server.
- The role switcher is a navigation convenience, not a permission system.
- The AI routes validate their input with zod but do not identify the caller.

Do **not** connect real student data until all of the following exist.

| Requirement | Notes |
|---|---|
| Identity provider | School SSO (Google Workspace for Education or Microsoft Entra ID) or a managed OIDC provider. Parents usually need phone or email OTP sign-in. |
| Server-side sessions | HTTP-only, `Secure`, `SameSite=Lax` cookies. Short-lived access plus rotating refresh. No tokens in `localStorage`. |
| Roles and scopes | `student`, `teacher`, `parent`, `principal`, `content_admin`, `school_admin`. A user may hold several roles. Scope each role to a `schoolId`, plus `sectionIds` (teacher), `childIds` (parent) or `subjectIds` (content admin). |
| Server-side checks | Every route handler and server action checks the session and role **on the server**. Next.js `middleware.ts` can redirect unauthenticated users, but it is not an authorisation check on its own: repeat the check in each handler. |
| Data scoping | Queries are always filtered by the caller's scope. A teacher sees only their sections, a parent only their linked children, a principal only their school. Never trust IDs sent by the client without checking ownership. |
| Audit log | Append-only record of who viewed or changed student records, marks, attendance and approvals, kept for the period the school's policy requires. |
| Rate limiting | Per user and per IP, especially on `/api/ai/*` (cost) and sign-in (abuse). |
| Children's data and consent | India's **Digital Personal Data Protection Act, 2023** requires verifiable parental consent before processing a child's (under 18) personal data. It also prohibits tracking, behavioural monitoring and targeted advertising directed at children, and requires data minimisation, purpose limitation and the ability to withdraw consent and erase data. Record consent per child and per purpose, and check its rules (and any notified exemptions for educational institutions) with counsel. |
| AI data handling | Do not send names or identifiers to the model. Send only chapter context, mastery numbers and the learner's question. Log prompts without personal data. |

Suggested endpoints:

```ts
GET  /api/v1/me            -> { userId, name, roles: Role[], schoolId, scopes: { sectionIds?: string[]; childIds?: string[]; subjectIds?: string[] }, language: 'en'|'hi'|'pa' }
POST /api/v1/auth/logout
PATCH /api/v1/me/preferences  { language?, theme?, notificationFrequency?: 'urgent'|'daily'|'weekly' }
```

---

## 2. Student learning record (replaces browser-only progress)

The adaptive engine (`src/lib/adaptive.ts`) is pure and can run on the server or the client. Persist its state per student so progress follows them across devices and teachers can see it.

```ts
// Caller: the student themself (write), their teachers, parents and principal (read, scoped)
GET  /api/v1/students/:id/skills             -> Record<chapterId, SkillState>      // see adaptive.ts
POST /api/v1/students/:id/answers            { chapterId, correct, difficulty, topic?, stem?, at } -> SkillState
POST /api/v1/students/:id/sessions           { chapterId, accuracy, minutes } -> SkillState
GET  /api/v1/students/:id/activity?days=84   -> { day: string; answered: number; correct: number; minutes: number }[]
POST /api/v1/students/:id/lesson-steps       { chapterId, step: 'learn'|'explore'|'assess', score? }
```

Migration: on first sign-in, offer to upload the existing `localStorage` state once, with consent, then clear it.

---

## 3. Teacher dashboard

| Panel | Endpoint | Caller |
|---|---|---|
| Today's timetable | `GET /api/v1/teachers/me/timetable?date=YYYY-MM-DD` → `{ time, sectionId, sectionName, subject, topic, room }[]` | teacher |
| Students who need support | `GET /api/v1/teachers/me/support` → `{ studentId, name, sectionName, reason: 'missed_work'\|'low_accuracy'\|'misconception', detail, suggestedTopic }[]` | teacher (own sections only) |
| Topic mastery | `GET /api/v1/sections/:id/mastery?chapterId=` → `{ topic, mastery: number }[]` (average BKT `pKnown`, at least 5 students before showing) | teacher of the section, principal |
| Syllabus coverage vs plan | `GET /api/v1/sections/:id/coverage` → `{ subject, covered: number, planned: number }` | teacher, principal |
| Answer clustering | `POST /api/v1/sections/:id/answer-clusters { questionId }` → `{ label, count, example }[]` (runs the AI on the server and stores the result) | teacher |
| AI lessons (already work locally) | `POST /api/v1/lessons { cls, subject, topic, text }`, `PATCH /api/v1/lessons/:id { state: 'draft'\|'review'\|'approved' }`, `GET /api/v1/lessons?state=` | teacher (author); approval may require a head of department |
| Assignments (already work locally) | `POST /api/v1/assignments { sectionId, topic, due, questions: Question[] }` → assignment, visible to students only once approved | teacher of the section |

Only `approved` lessons and saved assignments may be shown to students. The server must enforce this, not the UI.

---

## 4. Parent dashboard

| Panel | Endpoint | Caller |
|---|---|---|
| Weekly summary | `GET /api/v1/children/:id/weekly-summary?lang=` → `{ weekOf, text, facts: { attendance, tasksDone, tasksSet, latestTest?: { name, score, max } } }` (generate the text on the server, in the requested language) | linked parent |
| How to help | `GET /api/v1/children/:id/suggestions?lang=` → `{ title, action }[]` | linked parent |
| Dates | `GET /api/v1/children/:id/calendar` → `{ title, date, kind: 'event'\|'due' }[]` | linked parent |
| Subjects | `GET /api/v1/children/:id/subjects` → `{ subject, mastery, strength, next }[]` | linked parent |
| Holistic Progress Card | `GET /api/v1/children/:id/hpc?term=` → `{ domain, teacher, self, peer, parent: 1\|2\|3 }[] + teacherNote` | linked parent, class teacher |
| Parent input (works locally now) | `POST /api/v1/children/:id/hpc/parent-input { curiosity: 'rarely'\|'sometimes'\|'often', note }` | linked parent |
| Notification preference (works locally now) | `PATCH /api/v1/me/preferences { notificationFrequency }` | parent |

---

## 5. Principal dashboard

Aggregates only. No individual student names unless the principal drills into a section.

| Panel | Endpoint |
|---|---|
| Headline figures | `GET /api/v1/schools/:id/kpis?week=` → `{ attendanceToday, attendanceDelta, syllabusCovered, syllabusPlan, studentsAtRisk, newAtRisk, weeklyActive }` |
| Alerts | `GET /api/v1/schools/:id/alerts` → `{ id, severity, title, recommendation, evidence: 'coverage'\|'compare'\|'adoption' }[]` |
| Coverage by stage | `GET /api/v1/schools/:id/coverage` → `{ stage, covered, planned }[]` |
| Attendance trend | `GET /api/v1/schools/:id/attendance?weeks=8` → `{ week, percent }[]` |
| Class × subject scores | `GET /api/v1/schools/:id/scores` → `{ cls, subject, average }[]` (suppress cells with fewer than 10 students) |
| Class 12 forecast | `GET /api/v1/schools/:id/forecast` → `{ expected75Plus, jeeAdvancedOnTrack, neet550OnTrack, basedOn: string }` |
| Teacher platform use | `GET /api/v1/schools/:id/adoption` → `{ department, aiLessons, tasks, level: 'high'\|'low' }[]` |

Caller: `principal` (own school) and `school_admin`.

---

## 6. Content administration

The catalogue is real and already served from `src/data/syllabus.json`. To make edits durable and shared:

```ts
GET   /api/v1/catalogue/subjects?board=&cls=&status=&q=   -> CatalogRow[]
POST  /api/v1/catalogue/flags   { subjectId, reason: 'units'|'source'|'session'|'wording'|'other', note }   // content_admin
GET   /api/v1/catalogue/flags?status=open                  -> Flag[]
PATCH /api/v1/catalogue/flags/:id { status: 'resolved', resolution }
PATCH /api/v1/catalogue/subjects/:id { units?, src?, session?, verified? }  // content_admin, audited, versioned
```

Flags are currently saved in the browser only (`school-lms-school`).

---

## 7. Notifications

`POST /api/v1/notifications` (system only) delivers by the parent's chosen frequency. Absence and safety alerts always go immediately. Channels: in-app, plus SMS or WhatsApp through an approved provider, with opt-in recorded per consent rules.
