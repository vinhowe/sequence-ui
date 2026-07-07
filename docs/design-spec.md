# Sequence UI Design Spec

Sequence UI is a Svelte 5 runes, Tailwind v4 CSS-first, TypeScript design system. Its visual language is dense instrument-panel UI: compact, flat, sharp, and precise. It was extracted from the Sequence Toy app and adds first-class light/dark theming.

The north star is **high-density professional desktop software** — DAWs, node editors, pro color/photo tools — **not a terminal**. Compact but easy to use: sans carries the interface (headings, labels, navigation, prose); mono is an instrumentation accent reserved for values, code, and terse tags. Density derives from a small set of scalable units (`--spacing`, `--text-base`, `--pad-box`) so the proportions survive scaling (e.g. the coarse-pointer bump); less-dense presets are a future goal once this density is fully dialed in.

## Fonts

Sequence UI uses two font families:

- Mono: `Berkeley Mono Variable`
- Sans: `Inter` (self-hosted v4.1 variable, SIL OFL)

In this repo, Berkeley Mono is bundled for local dev and the gallery as `static/Berkeley Mono Variable.woff2` and loaded in `src/app.css`:

```css
@font-face {
	font-family: 'Berkeley Mono Variable';
	src: url('/Berkeley Mono Variable.woff2') format('woff2-variations');
	font-weight: 400 700;
	font-style: normal;
	font-display: swap;
}
```

Inter is open (SIL OFL), so it ships with the system — self-hosted as the v4.1 variable font `static/InterVariable.woff2`, loaded in `src/app.css`:

```css
@font-face {
	font-family: 'Inter';
	src: url('/InterVariable.woff2') format('woff2');
	font-weight: 100 900;
	font-style: normal;
	font-display: swap;
}
```

Consumers get Inter for free. Berkeley Mono is licensed — consumers ship their own mono; if a project cannot, keep the same mono/sans role split and substitute a licensed equivalent through `--font-mono`.

Tailwind font mappings in `@theme inline`:

```css
--font-mono: 'Berkeley Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace;
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

## OKLCH Tokens

Tokens are shadcn-compatible CSS variables plus Sequence-specific extensions. Tailwind utilities consume them through `@theme inline` mappings such as `--color-background: var(--background)`.

Light surface ladder:

| Token | Value |
| --- | --- |
| `--background` | `oklch(1 0 0)` |
| `--card` | `oklch(1 0 0)` |
| `--popover` | `oklch(1 0 0)` |
| `--muted` | `oklch(0.97 0 0)` |
| `--panel` | `oklch(0.96 0 0)` |
| `--border` | `oklch(0.87 0 0)` |
| `--border-strong` | `oklch(0.71 0 0)` |

Dark surface spread:

| Token | Value | Role |
| --- | --- | --- |
| `--background` | `oklch(0.15 0 0)` | canvas — also the flat container body |
| `--card` | `oklch(0.2 0 0)` | raised tier: fields, controls, code blocks |
| `--popover` | `oklch(0.205 0 0)` | overlay surface |
| `--panel` | `oklch(0.2 0 0)` | raised chrome: headers, tab strips, IconButton/Menu/Pagination (== `--card`) |
| `--muted` | `oklch(0.235 0 0)` | hover / emphasis step above the raised tier |
| `--border` | `oklch(0.34 0 0)` | hairline border |
| `--border-strong` | `oklch(0.48 0 0)` | stronger divider |

**Surface model (both themes).** Containers are *flat* — `Panel` / `Pane` /
`CollapsibleSection` bodies use `bg-background` and are read by their hairline
border, not a fill. Only **fields, controls, and chrome** are lifted onto the
raised tier (`--card` / `--panel`, which coincide in dark). `--muted` is the
**hover / emphasis** step *above* the raised tier — use it for `hover:` / active
states, **never as a resting surface** (a resting `bg-muted` block becomes the
brightest thing on a flat panel and glows). The one deliberate exception is bar
**tracks** (`ProgressBar` / `CapacityBar` / `TimeBrush`), which stay on `bg-muted`
so the unfilled groove reads clearly. In light mode `--card` and `--background`
are both white, so containers were always flat there; the model just makes dark
match rather than raising container bodies.

Accent tokens operate within the **Tailwind palette rungs**, behind the semantic
names (set as e.g. `--primary: var(--color-purple-700)`). Components keep using
`bg-primary` / `text-destructive`; only the values are rungs. Surface grays (above)
and the chart palette (below) stay bespoke — Tailwind neutrals are spaced too wide
for the tight surface ladder, and the charts are a curated categorical set.

| Token | Light | Dark |
| --- | --- | --- |
| `--primary` | `purple-700` | `purple-500` |
| `--primary-accent` | `= --primary` | `purple-400` |
| `--destructive` | `red-600` | `red-500` |
| `--destructive-accent` | `= --destructive` | `red-400` |
| `--destructive-strong` | `red-700` | `red-400` |
| `--success` | `green-600` | `green-500` |
| `--warning` | `amber-400` | `amber-400` |
| `--warning-strong` | `amber-700` | `amber-300` |
| `--highlight` | `amber-300` | `amber-400` |
| `--ring` | `blue-500` | `blue-400` |

`--primary-accent` / `--destructive-accent` are the accent-on-surface variants used by
the colored `Button` / `SegmentedControl` — identical to the base in light, a lighter
rung in dark so colored buttons soften on the dark ground without weakening
solid-primary fills (which keep `--primary` for white-on-primary contrast).

**Purple is Sequence UI's own brand default, not a requirement — and the brand color
is the user's decision.** A consuming app uses its own primary/brand hue; if the user
hasn't specified one, **ask them to pick a color from the
[Tailwind palette](https://tailwindcss.com/docs/colors)** rather than defaulting to
purple or choosing for them. Once you have their hue, since the accents are already
rungs, switching is a
find/replace of `purple` in the token block: `--primary` (light `<hue>-700` / dark
`<hue>-500`), `--primary-accent` (dark → a lighter rung such as `<hue>-400`), and the
`--bar-*` tokens (the AppBar chrome — see below). Leave the
surface grays, the status colors (`--destructive`/`--success`/`--warning`), and
`--ring` (blue) — those are semantic, not brand.

App-bar chrome tokens — a brand-hued spread used by `AppBar` and the integrated
`ThemeToggle`, so the bar rebrands from one place and neither component hardcodes a
hue. Point these at your hue's rungs to rebrand the bar:

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bar` | `purple-200` | `purple-950` | bar surface |
| `--bar-foreground` | `purple-900` | `purple-200` | bar text |
| `--bar-border` | `purple-300` | `purple-900` | bar border + toggle dividers |
| `--bar-accent` | `purple-300` | `purple-800` | integrated toggle active chip |
| `--bar-accent-foreground` | `purple-950` | `purple-50` | active chip text |

Categorical chart palette:

| Token | Light | Dark |
| --- | --- | --- |
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.7 0.2 41.116)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.7 0.13 184.704)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.62 0.15 227.392)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.83 0.19 84.429)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.77 0.19 70.08)` |

The dark chart values preserve each series hue for identity across themes.

## Density And Type Scale

Base document type is 12.5px:

```css
html {
	font-size: 16px;
}

body {
	@apply bg-background text-foreground font-sans text-base;
}
```

Tailwind text sizes are retuned in `@theme inline`. Distinct role sizes are 10, 11, 12, 12.5, 15, and 17px. UI must use semantic type roles, not raw `text-*` sizing.

| Role | Utility | Font | Use |
| --- | --- | --- | --- |
| Display | `type-display` | sans | rare top-level display, 17px |
| Heading | `type-heading` | sans | section headings, 15px |
| Title | `type-title` | sans | panel titles, 12.5px |
| Body | `type-body` | sans | prose and normal UI text, 12.5px |
| Fine | `type-fine` | sans | fine print — footnotes, references, dense annotations, 11px |
| Label | `type-label` | sans | field / metric / readout labels, 12px |
| Tag | `type-tag` | mono uppercase | terse code-like tags — units, HEX/DEC, token names, 10px |
| Button | `type-button` | mono uppercase | command labels, 11px |
| Value | `type-value` | mono tabular | numeric readouts and value inputs, 12.5px |
| Code | `type-code` | mono | code and radix/base editing, 12.5px |

Mono is reserved for punchy semantic uses only: buttons, numeric values/readouts, code, and terse instrument tags (`type-tag`). Sans carries branding too — the AppBar title is sans semibold sentence-case. Sans is used for headings, navigation, prose, and labels (`type-label`).

**Emphasis is color + weight, not size.** The base is 12.5px (`type-body`). De-emphasize by dropping color — `type-body` + `text-muted-foreground`/`text-subtle-foreground`, same size, lighter — never by shrinking. `type-fine` (11px) is a density escape hatch for genuine fine print (footnotes, references, dense annotations), not a "secondary text" style. In short: size = information density; color/weight = emphasis.

Headings are understated: sans, medium weight, tight tracking, and followed by space from the parent stack. They are not big/bold display treatments.

## Stack Scale

Tailwind spacing is globally tightened:

```css
--spacing: 0.25rem; /* 4px = 1U; every gap/padding/size is a multiple */
--radius: 0rem;
```

On coarse pointers, `html` font-size becomes `18px`, which scales the rem-based grid (and everything else) up ~12% for touch targets.

Spacing is owned by containers. Components should not ship external margins. The stack utilities are:

Two levels: a tight 4px within/between related controls, and a real 16px break above each section heading. Every gap resolves to one of them — no ad-hoc margins on panels/headings.

| Utility | Tailwind gap | Rem | Use |
| --- | --- | --- | --- |
| `stack-tight` | `gap-1` | 0.25rem (4px) | parts of one control, label to field |
| `stack-field` | `gap-1.5` | 0.375rem (6px) | sibling controls inside a panel body |
| `stack-group` | `gap-1` | 0.25rem (4px) | heading + panels within a section |
| `stack-section` | `gap-4` | 1rem (16px) | page sections (a real break above each heading) |

**Proximity invariant.** Whitespace encodes grouping, so inner binding must be
strictly tighter than sibling separation: label→field (4px) < control→control
(6px). Equal gaps fuse a panel body into one undifferentiated column — this was
a real regression, not a hypothetical. The invariant governs *unbordered*
siblings only; bordered containers (panels in a group, rail rows) are separated
by their hairlines, so their gap is a seam and stays at 4px (or 0, contiguous).
6px (1.5U) is the minimal sanctioned step above 4px — half-units are already
part of the system where a full unit overshoots (`h-control` = 5.5U).

### Control height

Every single-line boxed control — buttons, text/number inputs, select triggers,
segmented clusters, field composites, `Pane` tabs — is **exactly** `h-control`
(md) or `h-control-sm` (sm):

```css
--spacing-control: calc(var(--spacing) * 5.5); /* 22px */
--spacing-control-sm: calc(var(--spacing) * 4.5); /* 18px */
```

Never size a control with `py-*` (padding-derived heights drift by a pixel across
components and break composed rows — an input next to a button used to sit 23px vs
22px), and never invent a third height. Composites (`ToleranceField`,
`TimecodeField`, `BitField`) put `h-control` on the bordered wrapper; borderless
innards stretch to fill. Exempt: inline glyph controls (checkbox/radio, reset ↺),
the app bar (`--bar-height` domain), multi-line areas, and data-viz tracks.
`scripts/audit/control-heights.js` asserts the invariant on any rendered page.

### Interaction feedback

Press over hover, per desktop convention: every control carries an instant
**pressed** (`active:`) state one step deeper than its hover — macOS push buttons
don't light on hover at all, and Windows/pro tools hover only subtly, but *both*
acknowledge the press. Hover in Sequence UI is one quiet step (`hover:bg-muted`
on gray controls, a small alpha bump on tinted ones, `hover:brightness-105` on
the ActionButton gradient; pressed = `active:bg-border/50`, a further alpha bump,
or `active:brightness-90` respectively). List rows (menu items, tree rows,
options) hover-highlight and act on click with no separate pressed step, like
native lists. Everything is instant under the no-transition rule.

Hover/press parity is **perceptual, not numeric**: thin accent washes lose
perceived colorfulness at low luminance (the Hunt effect), and the dark
ActionButton gradients are pastels near the sRGB channel ceiling where a small
`brightness()` lift partially clips into a no-op. Dark mode therefore uses
nominally larger steps so both themes *feel* the same — and that correction is
**encoded once as theme-scoped step tokens**, not per-component:

| Token | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--tint-hover` | 12% | 20% | thin accent washes (outline/ghost hover) |
| `--tint-active` | 20% | 30% | their pressed step |
| `--tint-solid-hover` | 25% | 35% | solid tinted fills (hover) |
| `--tint-solid-active` | 35% | 45% | their pressed step |
| `--lift-hover` | 1.05 | 1.1 | gradient/filled buttons (`hover:brightness-(--lift-hover)`) |

Write `hover:bg-primary-accent/(--tint-hover) active:bg-primary-accent/(--tint-active)`
(Tailwind v4 var-opacity) and dark parity comes free. Never hand-pick a hover
alpha — a numeric value silently ships a too-weak dark hover. Gray-ladder
feedback (`hover:bg-muted` / `active:bg-border/50`) needs no tokens; the surface
tokens already flip per theme.

### Selected state

Selection is expressed with the **primary tint** — `bg-primary/12` on rows
(Tree, sidebar nav), `bg-primary-accent/15 text-primary-accent` on controls
(SegmentedControl segments, IconButton `active`) — or by **inversion**
(`bg-foreground text-background`, Pagination's current page). Never signal
state by pairing two gray-ladder surfaces (rest `bg-panel` vs selected
`bg-card`): the ladder is a *layering* system and its rungs coincide in dark
(`--panel` == `--card`), so surface-pair states silently disappear there.

### Disabled states

Disabled controls are **grayed in place, never hidden**: `opacity-50` on the
control (label included), natively inert — and per the cursor policy, no
`not-allowed` cursor; the control simply doesn't respond, like a native one.
Every core control takes `disabled`. Groups gate via `ToggleGroup`, which wraps
children in a native `<fieldset disabled>` — every form control inside goes
inert with zero per-child wiring, and a base rule (`fieldset:disabled {
pointer-events: none }`) extends that to div-based drag surfaces (Slider track).
The rule of thumb (per Apple HIG): **disable when the user can act nearby to
enable it** (the gate checkbox is adjacent; layout stays stable and users see
what enabling unlocks); **hide only for contextual irrelevance** (a mode switch
showing different properties, Blender-inspector-style).

### Cursor policy

Desktop convention, matching the north star: the **arrow** is the cursor for every
control — buttons, tabs, segments, checkboxes, selects, menu items, collapsible
headers. `cursor: pointer` means **navigation** and appears only on real links
(`<a href>`, which gets it natively). Mechanic cursors are required where a drag
mechanic exists and communicate *how the control operates*, not that it is
clickable: `ew-resize` (ScrubInput, TimeBrush edges, ThresholdMarker marker),
`grab`/`grabbing` (Slider thumb, AngleField dial, TimeBrush body), and the text
caret in text fields. Disabled controls do not use `cursor-not-allowed` — opacity
communicates the state and the control sits inert, as native controls do. (Same
stance as Apple HIG, Adobe Spectrum, and Tailwind v4 preflight.)

Panel defaults from `Panel.svelte`:

```ts
headerClass = 'bg-panel border-b border-border px-1 py-0.5 flex justify-between items-center text-panel-foreground gap-2'
contentClass = 'pad-box stack-field'
```

Every content box — panel/CollapsibleSection/Pane/ToggleGroup body, code blocks, callouts — pads with the `pad-box` utility (`padding: var(--pad-box)`), not a hand-picked `p-*`. `--pad-box` starts at 1U (4px) and is decoupled from `--spacing`, so bumping it reflows every box at once. This is the single source of truth for box padding; never set `p-2`/`p-3` on an individual box.

Panel grids and button/control clusters use `gap-1`; sections stack with `stack-group` inside a `stack-section` page column. A container owns the gap; children never set external margins.

Running text is the one exception. A paragraph of prose (panel/section descriptions, help copy) uses the `prose` utility, which `@apply`s `type-body` and additionally owns its vertical rhythm: `margin-block` of 1U on each edge, zeroed at a stack's first/last child (modeled on `@tailwindcss/typography`'s `prose`). With the stack's own 4px gap that yields an 8px boundary against adjacent controls, and the block sits flush at the panel edges. It's an explicit marker so the control text that also wears `type-body` (inputs, menu items, option labels) is unaffected — real running text gets `prose`; UI text keeps its `type-*` role. This is the only margin a child may carry, and it lives in the utility (`@layer components`, so it beats Preflight's `p{margin:0}` yet yields to an explicit `mt-*`).

## Light And Dark Wiring

Theme is end-to-end class-based.

1. `ThemeProvider` defines `ThemeMode = 'light' | 'dark' | 'system'`.
2. It reads localStorage key `sequence-ui-theme`.
3. Invalid or missing storage falls back to `defaultTheme`, which defaults to `system`.
4. `system` resolves through `window.matchMedia('(prefers-color-scheme: dark)')`.
5. The provider toggles `.dark` on `document.documentElement`.
6. A media query listener updates the resolved theme when system preference changes.
7. `ThemeToggle` is a 3-way segmented radiogroup for Light, Dark, and System.

No-flash script in `src/app.html`:

```html
<script>
	(() => {
		const key = 'sequence-ui-theme';
		const stored = localStorage.getItem(key);
		const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
		const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
		document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && systemDark));
	})();
</script>
```

Tailwind v4 dark variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Tailwind token mapping:

```css
@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-panel: var(--panel);
	--color-border: var(--border);
	--color-primary: var(--primary);
	--color-ring: var(--ring);
}
```

Use token utilities such as `bg-card`, `text-card-foreground`, `border-border`, and `focus-visible:ring-ring`. Do not hardcode neutral palettes for theme-aware UI.

## Structural Motifs

Project header — use the `AppBar` component (`<AppBar title="Relay" context="Settings"><ThemeToggle integrated /></AppBar>`). The brand is **sans, semibold, sentence case** (12.5px) — mono-uppercase branding was deliberately retired as a terminal tell; the optional `context` prop renders the page/location dimmed behind a hairline divider (`Relay │ Settings`). It's app chrome, so its height is a **fixed integer px** via `--bar-height` (22px), **not `py-*`** and not the 4px grid — at this height, padding-based sizing rounds unevenly and drifts the toggle + 13px text off-center. The raw recipe the component encapsulates:

```svelte
<header class="sticky top-0 z-30 flex h-[var(--bar-height)] shrink-0 items-center justify-between gap-8 border-t border-t-transparent border-b border-b-bar-border bg-bar pl-1.5 text-bar-foreground">
	<span class="flex items-center gap-1.5 font-sans text-[13px] leading-none">
		<span class="font-[560]">Relay</span>
		<span class="h-3 w-px bg-bar-border"></span>
		<span class="font-medium opacity-75">Settings</span>
	</span>
	<ThemeToggle integrated />
</header>
```

Settings/inspector surface — the **`Rail`** component: one continuous bordered
stack of `CollapsibleSection` header rows (zero gap, shared hairlines; the Rail
owns the outer border and last-row `border-b` suppression). Nested
`CollapsibleSection`s render as twirl-downs automatically. See
`src/routes/examples/settings`.

Segmented collapsed-border controls:

```svelte
<div class="inline-flex items-stretch border border-border bg-card">
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
	<span class="flex items-center border-l border-border bg-muted px-0.5 text-muted-foreground type-value">:</span>
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
</div>
```

The wrapper owns the single border. Inner segments are borderless and divided by 1px lines. Use fixed/tabular widths so digits do not shift layout.
