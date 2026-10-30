# School LMS: independent UI/UX review package

*Audit only. No application code, styles, tokens, dependencies, routes, configuration or data were changed. Nothing was committed or pushed. The only new files are inside `ui-review/`, and they are not committed.*

## A. Executive summary

The redesign delivers a **coherent, credible and noticeably more polished** product than the previous chalkboard-and-marigold version:

- One design language runs across 18 routes.
- There is a clear "what next" hierarchy on the student home.
- The lesson studio puts the picture lesson, notes, lab and tutor in one workspace.
- Role apps have distinct priorities.
- Light and dark themes both work, and nothing overflows at 390 px.
- 26 of the 28 interaction checks passed in a real browser. One failed (admin form errors are not announced to screen readers). One could not be tested (tutor retry after an AI failure).

It is **not yet world-class**. The gaps are mostly the ones that separate "a well-executed design system" from "a product with a soul":

- Illustration is emoji-based.
- The junior experience (Classes 1–5) is the senior interface with rounder corners.
- The interface chrome is English-only, even though the product promises Hindi and Punjabi.
- All teacher, parent and principal data is hard-coded sample data.
- The real Next.js production build, lint and intended web fonts have **not** been verified, because the audit environment cannot install npm packages.

Overall product quality: **6.5/10**. That is a strong, consistent base, with the premium layer still to come.

## B. Commit and test environment

| Item | Value |
|---|---|
| Repository | github.com/guridhindsa-gif/School-LMS |
| Branch | `main` (working tree clean at audit start) |
| Commit reviewed | `13fb4e6ae2d90aa4d3b5fa02a786b4292bd1d5fb`, "Premium redesign: design system, learning cockpit, lesson studio, labs and role apps" (2026-10-29 11:14 UTC) |
| Runtime used | **Preview harness, not `next dev`.** See below. |
| Browser | Chromium (Playwright for Python), headless |
| Viewports | Desktop 1440×1000 (light), mobile 390×844 (light and dark, reduced motion), tablet 834×1112, desktop dark 1440×1000 |
| Learner state | Built-in preview sample learner "Harpreet, CBSE Class 11 PCM" (synthetic). A fresh "Test Learner, CBSE Class 4" was created through onboarding. No real student data. |
| AI | No model was reachable. Tutor, lesson and question responses are the harness's **canned demo replies**, matching `scripts/mock-ollama.mjs`. AI quality was not assessed. |

**Why not `next dev`:** the workspace cannot reach the npm registry (`npm view next` fails with a proxy error), so `npm install`, `next dev`, `next build` and `next lint` could not run. To verify the UI anyway, the **actual application components and pages from this commit** were bundled with esbuild into a single page. Small stand-ins replaced:

- `next/link`, `next/navigation` and `next/dynamic`
- `framer-motion`, with simplified animation
- `zustand`
- `lucide-react`, with icons mapped to the same Lucide set via `react-icons/lu`
- `react-markdown`
- the `/api/*` routes, with canned responses

Tailwind was compiled from the repo's `tailwind.config.ts` and `globals.css`. Consequently:

- Server components were rendered client-side.
- Framer-motion animations are simplified.
- **Google Fonts failed to load** (`net::ERR_TUNNEL_CONNECTION_FAILED`, 43 failed requests). Every screenshot therefore shows **fallback system fonts, not Bricolage Grotesque, Figtree or Baloo 2**. (`document.fonts.check()` returned `true`, but that only means no face was pending. It is not proof of loading.)
- The harness page has no doctype, which causes a KaTeX "quirks mode" console warning. This is a harness artefact, not an app issue.

## C. Screenshot inventory

All files are in `ui-review/`. The *Viewport* column is the browser window; *Image* is the saved pixel size. Every capture comes from the preview harness, rendered with fallback fonts (§B).

| File | Route | Viewport | Type | Image | Captured | Note |
|---|---|---|---|---|---|---|
| `01-landing-desktop-full.png` | `/` | 1440x1000 | full page | 1440×2572 | Yes |  |
| `01b-landing-desktop-viewport.png` | `/` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `02-onboarding-step1-desktop.png` | `/student/onboarding` | 1440x1000 | viewport | 1440×1000 | Yes | Fresh learner (empty local state) |
| `02b-onboarding-name-validation.png` | `/student/onboarding` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `02c-onboarding-board.png` | `/student/onboarding` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `02d-onboarding-class.png` | `/student/onboarding` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `03-student-dashboard-desktop-full.png` | `/student` | 1440x1000 | full page | 1440×2044 | Yes | Seeded sample learner (preview mode) |
| `03b-student-dashboard-desktop-viewport.png` | `/student` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `03c-student-dashboard-new-junior-class4.png` | `/student` | 1440x1000 | full page | 1440×1924 | Yes | New Class 4 learner, no activity |
| `04-syllabus-catalogue-desktop-full.png` | `/student/syllabus` | 1440x1000 | full page | 1440×1652 | Yes |  |
| `04b-subject-chapters-desktop-full.png` | `/student/subject/cbse-11-physics` | 1440x1000 | full page | 1440×1407 | Yes |  |
| `05-lesson-studio-desktop-viewport.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `05b-lesson-studio-desktop-full.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | full page | 1440×1395 | Yes |  |
| `05c-lesson-junior-class4-desktop.png` | `/student/learn/cbse-4-english~1` | 1440x1000 | viewport | 1440×1000 | Yes | Junior lesson; AI = canned/offline demo in preview |
| `06-lesson-player-scene2-concept-map.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `06b-lesson-player-sorting-game.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `06c-lesson-player-formula-explorer.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `06d-lesson-player-autoplay-on.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `07-tutor-panel-during-lesson-desktop.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes | AI reply is the preview canned demo reply, not a real model |
| `08-practice-question-desktop.png` | `/student/practice/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `08b-practice-feedback-desktop.png` | `/student/practice/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes | After choosing B and pressing Check answer |
| `09-labs-catalogue-desktop-full.png` | `/student/labs` | 1440x1000 | full page | 1440×1843 | Yes |  |
| `09b-labs-filter-maths.png` | `/student/labs` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `10-lab-projectile-desktop.png` | `/student/labs?lab=projectile` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `10b-lab-function-grapher-desktop.png` | `/student/labs?lab=grapher` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `11-teacher-desktop-full.png` | `/teacher` | 1440x1000 | full page | 1440×1657 | Yes |  |
| `12-parent-desktop-full.png` | `/parent` | 1440x1000 | full page | 1440×1871 | Yes |  |
| `12b-parent-note-saved.png` | `/parent` | 1440x1000 | full page | 1440×2052 | Yes |  |
| `13-principal-desktop-full.png` | `/principal` | 1440x1000 | full page | 1440×1677 | Yes |  |
| `14-admin-desktop-full.png` | `/admin` | 1440x1000 | full page | 1440×1849 | Yes | Recaptured with window sized to page height (1849 px); the Playwright full-page capture distorted the inner-scroll table |
| `14b-admin-flag-validation.png` | `/admin` | 1440x1000 | viewport | 1440×1000 | Yes | Save flag pressed with empty form |
| `15-landing-mobile-full.png` | `/` | 390x844 | full page | 390×5331 | Yes |  |
| `15b-landing-mobile-viewport.png` | `/` | 390x844 | viewport | 390×844 | Yes |  |
| `16-student-dashboard-mobile-full.png` | `/student` | 390x844 | full page | 390×4696 | Yes |  |
| `16b-student-dashboard-mobile-viewport.png` | `/student` | 390x844 | viewport | 390×844 | Yes |  |
| `16c-command-palette-desktop.png` | `/student` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `16d-progress-empty-state.png` | `/student/progress` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `16e-lesson-mobile-full.png` | `/student/learn/cbse-11-physics~2` | 390x844 | full page | 390×2306 | Yes |  |
| `16f-tutor-drawer-mobile.png` | `/student/learn/cbse-11-physics~2` | 390x844 | viewport | 390×844 | Yes |  |
| `16g-practice-mobile.png` | `/student/practice/cbse-11-physics~2` | 390x844 | viewport | 390×844 | Yes |  |
| `16h-labs-mobile-full.png` | `/student/labs?lab=refraction` | 390x844 | full page | 390×3603 | Yes |  |
| `16i-teacher-mobile-full.png` | `/teacher` | 390x844 | full page | 390×3375 | Yes |  |
| `16j-parent-mobile-full.png` | `/parent` | 390x844 | full page | 390×3285 | Yes |  |
| `16k-principal-mobile-full.png` | `/principal` | 390x844 | full page | 390×2915 | Yes |  |
| `16l-admin-mobile-full.png` | `/admin` | 390x844 | full page | 390×2752 | Yes | Recaptured with window sized to page height |
| `17-dark-landing-desktop-viewport.png` | `/` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `17b-dark-dashboard-desktop-full.png` | `/student` | 1440x1000 | full page | 1440×2044 | Yes |  |
| `17c-dark-lesson-desktop-viewport.png` | `/student/learn/cbse-11-physics~2` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `17d-dark-labs-desktop-viewport.png` | `/student/labs?lab=refraction` | 1440x1000 | viewport | 1440×1000 | Yes |  |
| `17e-dark-teacher-desktop-full.png` | `/teacher` | 1440x1000 | full page | 1440×1657 | Yes |  |
| `17f-dark-principal-desktop-full.png` | `/principal` | 1440x1000 | full page | 1440×1677 | Yes |  |
| `17g-dark-dashboard-mobile-reduced-motion.png` | `/student` | 390x844 | viewport | 390×844 | Yes |  |
| `18-tablet-dashboard-full.png` | `/student` | 834x1112 | full page | 834×3459 | Yes |  |
| `18b-tablet-lesson-viewport.png` | `/student/learn/cbse-11-physics~2` | 834x1112 | viewport | 834×1112 | Yes |  |

**Coverage of the 17 requested screens:**

| # | Screen | Captured |
|---|---|---|
| 1 | Public landing page | Yes (01, 01b) |
| 2 | Onboarding and class/board selection | Yes (02, 02b, 02c, 02d) |
| 3 | Student dashboard | Yes (03, 03b, 03c) |
| 4 | Subject/chapter catalogue | Yes (04, 04b) |
| 5 | Lesson page | Yes (05, 05b, 05c) |
| 6 | Animated lesson player with narration controls | Yes (06–06d) |
| 7 | AI tutor during a lesson | Yes (07, 16f) |
| 8 | Practice and quiz | Yes (08, 08b, 16g) |
| 9 | Labs catalogue | Yes (09, 09b) |
| 10 | Individual simulation | Yes (10 projectile, 10b grapher, 16h refraction) |
| 11 | Teacher | Yes (11, 16i, 17e) |
| 12 | Parent | Yes (12, 12b, 16j) |
| 13 | Principal | Yes (13, 16k, 17f) |
| 14 | Content admin | Yes (14, 14b, 16l) |
| 15 | Mobile landing | Yes (15, 15b) |
| 16 | Mobile dashboard and navigation | Yes (16, 16b, plus palette 16c and empty state 16d) |
| 17 | Dark theme | Yes (17–17g) |
| Extra | Tablet | Yes (18, 18b) |

**Not reached:** `/student/test/*` (chapter test) and `/student/mock/*` were not captured separately. They use the same `QuizRunner` as practice (08). The `/student/exams` list and exam detail pages were checked earlier for errors and overflow, but they are not in this inventory.

## D. Visual-quality scores

| Dimension | Score | Evidence |
|---|---|---|
| First impression and brand identity | 6 | Confident hero, restrained indigo/teal/amber palette and a well-composed product illustration (01, 15). But the name and wordmark "SchoolLMS" are generic, the logo is a simple book glyph, and there is no ownable illustration style. |
| Visual hierarchy and typography | 7 | A clear H1, then a dominant Continue card, then supporting cards (03b). Uppercase mono eyebrows on nearly every card become repetitive at 0.7 rem. The intended typefaces could not be verified (fallback fonts in all captures). |
| Layout, spacing and alignment | 7 | Consistent grid and gutters, and no horizontal overflow on any of 18 routes at 390 px. Some uneven column heights (revision vs week vs badges, 03). Large empty areas in the admin review queue (14) and in the junior dashboard (03c). |
| Colour palette and contrast | 7 | Body, muted and button text all pass AA (muted on background 6.0:1, white on primary 6.3:1, dark muted 7.5:1). Small tinted status pills do not: teal or green on a 15 % tint is about **3.1:1**, amber "warn" on a 20 % tint is 4.3:1, placeholder text 3.3:1. |
| Card quality and information density | 6 | Cards are crisp, but the product is card-on-card everywhere. The senior dashboard stacks about 9 sections, with nine identical subject tiles each showing a "0%" ring. The pattern feels templated after a few screens. |
| Iconography and illustrations | 5 | Lucide line icons are consistent. But lesson scenes, badges and many visual moments rely on **emoji**, which render differently per OS, clash with the line icons and read as informal for Class 11–12 (06, 07, 03). Lab thumbnails are simple SVG marks (09). |
| Navigation and discoverability | 7 | A grouped sidebar, the Ctrl K palette with page shortcuts (16c), and a 5-tab mobile nav including Labs. Weak points: Settings sits outside the shell; Vidya has two simultaneous entry points on the lesson page; the role switcher is clipped on mobile ("Princip…", 16i). |
| Junior student experience (Classes 1–5) | 4 | Only typography, radius and base size change. A Class 4 learner sees the same dashboard as a Class 11 one: "Placement check", "Revision and weak spots", 8 badges, a heat-style week chart and "Competitive exams open to you → School Olympiads" (03c). The offline demo lesson is generic ("Key idea / How it works / Where we use it", 05c). |
| Senior student experience (Classes 6–12) | 7 | Credible, focused and data-led. Mastery, revision and exam tracks are visible. The Continue card gives a clear next action (03b, 17b). |
| Animated lessons and interactive learning | 7 | A real variety of interactive scenes: idea map, sorting game, labelled picture, formula explorer with live graph, flip cards, ordering and quiz. Autoplay and narration controls work (06–06d). Quality depends on AI JSON output, and the fallback is thin. |
| AI tutor integration | 7 | A context-aware side panel on wide screens, a drawer on mobile, three modes and starter prompts. Streaming and Stop work (07, 16f). Retry after failure is untested. Conversations are not persisted. |
| Teacher and parent usability | 6 | Strong priority ordering (next class, then students needing support), an approval flow, and honest "saved on this device" feedback (11, 12b). Everything is sample data, and the parent page is long on mobile (16j). |
| Principal and administrator usability | 7 | The principal page leads with outcomes and alerts that each carry a recommended action (13). The admin page works on the **real** catalogue, with filters and validated flags (14). The admin review queue leaves a large empty panel. |
| Responsive mobile experience | 7 | No overflow, a sensible single column, and a bottom nav. The top bar is cramped ("Search ch…"). The floating Vidya button overlaps content (16b). Pages are long. |
| Accessibility and keyboard interaction | 7 | Skip link, focus trap with focus return on the drawer and palette, combobox palette, labelled progress bars, reduced motion — all verified. Gaps: admin form errors are not announced, small-pill contrast, emoji conveying meaning. No automated axe audit was possible. |
| Consistency across routes | 7 | Shared tokens and components across student and role apps. Exceptions: Settings uses its own header; mixed emoji and icons; some pages use `PageHeader`, others hand-rolled headers. |
| **Overall premium product quality** | **6.5** | Clean, consistent and trustworthy, but not yet distinctive. It lacks a signature visual language, stage-specific experiences and verified production polish (fonts, build). |

## E. The 15 most important issues (ranked)

| # | Priority | Screen / route | Problem | Evidence | Why it matters | Recommendation |
|---|---|---|---|---|---|---|
| 1 | Critical | All | The production build, lint and real `next dev` have never run on this commit. Verification so far used a harness, stub type definitions and a test shim. | §B, §H; `npm` registry unreachable | Server and client boundary, type or ESLint errors could break the real app at demo time | Run `npm ci && npm run build && npm run lint && npm test` on a networked machine before any demo; fix whatever surfaces |
| 2 | High | `/student` (Classes 1–5), lessons | The junior experience is the senior UI with cosmetic changes. Class 4 sees "Placement check", revision jargon, 8 badges and olympiad tracks. | 03c, 05c; `AppShell` only sets `data-stage` | Young children need big, picture-led, low-text navigation; this is the largest audience in K-12 | Build a junior home: 3–4 large picture tiles (Today's lesson, Play a lab, Stars), no exam or revision jargon, voice-first prompts and fewer numbers |
| 3 | High | All | Fonts are loaded by a CSS `@import` of 6 Google families, including Noto Devanagari and Gurmukhi. This blocks rendering, depends on the network and failed here, so the typography was not verified. | `globals.css` line 1; 43 failed font requests | Slow first paint on school networks; the brand typeface can silently fall back | Move to `next/font` (self-hosted, subset, `display: swap`); load Indic faces only when the language is hi or pa |
| 4 | High | All student and role chrome | The language switch (EN/हिंदी/ਪੰਜਾਬੀ) changes only AI lessons, narration and tutor. All navigation, buttons and labels stay English. | `AppShell` `LangSwitch`; screenshots | The product promise is "English, हिंदी, ਪੰਜਾਬੀ"; Punjabi-medium learners and parents still face an English interface | Add an i18n layer (for example `next-intl`) for UI strings, starting with student navigation, the dashboard and the parent app |
| 5 | High | Lessons, badges, dashboard | Emoji are used as the illustration system. | 06, 06b, 03 badges, 05c | Renders differently on Android, iOS and Windows; looks informal to seniors; clashes with line icons | Commission or generate a small SVG illustration set (subjects, scenes, badges) in the token palette; keep emoji only as an AI-content fallback |
| 6 | High | `/student`, lesson, labs, mobile | The floating "Ask Vidya" button overlaps content and duplicates the tutor side panel on the lesson page. | 03 (covers the "Full syllabus" link), 17b (covers the Chemistry ring), 16b (covers the "Then" list), 07 (panel and button visible together) | Hides data and controls; two entry points confuse | Hide the floating button when the side panel is visible; add bottom padding or a dock area on mobile; shrink it to an icon on scroll |
| 7 | High | `/teacher`, `/parent`, `/principal` | Every figure is hard-coded sample data. It is labelled, but nothing is computed from real activity. | `SampleBadge` on each page; role views | A demo audience may read sample figures as outcomes; there is nothing to evaluate functionally | Keep the badges prominent; plan a data service; in demos, start with the student flow, which uses real local state |
| 8 | Medium | Pills app-wide | Contrast of small status pills: teal or green on a tint about 3.1:1; amber "warn" 4.3:1; placeholders 3.3:1. | §D colour calculation | Fails WCAG AA for 12 px text | Use darker text shades for pills (for example teal-800 or green-800) or solid backgrounds with white text; darken placeholders |
| 9 | Medium | `/student` | Dashboard density: about 9 stacked sections, nine equal subject tiles with "0%" rings, and an empty week chart of grey bars. | 03, 03c | Dilutes the clear next action; noise for new learners | Collapse untouched subjects ("6 not started"); give the empty week chart a friendly empty state; move badges below the fold or to Progress |
| 10 | Medium | `/student/learn/*` | Lesson path state is partly non-persistent. "Explore" completion is component state, so it resets on reload, and "Check" never marks done. The header shows mastery three times (ring, band pill, Practise step). | `LearnView.tsx` lines 34–36 and 50; 05 | The progress indicator looks unreliable | Persist step completion per unit in the store; mark Check done after a chapter test; show mastery once |
| 11 | Medium | Lessons (no AI) | The offline or fallback picture lesson is generic placeholder content. | 05c ("Key idea / How it works / Where we use it") | When AI is down, the signature feature looks empty | Author proper fallback lessons for top chapters, or show a clear "AI unavailable" state with the official topics and labs instead |
| 12 | Medium | `/admin` | Flag form validation errors are plain spans, without `role=alert` or `aria-describedby`. | Test **FAIL** (§G); `FlagPanel.tsx` lines 47–57 | Screen-reader users get no feedback on submit | Link errors with `aria-describedby` and `aria-invalid`, announce a summary, and focus the first invalid field (as the teacher builder already does) |
| 13 | Medium | Mobile top bar, role header | The mobile top bar is cramped (the search truncates to "Search ch…"). The role switcher is clipped ("Princip…"). "Change class or board" takes prime space on the home page. | 16b, 16i | Discoverability on phones, the primary device for many students and parents | Use a search icon button on mobile; turn the role switcher into a menu; move "Change class" to the profile or Settings |
| 14 | Low | `/settings` | Settings sits outside the AppShell, with no sidebar or bottom nav. The palette hint shows "Ctrl K" on Mac. | `settings/page.tsx`; `AppShell` line 109 | Inconsistent navigation; a small polish gap | Render Settings inside the shell for students; show ⌘K on Apple platforms |
| 15 | Low | `/admin` | The review queue is a large empty card. "No units yet" uses the red error tone. The table is capped at 300 rows with no pagination note. | 14 | Visual imbalance; alarm colour for a to-do | Stack the queue under the form, or collapse it when empty; use amber for to-dos; add a pagination or count note |

**Other observations:**

- Tutor conversations are not persisted across visits (stated honestly in Settings).
- Unit tests ran through a local vitest-compatible shim, not real vitest.
- Lab science was not changed by the redesign: diff-checked, and Snell's law readouts verified (40° → 25.4°).

## F. Findings by area

**Public landing page (01, 01b, 15, 15b, 17).**
- Strengths:
  - A strong headline and a single primary CTA.
  - The hero illustration explains the product: lab, tutor hint and adaptive card.
  - The "Three ways in", journey and five-role sections are clear.
  - No invented logos, testimonials or statistics.
- Weaknesses:
  - The generic brand name and mark.
  - On mobile the hero visual starts below the fold, and its floating cards overlap the panel edge.
  - There is no screenshot or video of the real lesson experience.
  - The roles section is text-heavy.

**Student dashboard (03, 03b, 03c, 16, 16b, 17b, 18).**
- Strengths:
  - The Continue card is unmistakably primary.
  - The daily mission is motivating.
  - Revision and weak spots come from real mastery data.
  - Badges are earned from real state.
- Weaknesses:
  - Density, and repeated equal-weight tiles.
  - The junior experience is undifferentiated.
  - The empty-state week chart.
  - The floating button overlaps content.
  - "4 chapters due for revision" also appears in the revision list. The duplication is fine, but it adds length.

**Animated lesson experience (05–06d, 05c, 16e, 18b).**
- Strengths:
  - Scene variety and interactivity are genuinely good: concept map, sorting game, formula explorer with live graph.
  - Progress segments, the type pill, and the voice and autoplay controls.
  - The Learn → Explore → Practise → Check path gives structure.
- Weaknesses:
  - Emoji illustration.
  - The fallback content is thin.
  - Path state persistence.
  - The objectives list is long raw syllabus text.
  - On mobile the page becomes very long before the workspace.

**AI tutor (07, 16f).**
- Strengths:
  - The context chip, three clear modes and starter prompts.
  - Streaming with a visible Stop.
  - Focus is trapped in the drawer and returned on close (verified).
- Weaknesses:
  - The panel and floating button coexist on desktop lessons.
  - No conversation history across visits.
  - Retry was not verifiable here.
  - The AI's pedagogical quality was not assessed (canned replies only).

**Visual labs (09, 09b, 10, 10b, 16h, 17d).**
- Strengths:
  - The illustrated catalogue with subject and class filters (verified).
  - "For your class" tags and "Try this" prompts.
  - Keyboard sliders (verified).
  - Legends, readouts and science notes.
- Weaknesses:
  - Thumbnails are minimal.
  - Only 7 labs.
  - The floating button overlaps the "Try this" panel at 1440 px.

**Teacher and parent (11, 12, 12b, 16i, 16j, 17e).**
- Strengths:
  - Distinct hierarchies, and an AI lesson approval flow with per-question approval.
  - Validation works (verified).
  - Honest local-only save messages (verified).
  - The parent digest offers three languages with Listen.
- Weaknesses:
  - All sample data.
  - Long mobile pages.
  - The role switcher is clipped on mobile.
  - The Holistic Progress Card table scrolls horizontally inside its card on mobile.

**Principal and administrator (13, 14, 14b, 16k, 16l, 17f).**
- Strengths:
  - The principal page is action-oriented: alerts with recommendations and links to evidence. The heatmap has a legend and stays legible in dark mode.
  - The admin page uses real catalogue data, with filters and search (verified) and a validated flag form.
- Weaknesses:
  - Principal figures are sample data.
  - Admin errors are not announced.
  - Empty space beside the review queue.
  - No bulk actions.

**Mobile and accessibility.**
- No horizontal overflow on any of 18 routes × 2 viewports.
- The mobile nav reaches all main sections (verified), and the skip link is present.
- The drawer and palette keyboard behaviour is verified.
- Reduced motion was captured (17g).
- Gaps:
  - Small-pill contrast.
  - Admin error announcements.
  - Emoji carrying meaning without text alternatives in some scenes.
  - Long mobile scroll depth.
  - No automated a11y scan (axe was unavailable offline).

## G. Interaction test results

Results from scripted Playwright runs against the preview harness. Statuses are reported as observed; untested items are not claimed to work.

| Test | Status | Observation |
|---|---|---|
| Landing primary CTA "Start learning" navigates | **PASS** | /student |
| Landing "I'm an educator" scrolls to roles | **PASS** | scrollY=1572 |
| Continue-learning primary link opens chapter | **PASS** | /student/learn/cbse-11-physics~1 |
| Lesson scene progression (Next) | **PASS** | Scene 6: Anatomy of a projectile |
| Narration toggle changes state | **PASS** | aria-pressed false->true; audio output itself NOT verifiable headless |
| Autoplay advances passive scene (voice off, 6 s) | **PASS** | Scene 2: The big ideas |
| Tutor shows Stop while streaming | **PASS** |  |
| Tutor streams a reply | **PASS** | canned preview reply: Good question! We're working on Unit II: Kinematics. What do you already know ab |
| Tutor retry after AI failure | **NOT TESTED** | no way to force an AI failure in the preview harness |
| Lab subject filter | **PASS** | 3 labs |
| Lab slider keyboard control | **PASS** | 20->22 |
| Teacher lesson builder rejects empty topic | **PASS** | alerts=1 |
| Parent note validation on empty submit | **PASS** | Write at least a short sentence (10 characters or more). |
| Admin catalogue search filters rows | **PASS** | 9 rows for "physics" |
| Theme toggle switches to dark | **PASS** |  |
| Command palette keyboard search + Enter | **PASS** | /student/learn/cbse-11-physics~2 |
| Tutor drawer traps Tab focus | **PASS** |  |
| Tutor drawer Escape closes and returns focus | **PASS** | Ask Vidya, the AI tutor |
| Skip link present | **PASS** | #main |
| Onboarding name validation | **PASS** | aria-invalid=true |
| Mobile bottom nav lists all main sections | **PASS** | Home, Syllabus, Labs, Exams, Progress |
| Mobile nav link works (Labs) | **PASS** | /student/labs |
| Quiz: choose option + Check answer shows feedback | **PASS** | Not quite. Why “7” is wrong: 7 is not 2 × 3. × 3 = 6. |
| Parent note save shows honest local-only message | **PASS** | Saved on this device only… |
| Admin flag form shows validation errors | **PASS** | Visible errors: “Choose a subject — use the Flag button in the table, or pick one here.” / “Choose a reason.” (14b) |
| Admin flag errors announced to screen readers | **FAIL** | role=alert count=0; errors are plain spans |
| Onboarding completes (name → CBSE → Class 4) | **PASS** | /student |
| Junior stage applied for Class 4 | **PASS** | junior |
| Overlap, clipping and horizontal overflow (all captures) | **PASS (overflow) / FAIL (overlap)** | No route exceeded the viewport width. The floating Vidya button overlaps content (issue 6). |
| Broken images | **PASS** | No broken image requests. Only Google Fonts failed (network sandbox). |
| Console errors | **PASS (app)** | No page errors (uncaught exceptions). Console errors were only failed font loads and the harness KaTeX quirks-mode warning. |
| Audio narration output | **NOT TESTED** | `speechSynthesis` cannot be heard headless; only the toggle state was verified. |
| Loading and empty states | **PASS (observed)** | Skeletons, the new-learner empty dashboard (03c), the empty progress page (16d) and the empty teacher saved-work panel (11) all render. |
| Error states (AI unreachable) | **NOT TESTED** | The harness always answers; error notices were reviewed in source only. |
| Mobile drawers | **PASS** | The tutor drawer opens and closes on 390 px (16f). |

Methodological note: four tests first came back FAIL because of mistakes in the test script itself:
- clicking question-number buttons instead of answer options
- not pressing "Check answer"
- not answering the required "curiosity" question on the parent form
- expecting a Next button where choosing a board advances by itself

They were re-run correctly, and the final results are shown above.

## H. Build, lint and test results

| Check | Ran? | Result |
|---|---|---|
| `next build` | **No** | Blocked: npm registry unreachable, so dependencies could not be installed |
| `next lint` / ESLint | **No** | Blocked, for the same reason |
| TypeScript (`tsc --noEmit`) | Yes, with **stub type definitions** for React, Next and zustand | 0 errors. This is weaker than a real type check against the installed packages. |
| Unit tests (`expr`, `adaptive`, `achievements`) | Yes, through a **vitest-compatible shim** (esbuild bundle and node) | 16 passed, 0 failed. Real vitest not run. |
| esbuild bundle of all pages | Yes | Compiles; all imports resolve |
| Browser interaction tests | Yes (preview harness) | 26 PASS · 1 FAIL · 1 NOT TESTED (§G) |

No failures were found that existed before the redesign. The one FAIL (admin error announcements) comes from the redesign's new `FlagPanel`.

## I. Recommended improvements

**P0 — must fix before a demonstration**
1. Run `npm ci && npm run build && npm run lint && npm test` on a networked machine, and fix anything that surfaces (issue 1).
2. Self-host fonts with `next/font` and confirm the intended typefaces render (issue 3).
3. Stop the floating Vidya button from covering content, and hide it when the lesson side panel is visible (issue 6).
4. In demos, make it explicit which screens show sample data (issue 7). The badges exist; mention them out loud.

**P1 — essential for a polished product**
1. A dedicated junior (Classes 1–5) home and lesson shell: picture tiles, voice-first, minimal text and no exam jargon (issue 2).
2. Translate UI strings into Hindi and Punjabi, starting with student navigation and the parent app (issue 4).
3. Replace emoji with a custom SVG illustration and badge set in the brand palette (issue 5).
4. Fix the contrast of pills and placeholders (issue 8). Make admin form errors accessible (issue 12).
5. Persist lesson path progress; show mastery once in the lesson header (issue 10).
6. Proper fallback lessons, or an honest "AI unavailable" state (issue 11).
7. Mobile header and role switcher: search icon, role menu, "Change class" moved to the profile (issue 13).

**P2 — further premium refinements**
1. Reduce dashboard density: collapse untouched subjects, add a friendly empty chart, move badges to Progress (issue 9).
2. A distinctive brand name and mark, and a short product video or real screenshots on the landing page.
3. Persist tutor history; add a "save to notes" action from the tutor.
4. More labs and richer lab thumbnails; vary the "eyebrow + title" card pattern.
5. Settings inside the shell, ⌘K on Mac, an admin pagination note, and amber for to-dos (issues 14 and 15).
6. Add automated accessibility (axe) and visual-regression tests to CI.

## J. Final verdict

**Visually improved, coherent and credible — but not yet world-class.**

The redesign succeeds at the hard, unglamorous part:

- A real token system, used consistently across 18 routes in two themes.
- A clear "next action" hierarchy.
- An honest treatment of sample data and local-only saves.
- Working keyboard and focus behaviour.
- No mobile overflow.
- A lesson studio whose interactive scenes are genuinely engaging.

Leading EdTech products such as Khan Academy Kids, Duolingo and Brilliant feel world-class because of what sits *on top* of that foundation, and that layer is still missing:

- A recognisable illustration and character language (here: emoji).
- Experiences designed for each age (here: one interface with a font swap for Class 1–5).
- A fully localised interface (here: English chrome).
- Real data behind the adult dashboards (here: samples).

In addition, the production build and intended typography are unverified. Fix the P0 items, then invest in the junior experience, the illustration system and localisation. Those three are what would move this from "good, consistent SaaS" to "premium learning product".
