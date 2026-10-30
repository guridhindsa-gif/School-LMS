# School LMS — test results (release verification)

Date: 30 October 2026, 05:19–05:40 UTC.

## Environment

| Item | Value |
|---|---|
| Repository | github.com/guridhindsa-gif/school-lms, branch `main` |
| HEAD | `13fb4e6ae2d90aa4d3b5fa02a786b4292bd1d5fb`, "Premium redesign: design system, learning cockpit, lesson studio, labs and role apps" |
| Remote | `git ls-remote origin`: `refs/heads/main` is also `13fb4e6`, so there is no remote drift |
| Machine | Cloud Linux container, Node v22.23.4, npm 10.9.9 |
| Registry | **Unreachable**: `getaddrinfo ENOTFOUND registry.npmjs.org` |
| Linked Mac | `drs-macbook-air-local`. A folder-access request (to run the install there) was **denied**, so no checks ran on it. |

## Headline

- **Production build: NOT RUN.** It is blocked, so it has neither passed nor failed.
- **Real TypeScript check, lint, vitest and Playwright end-to-end against `next start`: NOT RUN.** All blocked.
- **Real API routes and real Ollama: NOT TESTED.**

No check in this file ran against the real application with its real dependencies. The project has no lockfile, so the dependency tree is not reproducible yet.

## Phase 2 checks

The npm log paths below are in the session scratchpad (`rr/`).

| # | Check | Exact command | Exit | Status | Notes |
|---|---|---|---|---|---|
| 1 | Package manager and lockfile | Inspect the repo | – | **Finding** | npm scripts are in `package.json`, but there is **no** `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` or `bun.lockb`. Versions are pinned exactly, but transitive versions are not. |
| 2 | Reproducible install | `npm ci` | 1 | **BLOCKED** | `EUSAGE`: npm ci needs an existing package-lock.json |
| 3 | Install | `npm install --no-audit --no-fund` | 1 | **BLOCKED** | `ENOTFOUND registry.npmjs.org` |
| 4 | Offline install | `npm install --offline` | 1 | **BLOCKED** | `ENOTCACHED` (`@types/node`) |
| 5 | TypeScript | `npx tsc --noEmit` | – | **BLOCKED** | No `node_modules` |
| 6 | Lint | `npm run lint` | – | **BLOCKED** | No `node_modules` |
| 7 | Unit tests | `npm test` | – | **BLOCKED** | No vitest |
| 8 | Production build | `npm run build` | – | **BLOCKED** | No Next.js |
| 9 | Production server and end-to-end | `npm start` plus Playwright | – | **BLOCKED** | There is also **no Playwright end-to-end suite in the repo**, and `@playwright/test` is not a dependency |
| 10 | API routes | `curl` against `/api/*` | – | **BLOCKED** | Needs a running server |
| 11 | Ollama connection and AI-unavailable path | `GET /api/ai/health`, then `POST /api/ai/chat` with Ollama stopped | – | **BLOCKED** | Needs a running server |
| 12 | `npm audit` | `npm audit --omit=dev` | – | **BLOCKED** | Needs registry access |
| 13 | Languages, layouts, persistence, junior, tutor, roles on the real app | Playwright | – | **BLOCKED** | See the supplementary section below |

The install attempts created no files: there is no `package-lock.json` and no `node_modules`.

## Supplementary checks (NOT substitutes for the real checks)

These ran on the current working tree without the project's real dependencies.

**Stub-typed TypeScript**
- Command: `tsc -p scratchpad/verify/tsconfig.check.json` (TypeScript 6.0.3, global)
- Exit 0, no type errors.
- React, Next and framer-motion are stand-in declarations, so real library type errors cannot show up.

**Translation key scan**
- Command: `node scratchpad/verify/keyscan.mjs`
- Exit 0: 2,130 keys, 0 used keys missing.

**Unit tests through a vitest shim (esbuild bundle)**

| Test file | Exit | Result |
|---|---|---|
| `achievements.test.ts` | 0 | 4 pass, 0 fail |
| `adaptive.test.ts` | 0 | 8 pass, 0 fail |
| `expr.test.ts` | 0 | 4 pass, 0 fail |
| `i18n/i18n.test.ts` | 0 | 4 pass, 0 fail |

These test logic only; this is not real vitest.

**Earlier preview-harness runs (29 October)**
- 29 Playwright interactions and the 46-lab render audit.
- They ran against an esbuild bundle with stand-in Next.js, **not** `next build` or `next start`.
- Listed for context only. **They do not count as end-to-end results.**

## Commands to run on a networked machine

```bash
git clone https://github.com/guridhindsa-gif/school-lms && cd school-lms
# (or copy this working tree: the uncommitted work is NOT on GitHub)
node -v                      # use Node 20 LTS or 22
npm install                  # creates package-lock.json: review it and commit it (with approval)
npx next telemetry disable
npx tsc --noEmit             # real type check
npm run lint                 # next lint (eslint-config-next 14.2.15)
npm test                     # vitest run: 20 tests in 4 files expected
npm audit --omit=dev         # expect Next.js advisories: see SECURITY_GAPS.md S-6
npm run build                # production build
npm start &                  # http://localhost:3000

# API smoke tests (with Ollama stopped, then with it running)
curl -s localhost:3000/api/ai/health
curl -s -XPOST localhost:3000/api/ai/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is velocity?"}]}' -w '\n%{http_code}\n'
curl -s -XPOST localhost:3000/api/ai/chat -H 'content-type: application/json' -d '{}' -w '\n%{http_code}\n'   # expect 400
curl -s 'localhost:3000/api/syllabus?board=CBSE&cls=11' | head -c 300
curl -s 'localhost:3000/api/syllabus?board=CBSE&cls=99' -w '\n%{http_code}\n'                                # expect 400

# Mock AI for deterministic end-to-end runs
npm run mock:ollama &        # port 11999
OLLAMA_HOST=http://127.0.0.1:11999 OLLAMA_MODEL=mock npm start
```

The end-to-end suite still has to be written: add `@playwright/test` plus a `tests/e2e/` folder. It should cover:
- onboarding (senior and junior);
- lesson step persistence across reload;
- junior navigation;
- the tutor open/close and focus return;
- AI-unavailable fallback labels;
- each role page's "not connected" default and demo toggle;
- en/hi/pa switching with `<html lang>`;
- widths of 390, 768 and 1440 px.
