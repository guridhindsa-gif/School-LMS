# School LMS — security and data-integrity gaps

Audited 30 October 2026, by reading the code at HEAD `13fb4e6` plus the uncommitted working tree. No dynamic testing was possible because no server could be started (see TEST_RESULTS.md).

## Bottom line

- **Real authentication does not exist.** There is no sign-in, no session, no `middleware.ts`, and no user identity anywhere in the app.
- **Server-side role-based authorisation does not exist.** `/student`, `/teacher`, `/parent`, `/principal`, `/admin` and `/settings` are public pages. The role switcher (`RoleShell.tsx`) is navigation, not a permission check.
- **The app is NOT safe for real student data.** Today it holds no school data on a server. Learner progress and staff work live in each browser's `localStorage`. That is the only reason the missing auth is not already a data breach. Any backend connected without fixing the P0s below would expose student data.

## What is sound today

| Area | Finding |
|---|---|
| Secrets | `OLLAMA_API_KEY` is read only in `src/lib/ollama.ts`, which imports `server-only`. It is sent only as an `Authorization` header to the Ollama host. There are no `NEXT_PUBLIC_*` variables. `.env*` files are git-ignored. `.env.example` has empty values. No keys, tokens or emails were found in `src`, `docs` or `ui-review`. |
| Input validation | Every AI POST route parses its body with zod (`src/lib/validate.ts`). Lengths, array sizes, enums and class range are bounded. Chat roles are limited to `user` and `assistant`, so a client cannot inject a `system` message. Model output is validated (`questionOut`, `sanitizeLesson`), and invalid items are dropped. |
| Error handling | `errorResponse` returns generic 500s and logs on the server. Zod issues are truncated to 5. |
| AI output rendering | `react-markdown` 9 without `rehype-raw`, so raw HTML is not rendered and the default URL transform strips `javascript:` links. Links open with `rel="noopener noreferrer"`. The only `dangerouslySetInnerHTML` is the static theme script in `layout.tsx`, with no user input. |
| Student PII to AI | The AI context (`ctxSchema`) carries board, class, subject, topics, mastery and language. **It does not carry the student's name**, though free-text chat can contain anything the child types. |
| Honesty | Role dashboards show "not connected" by default; demo data is opt-in and labelled. |

## Gaps

### P0: must be fixed before any real student, parent or staff data

| ID | Gap | Evidence | Required fix |
|---|---|---|---|
| S-1 | **No authentication or session management** | No auth library, no cookies, no `middleware.ts`. Every route renders for anyone. | Add real sign-in with an established library or IdP (school SSO / OIDC; OTP for parents). Use HttpOnly, Secure, SameSite cookies with expiry and rotation. Sign-out must invalidate the session on the server. |
| S-2 | **No server-side authorisation** | Role is chosen client-side. `/admin`, `/principal` and `/teacher` are reachable by URL. | Check the role and scope in **every** route handler and server action (`docs/BACKEND_APIS.md` §1). Middleware redirects alone are not enough; see S-6. |
| S-3 | **No student-data access model** | Progress is per browser, with no user ID. | Scope every record by `schoolId` + `userId`. A teacher sees only their sections, a parent only their linked children, and a student only themselves. Deny by default. Write tests for cross-tenant and cross-student access (IDOR). |
| S-4 | **No parent–child relationship verification** | `ParentNote.child` is a free-text field. | Link parents to children on the server, verified by the school (invite code or admin approval). Never trust a `childId` sent by the client. |
| S-5 | **Children's data and consent (DPDP Act 2023)** | No consent capture. Chat text from minors can go to Ollama Cloud, a third party, when `OLLAMA_API_KEY` is set. Junior voice navigation uses the browser's `SpeechRecognition`, which in Chrome sends audio to Google. | Get verifiable parental consent per child and per purpose before processing. Disclose AI and voice processors. Offer self-hosted Ollama for schools that need data to stay local. Let voice be switched off by default for juniors until consent is given. Confirm the rules with counsel. |

### P1: before staging is exposed beyond the team

| ID | Gap | Evidence | Fix |
|---|---|---|---|
| S-6 | **Next.js 14.2.15 has known advisories** | Includes CVE-2025-29927 (authorisation bypass through middleware, fixed in 14.2.25). Others may apply too, but `npm audit` could not run. | Upgrade to the latest 14.2.x patch (or a supported major), run `npm audit`, and commit a lockfile. Never rely on middleware alone for auth. |
| S-7 | **Unauthenticated, unthrottled AI endpoints** | `/api/ai/chat`, `lesson`, `questions` and `visual` are open, with no rate limit. Each call spends model compute (and Ollama Cloud credits). | Require a session, and rate-limit per user and per IP (for example a token bucket at the edge). Cap concurrent streams. Set a request body size limit. |
| S-8 | **No security headers** | `next.config.mjs` sets only `poweredByHeader: false`. | Add a CSP (nonce for the theme script), `frame-ancestors 'none'`, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` (microphone=self) and HSTS at the host. |
| S-9 | **No lockfile, so the supply chain is not reproducible** | No lockfile of any kind. | Commit `package-lock.json`, use `npm ci` in CI, and enable Dependabot or Renovate. |
| S-10 | **No CSRF strategy yet** | Not exploitable today (there are no cookies), but it will be once sessions exist. | SameSite=Lax/Strict cookies plus Origin checks on state-changing routes, or use server actions' built-in origin check. |
| S-11 | **Prompt injection through context and chat** | `ctx` strings and chat text are put into prompts. | Not a data risk today. Once tools or retrieval over student records are added, never give the model data the requester is not authorised to see, and keep AI output labelled as AI. |

### P2: hardening

| ID | Gap | Fix |
|---|---|---|
| S-12 | `GET /api/ai/health` is public and returns the Ollama host, model, whether a key is set, and up to 30 model names | Return only `{ ok }` to students. Show the details only to an authenticated admin. |
| S-13 | `/api/syllabus?q=` has no length limit on `q` | Cap the length at about 100 characters, and validate `board` against known values. |
| S-14 | Junior safety: free chat with an LLM for Classes 1–5 | Add a moderation pass (input and output) and an age-appropriate system prompt check. Log flagged chats for the school, with consent. |
| S-15 | `localStorage` holds the learner's name and progress unencrypted on shared devices | Add a "This is a shared device" option and a sign-out that clears local state. |
| S-16 | 36 MB of screenshots (`ui-review/`) and a 16 MB `ui-review.zip` sit untracked in the repo root | They contain only fictional sample learners ("Harpreet", "Meher"). Keep them out of git, or put them in a release asset or Git LFS. Add `ui-review.zip` to `.gitignore`. |
