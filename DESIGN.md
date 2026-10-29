# School LMS design system

**Direction: “night studio”.** The product is warm and optimistic, but it is also credible. Midnight ink gives the brand depth. Electric indigo marks anything you can act on. Teal means growth and success, and warm amber is kept for celebration and attention. All of these sit on cool, generous neutrals. The aim is a learning product, not a school ERP.

All tokens live in `src/app/globals.css` as RGB triplets, so Tailwind can add alpha (`bg-primary/10`). `tailwind.config.ts` maps them to classes.

## Colour

| Token | Class | Light | Dark | Use |
|---|---|---|---|---|
| `--primary` | `primary`, `onprimary` | indigo 79 70 229 | 140 150 255 | Primary actions, links, current navigation item, focus ring |
| `--teal` | `teal` | 13 148 136 | 45 212 191 | Growth, completed steps, learning objectives |
| `--accent` | `accent` | amber 245 158 11 | 251 191 36 | Streaks, celebration, things to notice (never errors) |
| `--night`, `--night-2`, `--on-night` | `night`, `night2`, `onnight` | midnight 16 23 50 | 21 30 64 | Hero and focus panels (`.panel-night`), tutor button, lab canvases |
| `--bg`, `--surface`, `--surface-2`, `--surface-3` | `bg`, `surface`, `surface2`, `surface3` | cool neutrals | deep navy | Page, cards, wells, tracks |
| `--ink`, `--muted`, `--line` | `ink`, `muted`, `line` | | | Text, secondary text, borders |
| `--good`, `--warn`, `--bad` | `good`, `warn`, `bad` | | | Status only. `warn` is the amber *text* colour |

**Mastery scale:** amber (started) → indigo (practising) → green (strong), via `masteryColor()` in `ui.tsx`. Learners who are trying are never shown in red.

**Legacy aliases:** `board`, `board2`, `chalk`, `marigold` and `sky`, and the CSS variables `--board`, `--chalk`, `--marigold` and `--sky`, still resolve to the new tokens. Prefer the new names in new code.

## Type

- **Display:** Bricolage Grotesque, set tight (−0.015em).
- **Body:** Figtree.
- **Data and eyebrows:** IBM Plex Mono.
- **Hindi and Punjabi:** Noto Sans Devanagari and Noto Sans Gurmukhi are in every font stack.

Page titles use `.h-page`, section titles `.h-section` and small caps labels `.eyebrow`.

## School stages

`AppShell` sets `data-stage="junior"` on `<html>` for Classes 1–5. Junior swaps the display font to Baloo 2, enlarges the base size to 17px and rounds cards (`--r-card` 1.5rem) and controls. Classes 6–12 keep the more mature default.

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
  - `useFocusTrap(ref, open, onClose)` is used by the tutor drawer and the command palette. It traps Tab, closes on Escape and returns focus to the element that opened it.
  - `.skip-link` jumps to `#main`.
  - Grid children may shrink by default (`:where(.grid) > * { min-width: 0 }`), so long text can never widen a page on a phone.

## Rules

1. One clear next action per screen; don't make every metric equally loud.
2. Never show success for something that didn't happen. Saves that stay in the browser say so.
3. Sample figures always carry `SampleBadge`.
4. Charts carry text labels and legends, and use colour pairs readable in both themes.
5. Gamification (`src/lib/achievements.ts`) is derived only from real learner state.
