# Sequence UI Agent Spec

This file is the implementation contract for coding agents recreating the Sequence UI look. Sequence UI is a Svelte 5 runes, Tailwind v4 CSS-first, TypeScript design system extracted from the Sequence Toy app. The visual target is an instrument panel: dense, flat, sharp, technical, and calm.

## Core DNA

Use these rules before inventing any component styling:

- Base UI is 12.5px through `text-base: 0.78125rem` (base and below are 0.5px smaller than a standard scale, for instrument density).
- Tailwind spacing is tightened to `--spacing: 0.2rem`.
- Corners are sharp: `--radius: 0rem`.
- Surfaces are flat: no drop shadows, no glass, no skeuomorphic bevels.
- Borders are thin `border border-border` hairlines; use `border-border-strong` only when hierarchy needs it.
- Primary commands use `ActionButton` gradients, not generic pill buttons.
- Icons come from Lucide when an icon exists.
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

All UI typography must use one of the nine semantic type utilities from `src/app.css`. Do not choose raw `text-*` sizes in product UI.

- `type-display`: understated large sans display, medium weight.
- `type-heading`: sans section heading, medium weight.
- `type-title`: compact sans panel/card title.
- `type-body`: sans prose and normal readable text.
- `type-caption`: sans secondary explanatory text.
- `type-field`: sans, 12px, medium — the prominent title style for every field/metric/alert label (FormLabel, Statistic, ProgressBar, Note). This is the one label style; route new labels through it so they never drift.
- `type-label`: mono, uppercase, small — code-like tags and value annotations (token names, radix tags, units), NOT human-readable field labels.
- `type-button`: mono, uppercase command text.
- `type-value`: mono, tabular numeric readouts and input values.
- `type-code`: mono code or base/radix editing.

Mono is only for `type-button`, `type-value`, `type-code`, `type-label`, and the small brand/project label. Use sans for headings, navigation, prose, and most labels that are not instrument labels.

**Uppercase is a mono-only signal, and sans is always sentence-case.** The only uppercase text is mono: `type-label` (tags), `type-button` (commands), and the brand label. Never set `uppercase` on sans text — uppercase-sans reads as neither a technical tag nor natural prose. So a sans section heading (e.g. a `Menu` group heading) is sentence-case sans, not a sans eyebrow.

**Labels are sans, not mono.** Every human-readable label is sans: field labels via `FormLabel` (sans, 12px, medium weight, foreground — a prominent title, matching the Sequence Toy control-title weight), checkbox/radio option labels (`type-body`), radio-group labels, and boolean/state descriptors ("Open", "Checked", "Selected"). Mono (`type-label`, uppercase) is NOT for naming things — reserve it for terse code-like tags and value annotations (token names, radix tags like HEX/DEC, unit suffixes). Overall, mono is for values (`type-value`), buttons (`type-button`), code (`type-code`), the brand label, and those small tags — never for labels or prose.

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

Instrument-dense, matching Sequence Toy's Control Panel: one tight 3.2px step inside panels, and panels that butt together (border-separated), not floated apart.

- `stack-tight`: `gap-1`, 0.2rem (3.2px), label to field or parts of one control.
- `stack-field`: `gap-1`, 0.2rem (3.2px), controls inside a panel body (the toy's `space-y-1`).
- `stack-group`: `gap-1`, 0.2rem (3.2px), panels within a section — or prefer contiguous, border-`b`-separated panels (0 gap).
- `stack-section`: `gap-2`, 0.4rem (6.4px), page sections.

Container defaults:

- Panel / CollapsibleSection body: `p-1 stack-field` (3.2px padding + 3.2px gaps).
- Panel grids: `gap-1`.
- Sections: `gap-2` or `stack-section`.
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

The reusable project header is a full-width top bar with a purple identity strip. The project name is small mono uppercase text.

DO:

```svelte
<header class="flex items-center justify-between border-b border-purple-300 bg-purple-200 px-2 py-1 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200">
	<div class="font-mono text-xs uppercase tracking-wider">Sequence Toy</div>
	<ThemeToggle />
</header>
```

Keep the header flat and full-width. Do not put the project name in a rounded card, large hero, or marketing nav.

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
<p class="type-label">FOUNDATIONS</p>
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

- Buttons: `ActionButton` (loud gradient hero), `Button` (the everyday flat button, **sans label** — vs ActionButton's mono — `variant` solid/outline/ghost/link × `tone` default/primary/destructive × `size`, with icon/loading/disabled + `href`; fixed 24px height, natural line-height — Inter's tall x-height self-centers the label, no nudge needed), `IconButton`
- Primitives: `Panel`, `BorderedGroup`, `CollapsibleSection`, `Pane`
- Controls: `Slider`, `NumberInput`, `ScrubInput`, `AngleField`, `ThresholdMarker`, `TextInput`, `TimecodeField`, `BitField`, `BaseField`, `ToleranceField`, `SelectInput`, `ToggleGroup`, `CheckboxInput`, `RadioGroupInput`, `RadioInput`, `FormLabel`, `ResetValueButton`
- Feedback: `Statistic`, `ControlsStatistic`, `Note`, `ControlsNote`, `Citations`, `Tooltip`, `UserGuideTooltip`
- Navigation: `Menu`, `Breadcrumb`, `Pagination`, `Tree`
- Data: `CapacityBar`, `TimeBrush`, `ProgressBar`
- Icons: `ChevronIcon`, `CheckboxIcon`, `RadioIcon`
- Theme: `ThemeProvider`, `ThemeToggle`
- Optional: `KatexBlock`, `Footnote`, `FootnotesProvider`, `Portal`

Also exported: `getThemeContext`, `PaneTab`, `SelectOption`, `CitationEntries`, `MenuItem`, `TreeNode`, `CapacitySegment`, `ThemeMode`, and `ThemeContext`.
