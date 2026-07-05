---
name: sequence-ui
description: >-
  Build or restyle a Svelte 5 + Tailwind v4 interface to match the Sequence UI
  design system — a dense, flat, sharp, light/dark instrument-panel look (from
  sequence.toys / the "Sequence Toy" app). Use when adding Sequence UI
  components, applying its tokens / type-roles / spacing, or reproducing its
  aesthetic. Triggers: mentions of Sequence UI, sequence-ui, sequence.toys, the
  Sequence Toy look, or requests to add/copy its components.
---

# Sequence UI

Sequence UI is a standalone **Svelte 5 (runes) + Tailwind v4 (CSS-first) + TypeScript** design system with first-class light/dark. Aesthetic: **instrument-panel density** — 12.5px base, very tight spacing, **sharp corners (radius 0)**, **flat surfaces (no shadows)**, hairline borders, **no state-transition animations** (state changes are instant), and monospace reserved for a few punchy roles.

Source of truth: **github.com/vinhowe/sequence-ui** (branch `main`, public). Raw base used below:

```
https://raw.githubusercontent.com/vinhowe/sequence-ui/main/
```

Work in this order: **(1) read the rules → (2) set up the theme once → (3) add components → (4) compose by the rules → (5) verify.** Do not skip step 1 — the look depends on conventions that are easy to violate.

## 1. Read the rules first

Fetch and read the design contract before writing UI (use WebFetch or your file tools):

- `AGENTS.md` — the prescriptive contract with DO/DON'T code: `…/main/AGENTS.md`
- `docs/design-spec.md` — fonts, OKLCH tokens, type/stack scales, dark-mode wiring: `…/main/docs/design-spec.md`
- `llms.txt` — quick machine index: `…/main/llms.txt`

**Non-negotiables** (full detail + examples in AGENTS.md):

- **Type roles, never raw sizes.** Use the 10 `type-*` utilities: `type-display / heading / title / body / caption / label / tag / button / value / code`. **`type-label` is sans** (the field/readout/metric label — the one you usually want); **`type-tag` is mono uppercase** (terse code-like tags: units, HEX/DEC, token names). Never pick a raw `text-*` size in product UI. **Mono only** for `type-button / type-value / type-code / type-tag` and the brand label; **sans** for headings, navigation, prose, and labels.
- **Container-owned spacing.** Base grid `--spacing: 0.25rem` (4px = 1U). Components ship margin-free (no `mt-*`/`mb-*`). Parents stack children with `stack-tight` / `stack-field` / `stack-group` (all 4px) and `stack-section` (16px between sections). A control's label→field gap is `stack-tight` on the control root. Content boxes pad with the `pad-box` utility (not hand-picked `p-*`); running prose uses the `prose` class (owns its own rhythm — the one sanctioned child margin). Run **tight** — SaaS-comfortable spacing is too loose here.
- **Tokens, never hardcoded colors.** shadcn-compatible names (`--background --foreground --card --popover --muted --primary --border --ring …`) + Sequence extensions (`--panel --highlight --border-strong --subtle-foreground --success --warning --warning-strong --destructive-strong --primary-accent --destructive-accent --chart-1..5`). **Accent values operate within Tailwind palette rungs** (`--primary: var(--color-purple-700)` light / `purple-500` dark, destructive→red, success→green, warning→amber, ring→blue); surface grays + charts stay bespoke OKLCH. `--primary-accent`/`--destructive-accent` are a paler dark rung for colored buttons. Dark mode via a `.dark` class.
- **Flat + sharp + still.** No rounded corners, no drop shadows, no glass, no skeuomorphism; hairline `border-border`. **No `transition-*`** — state changes are instant (a global rule enforces it); only continuous feedback (spinners, indeterminate bars) animates via `@keyframes`.
- **Fixed-px icons.** Icon glyphs are 10 / 11 / 13px (not `--spacing`-multiples) so they don't scale with density.
- **Anti-patterns — never do these** (they read as generic AI slop):
  1. A small uppercase-mono eyebrow/overline above a big title. Use one normal sans section heading.
  2. Left-border selection cues (`border-l-2 border-l-primary`) on active nav/list/tree rows. Use a **background fill** (`bg-primary/12`) or text color.
  3. Monospace as a default/fallback font, or for navigation/prose. Mono lives only in its roles.
  4. Over-spacing; rounded corners; drop shadows.

## 2. Set up the theme (once per project)

Prerequisites: Tailwind v4 (`@tailwindcss/vite`) + Svelte 5.

1. **Tokens + type roles + utilities.** Copy `src/app.css` (`…/main/src/app.css`) into your global stylesheet, or merge its pieces: the `:root` (light) and `.dark` token blocks, the `@theme inline` mappings, `@custom-variant dark (&:where(.dark, .dark *))`, the nine `type-*` `@utility` roles, the `stack-*` utilities, and the `@layer base` resets. Import it once in your root layout. (Alternatively use the registry `theme` item at `…/main/static/r/theme.json`, whose `cssVars` carry the light/dark tokens.)
2. **Fonts.** Sans is **Inter** (self-hosted variable, SIL OFL — ships with the system at `static/InterVariable.woff2`). Mono is **Berkeley Mono** (licensed — bring your own mono equivalent and wire `--font-mono`; `--font-sans` is Inter). Keep the mono/sans role split. GOTCHA: keep any `button,input,select,textarea { font: inherit }` reset inside `@layer base`, or it silently beats Tailwind's `font-mono`.
3. **Theming runtime.** Add the `theme-provider` and `theme-toggle` components (step 3), wrap the app in `ThemeProvider`, add the no-flash inline script from the repo's `src/app.html`, and place a `ThemeToggle` in your header.
4. **Project-header motif (optional, on-brand).** A full-width bar: `bg-purple-200 text-purple-900 border-b border-purple-300` (dark: `purple-950 / purple-200 / purple-900`), with the project name in small `font-mono uppercase tracking-wider text-xs`.

## 3. Add a component

**Use the real registry components — do not reinvent them.** Especially in a greenfield app, install from the registry instead of hand-rolling lookalikes: the shipped components carry the exact tokens, type-roles, spacing, keyboard/a11y behavior, and light/dark wiring the look depends on, and reimplementations drift from the system immediately. A good **minimum instrument-panel set** to pull in first: `panel`, `slider`, `number-input`, `select-input`, `action-button`, `theme-provider`, `theme-toggle`.

Reimplement a component locally **only** when the registry item genuinely cannot be installed (a real dependency/tooling blocker) or is mismatched to the interaction you actually need. And when you find yourself wanting a component that doesn't exist yet, **tell the user what's missing and what it's for** — so it can be built into the upstream Sequence UI system rather than forked into one app.

Every component is published as a shadcn-style registry item at `…/main/static/r/<name>.json`.

**A. Manual (most reliable):**
1. Fetch `…/main/static/r/<name>.json`.
2. For each entry in `files[]`, write `content` **verbatim** to the file's `target` path (e.g. `lib/components/controls/slider.svelte` → your `src/lib/components/controls/slider.svelte`). **Preserve the folder structure** — components import each other by relative path, so layout matters.
3. Recursively do the same for every name in `registryDependencies`.
4. Install the npm packages listed in `dependencies` (e.g. `@lucide/svelte`, `tailwind-merge`, `katex`).

**B. shadcn-svelte CLI:**
```sh
npx shadcn-svelte@latest add https://raw.githubusercontent.com/vinhowe/sequence-ui/main/static/r/<name>.json
```
If cross-item dependency resolution fails, fall back to A.

**Catalog** — see `…/main/registry.json`, `…/main/README.md`, or list `static/r/`. Groups:
- **primitives:** `panel`, `collapsible-section`, `pane`
- **controls:** `slider`, `number-input`, `text-input`, `select-input`, `toggle-group`, `checkbox-input`, `radio-input`, `radio-group-input`, `form-label`, `reset-value-button`, `timecode-field`, `bit-field`, `base-field`, `tolerance-field`, `scrub-input`, `angle-field`, `threshold-marker`
- **navigation:** `menu`, `breadcrumb`, `pagination`, `tree`
- **data:** `capacity-bar`, `progress-bar`, `time-brush`
- **feedback:** `statistic`, `note`, `citations`, `tooltip`
- **icons:** `chevron-icon`, `checkbox-icon`, `radio-icon`
- **theme:** `theme-provider`, `theme-toggle`
- **buttons:** `action-button`, `button`, `icon-button`, `segmented-control`

## 4. Compose by the rules

- Group controls inside `Panel` (title + bordered body, defaults to `pad-box stack-field`). Stack sections with `stack-section`; panel grids `gap-1`.
- Labeled inputs pair `<FormLabel>` + the control in a `stack-tight` root (the shipped control components already do this).
- Numeric readouts → `type-value` (mono, tabular). Commands → `ActionButton` or `type-button`. Small instrument labels → `type-tag`.
- Active/selected states → background fill (`bg-primary/12`) or text color, **never** a left border.
- Multi-field inputs (timecode, base, tolerance, IP-style) → **collapsed-border** model: the outer wrapper owns the single border; inner fields are borderless with 1px dividers and tabular widths so digits never shift layout.
- App shell → `position: fixed; inset: 0` so only `main` scrolls (keeps a sticky header pinned + makes fragment nav behave); `sr-only` inputs must sit in a `position: relative` wrapper. (See AGENTS.md → Gotchas.)

Keep the full DO/DON'T set from AGENTS.md open while composing.

## 5. Verify

Run the project's checks (`pnpm check`, `pnpm build`) and view in **both** light and dark (toggle `.dark` on `<html>`, or use `ThemeToggle`). Confirm: no raw `text-*` sizes, no hardcoded colors, no left-border active cues, no shadows/rounded corners, tight spacing.
