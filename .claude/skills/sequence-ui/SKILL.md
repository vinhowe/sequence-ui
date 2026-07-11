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

Sequence UI is a standalone **Svelte 5 (runes) + Tailwind v4 (CSS-first) + TypeScript** design system with first-class light/dark. Aesthetic: **instrument-panel density** — 12.5px base, very tight spacing, **sharp corners (radius 0)**, **flat surfaces (no shadows)**, hairline borders, **no state-transition animations** (state changes are instant), and monospace reserved for a few punchy roles. **North star: high-density professional desktop software** (DAWs, node editors, pro color tools) — **NOT a terminal or hacker cosplay**. Compact but easy to use; sans is the voice of the UI, mono is an instrumentation accent. If a screen reads like a TUI, it's wrong.

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

- **Type roles, never raw sizes.** Use the 10 `type-*` utilities: `type-display / heading / title / body / fine / label / tag / button / value / code`. **`type-label` is sans** (the field/readout/metric label — the one you usually want); **`type-tag` is mono uppercase** (terse code-like tags: units, HEX/DEC, token names). Never pick a raw `text-*` size in product UI. **Mono only** for `type-button / type-value / type-code / type-tag` and the brand label; **sans** for headings, navigation, prose, and labels.
- **Emphasis is color, not size.** `type-body` (12.5px) is the workhorse; make text *secondary* with `text-muted-foreground`/`text-subtle-foreground` on it — same size, lighter — **never shrink to de-emphasize.** `type-fine` (11px) is a *density* escape hatch for genuine fine print only (footnotes, source/paper references, dense annotations), NOT a "secondary text" style. Size = density; color/weight = emphasis.
- **Container-owned spacing.** Base grid `--spacing: 0.25rem` (4px = 1U). Components ship margin-free (no `mt-*`/`mb-*`). Parents stack children with `stack-tight` (4px, parts of one control), `stack-field` (6px, sibling controls in a body), `stack-group` (4px, bordered panels) and `stack-section` (16px between sections). **Proximity invariant:** inner binding is strictly tighter than sibling separation (tight 4 < field 6) — equal gaps fuse a panel into one column; bordered siblings need no whitespace signal (their hairline separates), hence group stays 4px. A control's label→field gap is `stack-tight` on the control root. Content boxes pad with the `pad-box` utility (not hand-picked `p-*`); running prose uses the `prose` class (owns its own rhythm — the one sanctioned child margin). Run **tight** — SaaS-comfortable spacing is too loose here. **A "section" means an `h2`-led page region (specimen/doc pages).** Most product pages (settings, inspectors, control surfaces) use the **RAIL**: `<Rail><CollapsibleSection …/>…</Rail>` — one continuous bordered surface of section header rows, shared hairlines, zero gaps (the `Rail` component owns the outer border + last-row suppression); titles live in the header rows. Nested `CollapsibleSection`s auto-render as quiet twirl-downs (left chevron, indent guide) — zero API, just nest; use for advanced groups, collapsed by default. A 4px-gapped stack of titled `Panel`s is the lighter alternative for 1–2 groups. Never pair an `h2` with a single Panel repeating the same word; never put 16px between plain panels.
- **Size fields to content.** Numeric/unit fields get a content-appropriate width (`fieldClass="w-24"` — NOT `class`, which squeezes the label); only free text, paths, and URLs fill the column. Numeric picks: `Slider` = bounded continuous (position informs); `ScrubInput` = everything else (drag+type, step/precision/unit, floats, spinbutton a11y); `NumberInput` = ScrubInput's integer-count preset (same behavior, one implementation). `hasDefaultValue` means "value currently equals its default" (disables reset). Destructive actions confirm **inline** (two-step arm→confirm on the button + amber `Note`) — no modals exist, don't hand-roll one. `TextInput` takes `prefix`/`suffix` snippets for in-border affixes (a bare `<button>` in a suffix auto-styles as a flush ghost cell — Reveal/Browse); never compose a separate Button beside an input. **Disabled = grayed in place, never hidden:** core controls take `disabled`; gate groups with `ToggleGroup`/`<fieldset disabled>` (children dim at 50%, layout stable). Disable when the user can act nearby to enable; hide only for mode switches.
- **Tokens, never hardcoded colors.** shadcn-compatible names (`--background --foreground --card --popover --muted --primary --border --ring …`) + Sequence extensions (`--panel --bar(+ -foreground/-border/-accent/-accent-foreground) --highlight --border-strong --subtle-foreground --success --warning --warning-strong --destructive-strong --primary-accent --destructive-accent --chart-1..5`). The `--bar-*` set is the AppBar + integrated-ThemeToggle chrome — the single override point for the bar. **Accent values operate within Tailwind palette rungs** (`--primary: var(--color-purple-700)` light / `purple-500` dark, destructive→red, success→green, warning→amber, ring→blue); surface grays + charts stay bespoke OKLCH. `--primary-accent`/`--destructive-accent` are a paler dark rung for colored buttons. Dark mode via a `.dark` class.
- **Flat + sharp + still.** No rounded corners, no drop shadows, no glass, no skeuomorphism; hairline `border-border`. **No `transition-*`** — state changes are instant (a global rule enforces it); only continuous feedback (spinners, indeterminate bars) animates via `@keyframes`.
- **Surface tiers.** Containers are flat: `Panel`/`Pane`/`CollapsibleSection` bodies use `bg-background` and are read by their hairline border, not a fill. Only **fields/controls/chrome** ride the raised tier `bg-card` (headers/tab strips use `bg-panel` = `--card` in dark). `bg-muted` is the **hover/emphasis** step above it — for `hover:`/active states, **never a resting surface** (a resting `bg-muted` block glows as the brightest thing on a flat panel; put code samples / info boxes / stat tiles on `bg-card`). Only bar **tracks** (`ProgressBar`/`CapacityBar`/`TimeBrush`) keep `bg-muted`, so the groove stays visible.
- **One control height.** Every single-line boxed control (buttons, inputs, select triggers, segments, field composites, tabs) is exactly `h-control` (22px) or `h-control-sm` (18px) — **never size a control with `py-*`**, never invent a third height. Composites put `h-control` on the bordered wrapper; borderless innards stretch. Exempt: glyph controls (checkbox/radio), the app bar, textareas, data-viz tracks.
- **Press > hover.** Every control has an instant pressed (`active:`) state one step deeper than its hover; hover stays subtle (one quiet step — loud hover is a consumer-web tell). List rows just hover-highlight. Never hover-without-press. **Tinted feedback uses the theme-scoped step tokens** — `hover:bg-<accent>/(--tint-hover) active:bg-<accent>/(--tint-active)` (solids: `--tint-solid-*`; gradients: `hover:brightness-(--lift-hover)`) — never hand-picked alphas: the tokens run larger in dark for perceptual parity (thin washes lose colorfulness at low luminance), so a numeric alpha silently ships a too-weak dark hover.
- **Selected = primary tint, never surface pairs.** Selection is the accent wash (`bg-primary/12` rows, `bg-primary-accent/15 text-primary-accent` controls) or inversion (`bg-foreground text-background`). Never signal state with two surface tokens (rest `bg-panel` vs selected `bg-card`) — those rungs coincide in dark and the state vanishes.
- **Cursor = desktop convention.** Arrow on ALL controls (buttons, tabs, checkboxes, selects, menus) — never `cursor-pointer` on a control; the pointing hand is for **navigation** (real links, natively). Mechanic cursors where mechanics exist: `ew-resize` (scrub), `grab/grabbing` (thumbs/brushes), text caret in fields. No `cursor-not-allowed` — disabled reads via opacity. (Apple HIG / Spectrum / Tailwind v4 convention; pointer-on-buttons is a consumer-web tell.)
- **Fixed-px icons.** Icon glyphs are 10 / 11 / 13px (not `--spacing`-multiples) so they don't scale with density.
- **Anti-patterns — never do these** (they read as generic AI slop):
  1. A small uppercase-mono eyebrow/overline above a big title. Use one normal sans section heading.
  2. Left-border selection cues (`border-l-2 border-l-primary`) on active nav/list/tree rows. Use a **background fill** (`bg-primary/12`) or text color.
  3. Monospace as a default/fallback font, or for navigation/prose. Mono lives only in its roles.
  4. Over-spacing; rounded corners; drop shadows.

## 2. Set up the theme (once per project)

Prerequisites: Tailwind v4 (`@tailwindcss/vite`) + Svelte 5.

1. **Tokens + type roles + utilities.** Copy `src/app.css` (`…/main/src/app.css`) into your global stylesheet, or merge its pieces: the `:root` (light) and `.dark` token blocks, the `@theme inline` mappings, `@custom-variant dark (&:where(.dark, .dark *))`, the ten `type-*` `@utility` roles, the `stack-*` utilities, and the `@layer base` resets. Import it once in your root layout. (Alternatively use the registry `theme` item at `…/main/static/r/theme.json`, whose `cssVars` carry the light/dark tokens.)
2. **Set the theme/accent color — the USER chooses it, do NOT default to purple.** Purple is Sequence UI's *own* brand accent, not a requirement. Use the color the user specified; **if they haven't specified one, ASK them to pick a color from the Tailwind palette (https://tailwindcss.com/docs/colors) — the brand color is the user's call, so surface the choice rather than silently picking one (or leaving purple).** Once you have their hue: the accent tokens are already Tailwind rungs, so switching is a find/replace of `purple` in the token block: set `--primary` (light `<hue>-700` / dark `<hue>-500`), `--primary-accent` (light `= --primary` / dark a lighter rung like `<hue>-400`), and the `--bar-*` tokens (AppBar chrome: bg / foreground / border / accent(+foreground) — the integrated `ThemeToggle` reads these too, so the bar rebrands from one place; no component hardcodes purple). **Leave alone:** the surface grays, the status colors (`--destructive` red, `--success` green, `--warning` amber), and `--ring` (blue) — those are semantic, not brand.
3. **Fonts.** Sans is **Inter** (self-hosted variable, SIL OFL — ships with the system at `static/InterVariable.woff2`). Mono is **Berkeley Mono** (licensed — bring your own mono equivalent and wire `--font-mono`; `--font-sans` is Inter). Keep the mono/sans role split. GOTCHA: keep any `button,input,select,textarea { font: inherit }` reset inside `@layer base`, or it silently beats Tailwind's `font-mono`.
4. **Theming runtime.** Add the `theme-provider` and `theme-toggle` components (step 3), wrap the app in `ThemeProvider`, add the no-flash inline script from the repo's `src/app.html`, and place a `ThemeToggle` in your header.
5. **Project-header motif (optional, on-brand).** Use the **`AppBar`** component: `<AppBar title="Relay" context="Settings"><ThemeToggle integrated /></AppBar>` — a full-width, brand-hued identity bar. The brand renders **sans semibold sentence-case** (13px) — NOT mono-uppercase (terminal tell, deliberately retired); the optional `context` prop shows the page/location dimmed behind a hairline divider. Pass `integrated` to `ThemeToggle` so it docks as a full-height bar segment (dividers + active chip read the same `--bar-*` tokens). If hand-rolling, its height is app *chrome*, not grid: fixed integer `h-[var(--bar-height)]` (24px), `pl-2`, and **never `py-*`** (at this height, padding rounds unevenly and drifts the toggle/text off-center). Colors come from the `--bar-*` tokens: `bg-bar text-bar-foreground border-t border-t-transparent border-b border-b-bar-border`.

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
- **primitives:** `app-bar`, `panel`, `collapsible-section`, `pane`
- **controls:** `slider`, `number-input`, `text-input`, `select-input`, `toggle-group`, `checkbox-input`, `radio-input`, `radio-group-input`, `form-label`, `reset-value-button`, `timecode-field`, `bit-field`, `base-field`, `tolerance-field`, `scrub-input`, `angle-field`, `threshold-marker`
- **navigation:** `menu`, `breadcrumb`, `pagination`, `tree`
- **data:** `capacity-bar`, `progress-bar`, `time-brush`
- **feedback:** `statistic`, `note`, `citations`, `tooltip`
- **icons:** `chevron-icon`, `checkbox-icon`, `radio-icon`
- **theme:** `theme-provider`, `theme-toggle`
- **buttons:** `action-button`, `button`, `icon-button`, `segmented-control`

After installing, record what you pulled in `.sequence-ui.json` so the app can be updated later — see §6.

## 4. Compose by the rules

- Group controls inside `Panel` (title + bordered body, defaults to `pad-box stack-field`). Stack sections with `stack-section`; panel grids `gap-1`.
- Labeled inputs pair `<FormLabel>` + the control in a `stack-tight` root (the shipped control components already do this).
- Numeric readouts → `type-value` (mono, tabular). Commands → `Button` (the flat default). `ActionButton` (loud gradient) is special-use only — one hero command per surface, never a default; a wall of them is the classic AI tell. Small instrument labels → `type-tag`.
- Active/selected states → background fill (`bg-primary/12`) or text color, **never** a left border.
- Multi-field inputs (timecode, base, tolerance, IP-style) → **collapsed-border** model: the outer wrapper owns the single border; inner fields are borderless with 1px dividers and tabular widths so digits never shift layout.
- App shell → `position: fixed; inset: 0` so only `main` scrolls (keeps a sticky header pinned + makes fragment nav behave); `sr-only` inputs must sit in a `position: relative` wrapper. (See AGENTS.md → Gotchas.)

Keep the full DO/DON'T set from AGENTS.md open while composing.

## 5. Verify

Run the project's checks (`pnpm check`, `pnpm build`) and view in **both** light and dark (toggle `.dark` on `<html>`, or use `ThemeToggle`). Confirm: no raw `text-*` sizes, no hardcoded colors, no left-border active cues, no shadows/rounded corners, tight spacing.

## 6. Staying up to date

Copy-in means there's no package to bump — the registry and rules are always served from `main`, so "your version" is just the `main` SHA you last pulled from. No SHA is baked into the files; read it live from GitHub.

**Record what you pulled.** After installing or updating components, write `.sequence-ui.json` at the project root:

```json
{ "sha": "<main sha>", "components": ["panel", "slider", "action-button"] }
```

Get the current SHA (public repo, no auth needed):

```sh
git ls-remote https://github.com/vinhowe/sequence-ui.git main | cut -f1
```

**Update.** Read `main`'s SHA again; if it differs from your recorded one:

1. Skim what changed — `…/main/CHANGELOG.md` (breaking items + the action to take) and, for the exact diff, `github.com/vinhowe/sequence-ui/compare/<recorded-sha>...main`.
2. Re-fetch `AGENTS.md` / `llms.txt` (always current) if tokens or roles moved.
3. Re-pull the components you use (fetch each `static/r/<name>.json` again, overwrite) and reconcile local edits via your app's own git diff.
4. Bump `sha` in `.sequence-ui.json`.

Your app's git diff is the real changelog for the copied files; the compare URL + `CHANGELOG.md` tell you *why* they changed.
