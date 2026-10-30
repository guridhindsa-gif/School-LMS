# School LMS design system

**Direction: “night studio”.** The product is warm and optimistic, but it is also credible. Midnight ink gives the brand depth. Electric indigo marks anything you can act on. Teal means growth and success, and warm amber is kept for celebration and attention. All of these sit on cool, generous neutrals. The aim is a learning product, not a school ERP.

All tokens live in `src/app/globals.css` as RGB triplets, so Tailwind can add alpha (`bg-primary/10`). `tailwind.config.ts` maps them to classes.

## Colour

| Token | Class | Light | Dark | Use |
|---|---|---|---|---|
| `--primary` | `primary`, `onprimary` | indigo 79 70 229 | 140 150 255 | Primary actions, links, current navigation item, focus ring |
| `--teal` | `teal` | 15 118 110 | 45 212 191 | Growth, completed steps, learning objectives |
| `--accent` | `accent` | amber 245 158 11 | 251 191 36 | Streaks, celebration, things to notice (never errors) |
| `--night`, `--night-2`, `--on-night` | `night`, `night2`, `onnight` | midnight 16 23 50 | 21 30 64 | Hero and focus panels (`.panel-night`), tutor button, lab canvases |
| `--bg`, `--surface`, `--surface-2`, `--surface-3` | `bg`, `surface`, `surface2`, `surface3` | cool neutrals | deep navy | Page, cards, wells, tracks |
| `--ink`, `--muted`, `--line` | `ink`, `muted`, `line` | | | Text, secondary text, borders |
| `--good`, `--warn`, `--bad` | `good`, `warn`, `bad` | 4 120 87 · 154 52 18 · 214 48 64 | | Status only. `warn` is the amber *text* colour. Light-mode values are darkened so small text on 15–20% tints passes WCAG AA (≥ 4.5:1) |

**Mastery scale:** amber (started) → indigo (practising) → green (strong), via `masteryColor()` in `ui.tsx`. Learners who are trying are never shown in red.

**Legacy aliases:** `board`, `board2`, `chalk`, `marigold` and `sky`, and the CSS variables `--board`, `--chalk`, `--marigold` and `--sky`, still resolve to the new tokens. Prefer the new names in new code.

## Type

- **Display:** Bricolage Grotesque, set tight (−0.015em).
- **Body:** Figtree.
- **Data:** IBM Plex Mono.
- **Junior display:** Baloo 2.
- **Hindi and Punjabi:** Noto Sans Devanagari and Noto Sans Gurmukhi are in every font stack.

Fonts are **self-hosted with `next/font`** (`src/app/layout.tsx`). They are downloaded at build time and served by the app, so there is no runtime request to Google Fonts. Indic and mono faces are not preloaded. `:lang(hi)` and `:lang(pa)` remove negative tracking and loosen line height for Indic scripts.

Section labels use sentence-case `text-sm font-semibold text-muted`; avoid stacking uppercase mono eyebrows. Page titles use `.h-page`, section titles `.h-section`.

## School stages

`AppShell` sets `data-stage="junior"` on `<html>` for Classes 1–5. Junior swaps the display font to Baloo 2, enlarges the base size to 17px and rounds cards (`--r-card` 1.5rem) and controls. Classes 6–12 keep the more mature default.

## Illustration system (`src/components/art`)

Flat, rounded shapes drawn only with design tokens, so every picture adapts to light and dark themes. Pictures are decorative by default (`aria-hidden`).

- `Vidya`: the tutor character, a friendly diya, the lamp of learning. Moods: `happy`, `think`, `cheer`.
- `SubjectArt`: about 15 subject illustrations, chosen by subject name.
- `DestinationArt`: Learn, Play, Stars and Vidya scenes for the junior world.
- `BadgeMedal`: achievement medals built from Lucide icons, replacing emoji.
- `Star`, and `EmptyArt` for empty states (progress, saved, search, activity, general).

Emoji are no longer used in interface chrome. AI-generated lesson content may still contain emoji.

## Junior Learning World (Classes 1–5)

It is a separate experience, not a rounded senior interface. Home has a Vidya greeting with audio, a big "Today's lesson" card, and four illustrated destinations: **Learn**, **Play & Explore**, **My Stars** and **Ask Vidya**. There are matching junior routes (`/student/junior/*`) and a 4-item navigation.

Rules:
- Targets of at least 44 px.
- A listen button for every instruction.
- Optional voice navigation where the browser supports speech recognition.
- Stars are earned from real correct answers.
- No placement, revision, exam or analytics language.

## Language

Every interface string comes from `src/lib/i18n/messages/*` in English, हिंदी and ਪੰਜਾਬੀ. `i18n.test.ts` fails if any key is missing, has mismatched `{placeholders}`, or is duplicated across files. Use `const { t, tf, locale } = useT()`; `tf(key, fallback)` is for translated data such as lab names. The language is the saved profile language and drives `<html lang>`. Data from official sources (syllabus, unit and exam names) is shown as published.

## Shape, depth and motion

- **Radii:** `rounded-card` (`--r-card`) and `rounded-ctl` (`--r-ctl`).
- **Elevation:** `shadow-soft` for resting cards, `shadow-lift` on hover and for hero panels, `shadow-float` for drawers, popovers and the tutor button.
- **Motion:** one easing curve, `cubic-bezier(.22,1,.36,1)`. Entrances are 0.45s, controls 0.15s. `prefers-reduced-motion` turns off animations globally, and framer-motion uses `useReducedMotion` for anything that moves.

## Components (`src/components/ui.tsx` and `globals.css`)

- **Buttons:**
  - `.btn-primary`: the one main action per area.
  - `.btn-ghost`: secondary actions.
  - `.btn-soft`: quiet actions.
  - `.btn-accent`: rare, for celebratory moments.
  - `.btn-icon`: square icon buttons.
  - `.btn-board`: actions on night panels.
- **Surfaces:** `.card`, `.card-hover` and `.panel-night`.
- **Controls:**
  - `.seg`: segmented control. Pair it with `role="radio"` plus `aria-checked`, or with `aria-pressed`.
  - `.input`: text inputs. Set `aria-invalid="true"` to show the error border.
  - `.pill` and `.tag`: small labels.
- **Feedback:**
  - `PageHeader`: the standard page heading.
  - `Notice` (info, success, warn or error): errors are announced immediately, the others politely.
  - `Empty`: designed empty states.
  - `Skeleton` and `Dots`: loading states.
  - `SampleBadge`: marks figures that are illustrative until the school data service exists.
- **Accessibility:**
  - Form errors are linked with `aria-describedby` and `aria-invalid`, summarised in `role="alert"`, and focus moves to the first invalid field.
  - `useFocusTrap(ref, open, onClose)` is used by the tutor drawer and the command palette. It traps Tab, closes on Escape and returns focus to the element that opened it.
  - `.skip-link` jumps to `#main`.
  - Grid children may shrink by default (`:where(.grid) > * { min-width: 0 }`), so long text can never widen a page on a phone.

## Rules

1. One clear next action per screen; don't make every metric equally loud.
2. Never show success for something that didn't happen. Saves that stay in the browser say so.
3. School figures are never invented. Role dashboards show "not connected" by default; demo data is opt-in, bannered, and carries `SampleBadge`.
4. When the AI is unavailable, say so, and offer the syllabus-based alternative labelled as not AI-generated.
5. One entry point to Vidya per screen: the header button, or the side panel in the lesson studio.
6. Charts carry text labels and legends, and use colour pairs readable in both themes.
7. Gamification (`src/lib/achievements.ts`) is derived only from real learner state.
