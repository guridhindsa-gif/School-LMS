# School LMS — release readiness

Date: 30 October 2026. Companion files: [TEST_RESULTS.md](TEST_RESULTS.md) and [SECURITY_GAPS.md](SECURITY_GAPS.md).

## Recommendation: **NOT READY**, for staging or for production

Evidence:
1. **The production build has not passed, because it has never run.** This environment cannot reach the npm registry, the repo has no lockfile, and access to a folder on the linked Mac was denied. Real tsc, lint, vitest, `next build`, `next start` and end-to-end tests are all **blocked**.
2. **There is no real authentication and no server-side role authorisation** (SECURITY_GAPS S-1 to S-4). This is acceptable for a closed demo with no real data. It rules out any real student data.
3. **None of the current work is on GitHub yet.** It is 59 modified and 69 untracked files on top of `13fb4e6`.

**Path to "Ready for staging":**
- Clear UI-P1 items 1 and 2 (or accept them).
- Run the TEST_RESULTS command list on a networked machine, and commit the lockfile.
- Get a green tsc, lint, test and build, plus an end-to-end run of the core flows against `next start`.
- Upgrade Next.js (S-6).
- Put staging behind access protection (host-level password or IP allowlist), with demo data only.

**Path to production:** fix all P0 items in SECURITY_GAPS (auth, server-side RBAC, data scoping, parent–child verification, DPDP consent). Also connect the school data service. Today, "school data is not connected" is the honest state of every staff dashboard.

## 1. Working tree

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD / base | `13fb4e6ae2d90aa4d3b5fa02a786b4292bd1d5fb` (29 Oct 2026, "Premium redesign…") |
| Remote | `origin/main` is also `13fb4e6` (checked with `git ls-remote`). Nothing newer is on GitHub. |
| Modified (tracked) | **59 files**: 2,056 insertions and 1,539 deletions. Of these, 56 are under `src/`; the others are `DESIGN.md`, `README.md` and `tailwind.config.ts`. |
| Untracked | **68 source and doc files** plus `ui-review.zip`, and the `ui-review/` folder (screenshots and reports). |
| Deleted | **None** |

**Untracked source and doc files:**
- `docs/BACKEND_APIS.md`
- `src/lib/i18n/**`: the i18n core, test and 10 dictionaries
- `src/components/art/index.tsx` and `src/components/junior/JuniorWorld.tsx`
- `src/app/student/junior/{learn,play,stars}/page.tsx`
- `src/app/settings/layout.tsx` and `src/app/student/exams/ExamsList.tsx`
- `src/components/labs/types.ts`, plus `packs/` (4 files) and the lab components in `primary/`, `middle/`, `science/` and `senior/` (39 labs plus 3 kit or UI helpers)

**Review of the changes**

The diff matches the refinement brief and the lab expansion:
- i18n (en/hi/pa)
- the junior world for Classes 1–5
- honest role dashboards
- the persistent learning path
- labs, from 7 to 46

There were no stray edits outside `src/`, `docs/`, `DESIGN.md`, `README.md` and `tailwind.config.ts`. `package.json` and config files are untouched. There are no TODO, FIXME or lorem-ipsum markers in `src`. No files are missing: every import resolves under the stub type check, and every used translation key exists (2,130).

**Generated artifacts**
- `ui-review/` holds 36 MB and 160 files before this pass:
  - `REVIEW_REPORT.md` plus "before" screenshots
  - `after/AFTER_REPORT.md` plus 45 screenshots
  - `labs/` with 58 screenshots
- `ui-review.zip` (16 MB) is in the repo root.
- They contain only fictional sample learners and no secrets. All screenshots come from the **preview harness**, not a production build.

**Accidental or risky items**
- `ui-review.zip` and `ui-review/` should not be committed casually: they add 52 MB. Decide before committing (git-ignore them, use a release asset, or Git LFS).
- `AFTER_REPORT.md` is **stale** on two points:
  - It says "1,226 keys in 7 dictionaries"; the tree now has 2,130 keys in 10 files.
  - Its labs screenshots show the old 7-lab catalogue; the current labs are in `ui-review/labs/`.
- Its build section correctly says no real build was run.

## 2. Checks

| Check | Status |
|---|---|
| Dependency install (`npm ci` / `npm install`) | **BLOCKED**: no lockfile, registry unreachable |
| Real TypeScript (`tsc --noEmit`) | **BLOCKED** |
| Lint (`next lint`) | **BLOCKED** |
| Unit tests (real vitest) | **BLOCKED** |
| **Production build (`next build`)** | **BLOCKED: has NOT passed** |
| `next start` plus Playwright end-to-end | **BLOCKED**; there is also no end-to-end suite in the repo |
| API routes and Ollama, including the AI-unavailable path | **BLOCKED** (needs a server) |
| `npm audit` | **BLOCKED** |
| Stub-typed tsc (supplementary) | Pass, exit 0. Not a substitute. |
| i18n key scan (supplementary) | Pass: 2,130 keys, 0 missing |
| Unit tests through the vitest shim (supplementary) | Pass: 20 of 20 in 4 files. Not real vitest. |

Exact commands and exit codes are in TEST_RESULTS.md.

## 3. Authentication and authorisation

**Real authentication: does not exist. Server-side role authorisation: does not exist.** Any visitor can open every role's pages by URL. Details and fixes are in SECURITY_GAPS.md (P0 S-1 to S-5; P1 S-6 to S-11).

## 4. UI review

Reviewed the after-screenshots (desktop, 390 px dark, Hindi and Punjabi, junior) and the relevant components. The junior (1–5) and senior (6–12) experiences are properly separate, and the overall work is sound, so no redesign is recommended.

### P0

None found in the UI itself. The release blockers are the build and security items above.

### P1

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | **Letter-spacing breaks Hindi and Punjabi labels.** `.eyebrow` uses `tracking-[0.1em]`, uppercase and the mono font. The `:lang(hi/pa)` reset covers only h1–h4, so Gurmukhi and Devanagari section labels render letter-spaced, with conjuncts pulled apart. This is visible on the Punjabi parent page ("ਤਰੱਕੀ ਕਾਰਡ ਲਈ ਤੁਹਾਡੀ ਰਾਏ"). | `globals.css:98`, `b04-punjabi-parent.png` | Add `:lang(hi) .eyebrow, :lang(pa) .eyebrow { letter-spacing: 0; text-transform: none; font-family: var(--font-body) }`. Audit the 9 other uppercase or tracking classes the same way. |
| 2 | **Developer text shown to parents and staff.** The not-connected card says "services are listed in docs/BACKEND_APIS.md". | `roles.nc.docs` in `roles.ts` (all 3 languages) | Replace with "Ask your school to connect the data service". Keep the doc reference for admins only. |
| 3 | **"View with demo data" is the primary (filled) button** on parent, teacher and principal pages. The loudest action is the fake-data one. | Not-connected card, `b04` | Make it `.btn-ghost`. Primary emphasis belongs to the working actions (save note, build lesson). |
| 4 | **Technical AI error shown to students:** "Check that the app is running and Ollama is configured", plus a "Check AI settings" button. | Lesson and tutor unavailable states, `d03`, `b02` | For students, say "Vidya is resting right now — use the syllabus lesson". Show the setup hint and settings link only to admins. |
| 5 | **Font rendering is unverified.** next/font self-hosting (Bricolage, Figtree, Baloo 2, Noto Devanagari and Gurmukhi) only takes effect in a real build. The screenshots used harness fonts. | `layout.tsx` | Check in the first real build: no fallback flash, and correct Gurmukhi and Devanagari shaping. |

### P2

| # | Issue | Where |
|---|---|---|
| 6 | The mobile step cards truncate useful text ("Projectile launc…", "Next revision 2…") | Lesson path, `d03` |
| 7 | The lesson tab strip clips at 390 px ("Projectile" is cut off) with no scroll hint | Lesson tabs, `d03` |
| 8 | The "Keep practising at your level" card squeezes text into a narrow column on mobile; it should stack the button below | Lesson, `d03` |
| 9 | The labs subject filter shows EVS, Geography and Biology chips even when the selected class has no labs in them; this leads to empty results | `/student/labs` |
| 10 | Page `<title>` is always English (known; it is server-rendered) | All routes |
| 11 | Hindi and Punjabi copy is machine-quality; it needs review by teachers who are native speakers | All dictionaries |
| 12 | Official data (board, subject and chapter names) stays English in hi/pa by design. This is acceptable, but tell users in Settings. | `b02` |

**Checked and fine:**
- No clipped page-level content and no horizontal overflow (46-lab audit and route screenshots).
- Junior targets are at least 44 px, and junior pages have listen buttons.
- AI output is labelled, and the syllabus fallback is marked "not written by AI".
- Role pages carry no invented figures by default.
- Spacing and radii are consistent with DESIGN.md.
- Contrast flags are limited to disabled buttons.

## 5. Files changed during this verification

| File | Change |
|---|---|
| `ui-review/RELEASE_READINESS.md` | New (this file) |
| `ui-review/TEST_RESULTS.md` | New |
| `ui-review/SECURITY_GAPS.md` | New |

No application code, config, `package.json` or git state was changed. The failed install attempts created no lockfile and no `node_modules`. Nothing was committed, pushed or deployed.
