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

- **Onboarding.** The student picks a name, board, class, and a stream for Classes 11–12; repeater JEE and NEET batches are supported.
- **Home.** An adaptive "Up next" plan lists reviews that are due, then weak chapters, then chapters to continue, then new ones. It also shows mastery, streak, reviews due and a 7-day activity chart.
- **My syllabus.** Subjects are grouped the way each board requires (compulsory, electives, ICSE Groups I–III). Each subject shows how well its syllabus is verified, its session and a link to the source. Competitive tracks can be added by class and stream.
- **Subject page.** Every unit shows its marks, sub-topics, mastery band, and Learn / Practice / Test / Lab buttons. **Find my level** runs a diagnostic test that sets a starting mastery for every chapter.
- **Learn.**
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
- **Visual labs.** Seven interactive simulations, linked to chapters automatically:
  - counting mangoes
  - fractions with a roti
  - refraction, including total internal reflection
  - projectile motion with velocity vectors
  - spring–mass SHM that draws its own graph
  - a function grapher showing roots and vertex
  - an Ohm's-law circuit, series or parallel
- **Progress.** Mastery by subject, a 12-week activity heatmap, the review queue, and a progress reset.

### Other roles

- **Teacher:** timetable, at-risk students, class mastery, an AI lesson builder that the teacher approves, an AI assignment generator, and answer clustering.
- **Parent:** a weekly digest in English, Hindi or Punjabi that can be read aloud, the Holistic Progress Card (teacher, self, peer and parent input), a parent input form, and notification settings.
- **Principal:** key figures, syllabus coverage, an attendance trend, a score table by class and subject, Class 12 forecasts, and teacher adoption.
- **Content admin:** a catalogue of all 235 subjects with verification status, sources and sessions; the question tags; and paper blueprints.

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
    AppShell, TutorChat, QuizRunner, Markdown, ui, Confetti, HeroBoard
    labs/                                   7 interactive canvas/SVG labs + registry
  lib/
    ollama.ts      server-side Ollama client (cloud or local)
    prompts.ts     tutor, lesson and question prompts
    adaptive.ts    learner model (BKT, ability, spaced review, recommendations)
    store.ts       persisted learner state
    syllabus.ts    syllabus queries (server only)
  data/syllabus.json
scripts/mock-ollama.mjs                     Ollama-compatible mock for demos
```

## Notes

- Accessibility: keyboard focus styles, reduced-motion support (animations and labs settle to a still frame), ARIA roles on tabs, radios and dialogs, and light/dark themes.
- Mobile: bottom navigation, safe-area padding, and responsive labs.
- AI output is labelled as AI-written. Teacher-facing AI drafts need approval before students see them.
