# Sequence UI Agent Spec

This file is the implementation contract for coding agents recreating the Sequence UI look. Sequence UI is a Svelte 5 runes, Tailwind v4 CSS-first, TypeScript design system extracted from the Sequence Toy app. The visual target is an instrument panel: dense, flat, sharp, technical, and calm.

**North star: high-density professional desktop software** — think DAWs, node editors, pro color/photo tools — **NOT a terminal, and not "hacker" cosplay.** Compact but *easy to use*. The most common failure mode is over-monospacing: sans is the voice of the UI (headings, labels, navigation, prose, button-adjacent text roles that are sans); mono is an instrumentation accent reserved for values, code, and terse tags. If a screen reads like a TUI, it's wrong.

## Core DNA

Use these rules before inventing any component styling:

- Base UI is 12.5px through `text-base: 0.78125rem`.
- Tailwind spacing base is `--spacing: 0.25rem` (4px = 1U); every gap/padding/size is a multiple. Content boxes pad with `pad-box` (`--pad-box`, 1U), not hand-picked `p-*`.
- **One control height.** Every single-line boxed control — buttons, text/number inputs, select triggers, segmented clusters, field composites, tabs — is EXACTLY `h-control` (22px) or `h-control-sm` (18px). **Never size a control with `py-*`** (padding-derived heights drift a pixel between components and break composed rows) and never invent a third height. Composites put `h-control` on the bordered wrapper; borderless innards stretch. Exempt: inline glyph controls (checkbox/radio, reset ↺), the app bar (`--bar-height`), multi-line areas, data-viz tracks. `scripts/audit/control-heights.js` asserts this invariant on any rendered page.
- Corners are sharp: `--radius: 0rem`.
- Surfaces are flat: no drop shadows, no glass, no skeuomorphic bevels.
- **Surface tiers.** Containers are flat — `Panel`/`Pane`/`CollapsibleSection` bodies use `bg-background` and are read by their hairline border, not a fill. Only **fields, controls, and chrome** ride the raised tier `bg-card` (headers/tab strips also use `bg-panel`, which equals `--card` in dark). `--muted` is the **hover/emphasis** step *above* the raised tier: use it for `hover:`/active states, **never as a resting surface** — a resting `bg-muted` block becomes the brightest thing on a flat panel and glows (put code samples, info boxes, stat tiles on `bg-card`). Deliberate exception: bar **tracks** (`ProgressBar`/`CapacityBar`/`TimeBrush`) keep `bg-muted` so the unfilled groove stays visible.
- **No state-transition animations.** State changes are INSTANT (professional-software / DAW / AE feel) — a global rule kills every CSS `transition`. Never add `transition-*`. Continuous feedback (loading spinners, indeterminate bars) uses `animation`/@keyframes, which is fine.
- Accent colors operate within the **Tailwind palette rungs**, behind semantic tokens (`--primary: var(--color-purple-700)`, `--destructive` = red, `--success` = green, `--warning` = amber, `--ring` = blue). Use the semantic utilities (`bg-primary`, `text-destructive`) — never raw palette classes in product UI. The surface gray ladder and the chart palette stay bespoke OKLCH (deliberate). Colored buttons use `--primary-accent`/`--destructive-accent` (paler rung in dark).
- **Purple is Sequence UI's OWN brand default, not a requirement — and the brand color is the USER's decision.** A consuming app uses its own primary/brand hue; **if the user hasn't specified one, ASK them to pick from the Tailwind palette (https://tailwindcss.com/docs/colors) — do not silently keep purple or choose a color for them.** Once you have their hue, since accents are already rungs, switching = find/replace `purple` in the token block: `--primary` (light `<hue>-700` / dark `<hue>-500`), `--primary-accent` (dark → a lighter rung), and the `--bar-*` tokens (AppBar chrome: bg / foreground / border / accent(+foreground) — the integrated `ThemeToggle` reads these too, so the bar rebrands from one place, and no component hardcodes a hue). Keep the surface grays, the status colors (destructive/success/warning), and `--ring` — those are semantic, not brand.
- **Cursor policy (desktop convention).** The arrow is the cursor for ALL controls — buttons, tabs, segments, checkboxes, selects, menu items, collapsible headers. Never add `cursor-pointer` to a control: the pointing hand means one thing, **navigation** (real `<a href>` links get it natively). Mechanic cursors communicate *mechanics*, not clickability, and are required where they apply: `cursor-ew-resize` (scrub / drag-to-set), `cursor-grab`/`grabbing` (thumbs, brushes), the text caret in text fields. No `cursor-not-allowed` on disabled — disabled is communicated by opacity; the control just sits inert (native behavior). This follows Apple HIG / Adobe Spectrum / Tailwind v4 preflight; pointer-on-buttons is a consumer-web tell.
- Borders are thin `border border-border` hairlines; use `border-border-strong` only when hierarchy needs it.
- Primary commands use `ActionButton` gradients, not generic pill buttons.
- Icons come from Lucide. Size icon glyphs in **fixed px** (10 / 11 / 13), never `--spacing`-multiples (`h-3.5`), so icon size is decoupled from layout density and doesn't scale when `--spacing` changes.
- Berkeley Mono is reserved. `Inter` (self-hosted v4.1 variable, SIL OFL) is the sans face.

DON'T:

```svelte
<section class="rounded-xl bg-white p-6 shadow-xl">
	<p class="text-sm uppercase tracking-widest">Controls</p>
	<h2 class="text-4xl font-bold">Signal Controls</h2>
</section>
```

DO:

```svelte
<Panel title="Signal Controls">
	<div class="stack-field">
		<Slider id="gain" label="Gain" min={0} max={100} bind:value={gain} />
	</div>
</Panel>
```

## Typography Roles

All UI typography must use one of the ten semantic type utilities from `src/app.css`. Do not choose raw `text-*` sizes in product UI.

**Emphasis is color + weight at a stable size; small size is a density decision, not de-emphasis.** The base is 12.5px (`type-body`, the workhorse). To make text *secondary*, drop its color — `type-body` + `text-muted-foreground` (or `text-subtle-foreground`) — same size, lighter. Do NOT shrink to de-emphasize. The 11px role (`type-fine`) is a **density escape hatch** for genuine fine print only (footnotes, source/paper references, dense annotations), where fitting more matters more than legibility.

- `type-display`: understated large sans display, medium weight.
- `type-heading`: sans section heading, medium weight.
- `type-title`: compact sans panel/card title.
- `type-body`: sans prose and normal readable text.
- `type-fine`: sans **fine print** (11px) — footnotes, source references, dense annotations. NOT general secondary text; for that use `type-body` + `text-muted-foreground`.
- `type-label`: sans, 12px, medium — the prominent title style for every field/metric/alert label (FormLabel, Statistic, ProgressBar, Note). This is the one label style; route new labels through it so they never drift.
- `type-tag`: mono, uppercase, small — code-like tags and value annotations (token names, radix tags, units), NOT human-readable field labels.
- `type-button`: mono, uppercase command text.
- `type-value`: mono, tabular numeric readouts and input values.
- `type-code`: mono code or base/radix editing.

Mono is only for `type-button`, `type-value`, `type-code`, `type-tag`, and the small brand/project label. Use sans for headings, navigation, prose, and most labels that are not instrument labels.

**Uppercase is a mono-only signal, and sans is always sentence-case.** The only uppercase text is mono: `type-tag` (tags), `type-button` (commands), and the brand label. Never set `uppercase` on sans text — uppercase-sans reads as neither a technical tag nor natural prose. So a sans section heading (e.g. a `Menu` group heading) is sentence-case sans, not a sans eyebrow.

**Labels are sans, not mono.** Every human-readable label is sans: field labels via `FormLabel` (sans, 12px, medium weight, foreground — a prominent title, matching the Sequence Toy control-title weight), checkbox/radio option labels (`type-body`), radio-group labels, and boolean/state descriptors ("Open", "Checked", "Selected"). Mono (`type-tag`, uppercase) is NOT for naming things — reserve it for terse code-like tags and value annotations (token names, radix tags like HEX/DEC, unit suffixes). Overall, mono is for values (`type-value`), buttons (`type-button`), code (`type-code`), the brand label, and those small tags — never for labels or prose.

**Running text uses `prose`, not bare `type-body`.** A paragraph of running text — panel/section descriptions, help copy — gets the `prose` utility. `prose` applies the body font *and* owns its vertical rhythm: it separates from an adjacent control/grid/code block by 8px and sits flush at a stack's edges (modeled on `@tailwindcss/typography`'s `prose`). This is the ONE sanctioned exception to "components ship margin-free" — prose rhythm belongs to prose, not the container. It's an explicit marker, so the many control usages of `type-body` (inputs, menu items, option labels) are untouched. Rule: real running text → `prose`; UI text → the appropriate `type-*` role.

DON'T:

```svelte
<nav class="font-mono text-xs uppercase tracking-wider">
	<a>Overview</a>
	<a>Settings</a>
</nav>
```

DO:

```svelte
<nav class="flex gap-2 type-body">
	<a class="text-foreground">Overview</a>
	<a class="text-muted-foreground hover:text-foreground">Settings</a>
</nav>
```

DON'T:

```svelte
<h2 class="mb-2 text-3xl font-bold tracking-tight">Transport</h2>
```

DO:

```svelte
<section class="stack-group">
	<h2 class="type-heading">Transport</h2>
	<Panel title="Playback">...</Panel>
</section>
```

Headings are understated. They are sans, medium, tight, and followed by generous space from the parent stack, not by large type or bold weight.

## Spacing Policy

Spacing belongs to containers, not leaf components. Components ship margin-free: no external `mt-*`, `mb-*`, or hardcoded outside spacing. Parents arrange children with the stack utilities.

Instrument-dense, matching Sequence Toy's Control Panel: one tight 4px step inside panels, and panels that butt together (border-separated), not floated apart.

- `stack-tight`: `gap-1`, 0.25rem (4px), label to field or parts of one control.
- `stack-field`: `gap-1`, 0.25rem (4px), controls inside a panel body (the toy's `space-y-1`).
- `stack-group`: `gap-1`, 0.25rem (4px), panels within a section — or prefer contiguous, border-`b`-separated panels (0 gap).
- `stack-section`: `gap-4`, 1rem (16px), page sections — a real break, a healthy gap above each heading.

**Three spacing values — a clean ×2 progression.** Every gap resolves to one of `gap-1` / `gap-2` / `gap-4`; nothing in between (no `gap-1.5`, no `mt-2` on a panel).

- **Within** a panel / cluster — **4px, `gap-1`**: controls in a panel body, buttons or radios in a row, panels within a section. Both axes: a panel grid's horizontal `gap-1` is the same 4px as the section's `stack-group` vertical stacking (this is what keeps vertical == horizontal). Horizontal button/control clusters use `gap-1` too — never wider than panels.
- **Between** distinct groups in a row — **8px, `gap-2`** (e.g. two separate control clusters side by side).
- **Between page sections** — **16px, `gap-4` / `stack-section`**: a real break. This is the space above each heading; it matches the page column's top padding so the first heading reads the same as the rest.

**Decision procedure — does your page have sections at all?** A "section" means an **`h2`-led page region** (the pattern the specimen/gallery page uses to document many components at once). Most product pages don't have those: a settings page, an inspector, a control surface is just a **stack of titled panels**, and the `Panel` title IS the group heading. In that case there are no `h2`s and no `stack-section` — the panels stack at `gap-1` (4px, or contiguous border-separated). **Never** pair an `h2` with a single `Panel` repeating the same word ("General" twice), and never use `stack-section` between plain panels — 16px gaps between panels is the classic "agent prior" that makes the page read as SaaS instead of an instrument.

Structural rule (do not regress): a **container owns the gap; children never set external margins.** A `<section>` is `scroll-mt-* stack-group` and stacks its heading + panel-groups at 4px; the page column is `stack-section` (16px between sections). If you catch yourself adding `mt-*`/`mb-*` to a panel or heading to fix spacing, that's the bug — move the gap to the container instead. The **one exception is `prose`** (running-text blocks), which owns its own rhythm on purpose — see Typography. That's the ONLY margin a child may carry, and it comes from the utility, not a hand-added `mt-*`.

**One content-box inset: `pad-box`.** Every text-in-a-box — panel body, CollapsibleSection/Pane/ToggleGroup body, code blocks, callouts — pads with the `pad-box` utility, never a hand-picked `p-*`. It resolves to `--pad-box` (a token, currently 1U / 4px, decoupled from `--spacing`). Bump `--pad-box` once and every box reflows together; that's the whole point, so do not sprinkle `p-2`/`p-3` on individual boxes.

Container defaults:

- Panel / CollapsibleSection / Pane / ToggleGroup body: `pad-box stack-field` (one inset + 4px gaps).
- Panel grids: `gap-1`. Button/control clusters: `flex ... gap-1`.
- Sections: `scroll-mt-* stack-group` inside a `stack-section` page column.
- Do NOT loosen these; the system is meant to read as a dense instrument panel.
- Run tight. If it feels comfortable by modern SaaS defaults, it is probably too loose for Sequence UI.

DON'T:

```svelte
<FormLabel value="Rate" />
<div class="mt-1">
	<NumberInput id="rate" bind:value={rate} />
</div>
<p class="mt-4 text-xs text-muted-foreground">Frames per second.</p>
```

DO:

```svelte
<div class="stack-tight">
	<FormLabel value="Rate" />
	<NumberInput id="rate" bind:value={rate} />
</div>
```

## Tokens And Theming

Use shadcn-compatible token names plus Sequence extensions. Tokens are OKLCH and mapped through Tailwind v4 `@theme inline` in `src/app.css`.

Core shadcn-compatible tokens:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--muted`, `--muted-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

Sequence extensions:

- `--panel`, `--panel-foreground`
- `--bar`, `--bar-foreground`, `--bar-border`, `--bar-accent`, `--bar-accent-foreground` (AppBar + integrated ThemeToggle chrome; brand-hued rungs — the one override point for the bar)
- `--highlight`
- `--border-strong`
- `--subtle-foreground`
- `--success`, `--warning`
- `--chart-1` through `--chart-5`
- `--warning-strong`, `--destructive-strong` (deep, readable status colors for alert TITLE text on light tints). The base `--warning`/`--destructive` are bright — use them for icons, borders, and fills only; NEVER as text on a light background (that's the low-contrast trap). Alert titles use `text-warning-strong` / `text-destructive-strong`.

Chart colors are categorical. In dark mode, each chart series keeps its hue stable so series identity does not change across themes.

Dark mode is class-based:

- `ThemeProvider` reads and writes localStorage key `sequence-ui-theme`.
- Valid modes are `light`, `dark`, and `system`.
- The resolved theme toggles `.dark` on `document.documentElement`.
- `src/app.html` includes a no-flash inline script that applies `.dark` before Svelte hydrates.
- CSS uses `@custom-variant dark (&:where(.dark, .dark *))`.
- Tailwind color utilities are wired through `@theme inline`.
- `ThemeToggle` is a 3-way segmented radiogroup using Light, Dark, and System.

DON'T:

```svelte
<div class="bg-zinc-950 text-zinc-50 dark:bg-white dark:text-zinc-950">
	...
</div>
```

DO:

```svelte
<div class="border border-border bg-card text-card-foreground">
	...
</div>
```

## Project Header Motif

The reusable project header is a full-width top bar with a purple identity strip and the project name in small mono uppercase.

**Use the `AppBar` component** — it bakes in the height/padding that are otherwise easy to get wrong:

```svelte
<AppBar title="Sequence Toy">
	<ThemeToggle />
</AppBar>
```

If you hand-roll it, the **height is the trap**. This bar is app *chrome*, not grid content: give it a **fixed integer height, `h-[var(--bar-height)]` (20px), and NEVER `py-*`.** At ~20px it must center a ~18px `ThemeToggle` + 11px brand text on whole pixels; `py-*` there resolves to a fractional value that rounds unevenly and drifts the contents up/down ("sits lower on top"). Horizontal is `px-1.5`.

```svelte
<header class="sticky top-0 z-30 flex h-[var(--bar-height)] shrink-0 items-center justify-between gap-8 border-t border-t-transparent border-b border-b-bar-border bg-bar pl-1.5 text-bar-foreground">
	<span class="font-mono text-xs font-semibold uppercase tracking-wider">Sequence Toy</span>
	<ThemeToggle integrated />
</header>
```

Keep it flat and full-width. Do NOT: use `py-*` for its height, put the project name in a rounded card / large hero / marketing nav, or "normalize" `h-[var(--bar-height)]` back onto the 4px grid — this bar is the sanctioned exception.

## Segmented Controls

Multi-field controls such as `TimecodeField`, `BaseField`, `ToleranceField`, and IP-style inputs use the collapsed-border model:

- One outer wrapper owns the border: `inline-flex border border-border bg-card`.
- Inner inputs are borderless: `border-0 bg-card`.
- Segment boundaries are 1px `border-l` or `border-t` dividers.
- Numeric fields use `type-value` and fixed/tabular widths such as `w-6`, `w-16`, or `w-20`.
- Digits must not shift layout while editing.

DON'T:

```svelte
<div class="flex gap-1">
	<input class="rounded border px-2" />
	<input class="rounded border px-2" />
	<input class="rounded border px-2" />
</div>
```

DO:

```svelte
<div class="inline-flex items-stretch border border-border bg-card">
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
	<span class="flex items-center border-l border-border bg-muted px-0.5 type-value">:</span>
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
</div>
```

## App Shell

The app shell should be fixed to the viewport so the document itself does not scroll. Only `main` scrolls. This keeps sticky headers pinned and makes fragment navigation behave predictably.

DO:

```svelte
<div class="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
	<header class="shrink-0">...</header>
	<main class="min-h-0 flex-1 overflow-y-auto overscroll-none">...</main>
</div>
```

`html` and `body` use `overflow: clip` and `overscroll-behavior: none` in `src/app.css` to kill rubber-band behavior.

## Gotchas

Base reset gotcha:

An unlayered reset like `button,input,select,textarea { font: inherit }` silently beats Tailwind utility classes such as `font-mono`, because Tailwind utilities are layered. Keep the reset inside `@layer base`.

DON'T:

```css
button,
input,
select,
textarea {
	font: inherit;
}
```

DO:

```css
@layer base {
	button,
	input,
	select,
	textarea {
		font: inherit;
	}
}
```

Screen-reader input gotcha:

If an `sr-only` input is absolutely positioned behind a styled icon, its wrapper must be `position: relative`. In a `fixed inset-0` app shell, an unanchored absolute input can escape and inflate `scrollHeight`, creating phantom scroll.

DON'T:

```svelte
<label>
	<input class="sr-only absolute" type="checkbox" />
	<CheckboxIcon />
</label>
```

DO:

```svelte
<label class="relative inline-flex items-center">
	<input class="sr-only absolute" type="checkbox" />
	<CheckboxIcon />
</label>
```

## ANTI-PATTERNS

DON'T use a small uppercase mono eyebrow above a big title. It is the most common generic AI layout tell.

```svelte
<p class="type-tag">FOUNDATIONS</p>
<h1 class="text-5xl font-bold">Living Gallery</h1>
```

DO use one normal sans section heading with the parent stack creating the following space.

```svelte
<section class="stack-group">
	<h1 class="type-heading">Living Gallery</h1>
	<Panel title="Foundations">...</Panel>
</section>
```

DON'T mark active nav/list/tree rows with left-border cues.

```svelte
<a class="border-l-2 border-l-primary pl-2 text-primary">Overview</a>
```

DO use a background fill or text color.

```svelte
<a class="bg-primary/12 px-1.5 py-0.5 text-primary type-body">Overview</a>
```

DON'T make monospace the liberal default for navigation, prose, or whole panels.

```svelte
<div class="font-mono">
	<nav>Overview Settings</nav>
	<p>Adjust the transport and preview options.</p>
</div>
```

DO reserve mono for buttons, values, code, small instrument labels, and the brand label.

```svelte
<div class="stack-field type-body">
	<nav class="flex gap-2">Overview Settings</nav>
	<div class="type-value">{frames} frames</div>
</div>
```

DON'T over-space controls with comfortable dashboard gaps.

```svelte
<Panel title="Output">
	<div class="space-y-6 p-6">
		<Slider id="width" label="Width" min={0} max={1920} bind:value={width} />
		<Slider id="height" label="Height" min={0} max={1080} bind:value={height} />
	</div>
</Panel>
```

DO use the tight stack scale and Panel defaults.

```svelte
<Panel title="Output">
	<Slider id="width" label="Width" min={0} max={1920} bind:value={width} />
	<Slider id="height" label="Height" min={0} max={1080} bind:value={height} />
</Panel>
```

DON'T let short-content fields fill the column. Size fields to their expected content (GOV.UK-style): numeric and unit fields are content-sized; only free text, paths, and URLs may fill the column width.

```svelte
<NumberInput id="streams" label="Max concurrent streams" bind:value={streams} />
<!-- renders a ~600px-wide box holding the number 4 -->
```

DO give short fields a content-appropriate width via `class`.

```svelte
<NumberInput id="streams" label="Max concurrent streams" bind:value={streams} class="w-24" />
<TextInput id="cache" label="Local cache directory" bind:value={dir} />  <!-- paths fill: fine -->
```

DON'T add rounded corners, drop shadows, glass effects, or skeuomorphic styling.

```svelte
<button class="rounded-full bg-white/70 px-4 py-2 shadow-lg backdrop-blur">
	Apply
</button>
```

DO keep controls flat, sharp, bordered, and role-typed.

```svelte
<ActionButton color="blue">Apply</ActionButton>
```

## Component Catalog

Authoritative component names from `src/lib/index.ts`:

- Buttons: `ActionButton` (loud gradient hero), `Button` (the everyday flat button, **sans label** — vs ActionButton's mono — `variant` solid/outline/ghost/link × `tone` default/primary/destructive × `size`, with icon/loading/disabled + `href`; fixed control height (`h-control`, 22px; sm `h-control-sm`, 18px), natural line-height — Inter's tall x-height self-centers the label, no nudge needed. The default `outline` variant is the **Flat Hairline** look: 1px border, accent in border+text, only a faint fill that deepens on hover. `solid` primary/destructive are soft low-alpha tints, not saturated fills), `SegmentedControl` (single-select joined cluster with shared hairline dividers — a mode/tool switch, DAW/AE-style; text or icon-only segments, arrow-key + Home/End nav, `bind:value`), `IconButton`
- Primitives: `Panel`, `BorderedGroup`, `CollapsibleSection`, `Pane`
- Controls: `Slider`, `NumberInput`, `ScrubInput`, `AngleField`, `ThresholdMarker`, `TextInput`, `TimecodeField`, `BitField`, `BaseField`, `ToleranceField`, `SelectInput`, `ToggleGroup`, `CheckboxInput`, `RadioGroupInput`, `RadioInput`, `FormLabel`, `ResetValueButton`

Control conventions (apply across the catalog):

- **Picking a numeric control:** `Slider` for bounded continuous values where seeing the position in range informs (the hero control); `ScrubInput` for any fine-tunable numeric — drag-to-set + typed entry, `step` (Shift=×10, Alt=÷10), `precision`, optional `unit` — including arbitrary-precision floats; `NumberInput` for plain discrete counts with no drag affordance. When in doubt between ScrubInput and NumberInput, prefer ScrubInput.
- **Option shapes:** `SelectInput` options are `{ value, label, disabled? }` (`label` is the visible text); `RadioGroupInput` options are `{ value, label }`.
- **`hasDefaultValue` means "the value currently EQUALS its default"** — it disables the `ResetValueButton` (nothing to reset). It does NOT mean "a default exists." Wire it as `value === defaultValue`.
- **Destructive confirmation is inline, not modal:** there is no dialog component, and that's intentional for now. Use the two-step arm→confirm swap on the button itself — first activation arms it (label becomes `Confirm — <consequence>`, with a plain Cancel beside it), second performs. Pair with an amber `Note` explaining the consequence. Do not hand-roll modal overlays.
- Feedback: `Statistic`, `ControlsStatistic`, `Note`, `ControlsNote`, `Citations`, `Tooltip`, `UserGuideTooltip`
- Navigation: `Menu`, `Breadcrumb`, `Pagination`, `Tree`
- Data: `CapacityBar`, `TimeBrush`, `ProgressBar`
- Icons: `ChevronIcon`, `CheckboxIcon`, `RadioIcon`
- Theme: `ThemeProvider`, `ThemeToggle`
- Optional: `KatexBlock`, `Footnote`, `FootnotesProvider`, `Portal`

Also exported: `getThemeContext`, `PaneTab`, `SelectOption`, `CitationEntries`, `MenuItem`, `TreeNode`, `CapacitySegment`, `ThemeMode`, and `ThemeContext`.
