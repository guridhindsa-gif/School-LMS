# School LMS

Next.js front end for a school learning platform covering **CBSE and CISCE, Classes 1–12**, with **JEE, NEET, CUET, CLAT, NDA, BITSAT, IPMAT, NATA, UCEED, IOQM and NSE** tracks. It has an **AI tutor** running on **Ollama**, **adaptive learning** (mastery tracking, difficulty targeting and spaced review), and **interactive visual labs**.

## Quick start

```bash
npm install
cp .env.example .env.local      # add your Ollama key (see below)
npm run dev                     # http://localhost:3000
```

Requires Node.js 18.18 or newer.

### Connect Ollama

All AI calls run on the server (`src/app/api/ai/*`), so the API key never reaches the browser.

| Setup | `.env.local` |
| --- | --- |
| **Ollama Cloud** | `OLLAMA_API_KEY=<your key>` and `OLLAMA_MODEL=gpt-oss:20b` (the host defaults to `https://ollama.com`) |
| **Local Ollama** | `OLLAMA_HOST=http://127.0.0.1:11434` and `OLLAMA_MODEL=llama3.1:8b` (run `ollama pull llama3.1:8b` first) |

Open **Settings & AI** (`/settings`) to check the connection and see which models the server has.

### Try it without a model

A mock Ollama server returns canned, context-aware replies. Use it for demos and UI work:

```bash
npm run mock:ollama      # terminal 1, listens on :11999
npm run dev:mock         # terminal 2
```

On Windows, run `set OLLAMA_HOST=http://127.0.0.1:11999 && set OLLAMA_MODEL=mock && npx next dev` instead of `dev:mock`.

## What's inside

### Student app (`/student`)

The interface is fully translated into **English, हिंदी and ਪੰਜਾਬੀ**, using the language switch in the header. The choice is saved and applies to every page, lesson, the narration and Vidya.

- **Junior Learning World (Classes 1–5).** A separate picture-led home with four destinations: Learn, Play & Explore, My Stars and Ask Vidya. It has big touch targets, a listen button for every instruction, optional voice navigation, and stars earned from correct answers. There is no exam or analytics language.

- **Onboarding.** The student picks a name, board, class, and a stream for Classes 11–12; repeater JEE and NEET batches are supported.
- **Home (learning cockpit).**
  - A **Continue learning** card shows the single best next step from the adaptive plan: due reviews first, then weak chapters, then chapters to continue, then new ones. Three follow-ups sit below it.
  - A daily mission: a 10-question goal and the revisions that are due.
  - Subject mastery tiles, revision and weak spots, and a 7-day activity chart.
  - Level, XP and badges, all derived from the student's real activity (`src/lib/achievements.ts`).
  - Quick tools, and the entrance tracks open to the student's class.
- **My syllabus.** Subjects are grouped the way each board requires (compulsory, electives, ICSE Groups I–III). Each subject shows how well its syllabus is verified, its session and a link to the source. Competitive tracks can be added by class and stream.
- **Subject page.** Every unit shows its marks, sub-topics, mastery band, and Learn / Practice / Test / Lab buttons. **Find my level** runs a diagnostic test that sets a starting mastery for every chapter.
- **Learn (lesson studio).**
  - A chapter header with learning objectives and a **Learn → Explore → Practise → Check** path. Each step's status comes from real state: the picture lesson has been watched, the lab or notes have been opened, practice has been attempted, mastery is strong.
  - The picture lesson is the default tab, followed by Notes, the matching lab and the official sub-topics. Vidya sits in a side panel on wide screens and opens as a drawer on smaller ones.
  - The AI writes a streaming lesson pitched to the class. It is very simple for Classes 1–2, at board depth for Classes 9–10, and includes JEE/NEET extensions for 11–12.
  - Lessons render maths with KaTeX, can be read aloud, and are available in English, Hindi and Punjabi.
  - The visual lab for the chapter opens in a tab next to the lesson, and the tutor sits beside it.
- **Adaptive practice.** Questions are generated fresh at the difficulty the learner model chooses. Each answer gets instant feedback, an explanation of why the chosen option is wrong, and hints. Live mastery updates after every answer.
- **Chapter test, diagnostic and mock test.** These are timed and use a question palette. Mock tests apply each exam's real marking scheme. Afterwards there is an answer review, a list of weak topics, and the next review date.
- **Competitive exams.** All 12 exams show their official pattern, eligibility, and unit lists tagged by class.
- **AI tutor "Vidya".**
  - Three modes: **Guide me** (Socratic hints), **Explain**, and **Check my work** (finds the first mistake).
  - It knows the current chapter, the student's mastery and their weak topics.
  - It is available as a full page and as a drawer on every screen.
- **Use my own Claude.** In Settings & AI anyone can add their own Claude API key (from the Claude Console) and pick Sonnet, Haiku or Opus 5.5; lessons, questions and the tutor then run on their Claude account. The key stays on their device and is sent per request in the `x-claude-key` header to the app's own server (`src/lib/claude.ts`, `src/lib/ai.ts`), which calls the Claude Messages API and never stores or logs it. Schools can make Claude the default for everyone with `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY`. A claude.ai Pro or Max subscription does not include API use.
- **Exam preparation schedule.** On any competitive exam page (and, for Classes 9–12, on My syllabus for board exams) the student enters the exam date, daily study time and the sections or subjects they take. `src/lib/prep-plan.ts` builds a day-by-day plan: every unit learnt and practised with subjects mixed each day, quick reviews 7 and 21 days after a unit, a weekly mock test or board paper from week 3, and a final phase (last ~15%, 7–30 days) of weakest-first revision, a full test every third day and a light exam eve. Units the student has already mastered get less time. It says honestly when the time is tight and how many hours a day would cover everything. Sessions are ticked off, missed sessions show as "behind", and "Re-plan from today" rebuilds the plan from current mastery. The dashboard shows today's sessions for the nearest exam. Plans are saved on the device only.
- **Visual labs (46).** A class-wise library across Maths, EVS, Physics, Chemistry, Biology and Geography, from place-value blocks, clocks and rupee money in Class 1 to titration, capacitors and the photoelectric effect in Class 12. The catalogue has search, a class picker with per-class counts, and subject filters. Labs also open inside the chapters they belong to; the lesson's Lab tab switches between all matching labs. Labs are organised in packs (`src/components/labs/packs/*`), each with its own components, chapter matching and translations.
- **Progress.** Level and badges, mastery by subject, a 12-week activity heatmap, the review queue, and a progress reset.

### Other roles

Each role has its own information hierarchy. Teacher, parent and principal screens show an honest **"School data is not connected yet"** state by default, because no school data service exists yet. **Demo data is opt-in**, bannered and marked **Sample data**. The required APIs, and the missing authentication and role-based access control, are documented in [docs/BACKEND_APIS.md](docs/BACKEND_APIS.md). Things a teacher, parent or admin saves (approved lessons, assignments, notes, flags) are kept in the browser (`src/lib/school-store.ts`). The interface says so, rather than claiming they reached anyone.


- **Teacher:** today's priorities (next class, students who need support), class mastery and coverage against plan, answer clustering, an AI lesson builder with a Draft → In review → Approved flow, and an assignment maker where each question is approved or removed and the assignment is validated before saving.
- **Parent:** a weekly digest in English, Hindi or Punjabi that can be read aloud, the Holistic Progress Card (teacher, self, peer and parent input), a parent input form, and notification settings.
- **Principal:** headline outcomes, then alerts that each come with a recommended action, then the detail: coverage against plan, the attendance trend, a class × subject heatmap with a legend, the Class 12 forecast, and teacher adoption.
- **Content admin:** a searchable catalogue of all 235 subjects that filters by board, class and status, with sources and sessions; a validated flag-for-review form and review queue; the question tags; and paper blueprints.

### Adaptive learning engine (`src/lib/adaptive.ts`)

| Piece | What it does |
| --- | --- |
| Bayesian Knowledge Tracing | Probability the student has mastered a chapter, updated after each answer. It allows for lucky guesses and careless slips, and harder questions count as stronger evidence. |
| Elo / Rasch ability | Per-chapter ability score. The next question's difficulty is picked so the student succeeds about 70% of the time. |
| Hints | Answering after a hint counts as answering an easier question. |
| Spaced review | SM-2-style intervals driven by mastery and session accuracy. |
| Recommendations | Due reviews, then weak chapters, then chapters to continue, then new chapters, interleaved across subjects. |

Run its unit tests with `npm test`.

Learner state is kept in the browser (Zustand persisted to `localStorage`) so the app runs without a database. To make progress follow the student across devices and feed the teacher, parent and principal dashboards, move `src/lib/store.ts` to an API backed by a database.

## Syllabus data

`src/data/syllabus.json` was built from the official sites: cbseacademic.nic.in, ncert.nic.in, cisce.org, NTA (jeemain.nta.nic.in, neet.nta.nic.in, cuet.nta.nic.in), jeeadv.ac.in, nmc.org.in, consortiumofnlus.ac.in, iimidr.ac.in, nata.in, uceed.iitb.ac.in, IAPT/HBCSE and MTA. Each subject and exam records its **source URL, session and verification status**, and the UI shows that status. Known gaps:

- **CBSE 2026–27 subject PDFs could not be read automatically**, so most CBSE subjects use the 2025–26 syllabus, and a few use 2024–25. Class 9 moved to NCF-2023 books in 2026–27, so recheck Class 9 Science, Social Science and English.
- **CISCE PDFs were mostly unreadable.**
  - ICSE has only Maths, Computer Applications, Commercial Studies, Commercial Applications and Robotics & AI.
  - ISC Class 11 is complete (2024 revised syllabus).
  - ISC Class 12 sciences, Maths, Accounts and Commerce show **draft** units taken from the School LMS syllabus document.
- **NDA and BITSAT** are marked *verify*, because their official sites block automated reading.
- **NCERT Classes 1–8:** 16 books are confirmed against NCERT pages; the others are marked *partly verified* or *verify*.

To update the data, add the official PDFs, regenerate `syllabus.json` (same shape: `subjects`, `catalog`, `tracks`, `exams`), and the app picks up the changes.

## Project structure

```
src/
  app/
    api/ai/{chat,lesson,questions,health}  Ollama-backed routes (streaming + JSON schema output)
    api/syllabus                            course, tracks and chapter search
    student/…                              student app pages
    teacher, parent, principal, admin       role apps
    settings                                AI connection check
  components/
    AppShell, TutorChat, QuizRunner, Markdown, ui, cockpit, Confetti, HeroBoard
    visual/                                 picture-lesson scenes and player
    labs/                                   7 interactive canvas/SVG labs + registry
  lib/
    ollama.ts      server-side Ollama client (cloud or local)
    prompts.ts     tutor, lesson and question prompts
    adaptive.ts    learner model (BKT, ability, spaced review, recommendations)
    store.ts       persisted learner state
    achievements.ts levels, badges, daily mission (from real state)
    school-store.ts teacher/parent/admin saves kept on this device
    syllabus.ts    syllabus queries (server only)
  data/syllabus.json
scripts/mock-ollama.mjs                     Ollama-compatible mock for demos
```

## Design system

Fonts are self-hosted with `next/font` (no runtime Google Fonts). The interface uses an SVG illustration system (`src/components/art`) instead of emoji.

See [DESIGN.md](DESIGN.md) for the tokens (midnight ink, electric indigo, teal, warm amber), typography, the junior and senior stages, components and design rules.

## Notes

- Accessibility:
  - A skip link, visible focus, and a tutor drawer and command palette that trap focus and return it on close.
  - The command palette works from the keyboard (Ctrl K, arrow keys, Enter).
  - ARIA roles on tabs, radios, dialogs and progress bars.
  - Reduced-motion support: animations and labs settle to a still frame.
  - Light and dark themes.
- Mobile: bottom navigation reaches every main section, including Labs. Safe-area padding, responsive labs, and no sideways scrolling at 390px.
- AI output is labelled as AI-written. Teacher-facing AI drafts need approval before students see them.
