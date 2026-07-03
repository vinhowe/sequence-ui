# Sequence UI Design Spec

Sequence UI is a Svelte 5 runes, Tailwind v4 CSS-first, TypeScript design system. Its visual language is dense instrument-panel UI: compact, flat, sharp, and precise. It was extracted from the Sequence Toy app and adds first-class light/dark theming.

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
| `--background` | `oklch(0.15 0 0)` | canvas |
| `--card` | `oklch(0.2 0 0)` | component surface |
| `--popover` | `oklch(0.205 0 0)` | overlay surface |
| `--muted` | `oklch(0.235 0 0)` | recessed/quiet surface |
| `--panel` | `oklch(0.255 0 0)` | panel header/body contrast |
| `--border` | `oklch(0.34 0 0)` | hairline border |
| `--border-strong` | `oklch(0.48 0 0)` | stronger divider |

Primary and semantic tokens:

| Token | Light | Dark |
| --- | --- | --- |
| `--primary` | `oklch(0.50 0.24 303)` | `oklch(0.64 0.22 303)` |
| `--ring` | `oklch(0.62 0.19 255)` | `oklch(0.7 0.16 250)` |
| `--destructive` | `oklch(0.58 0.22 27)` | `oklch(0.62 0.2 25)` |
| `--success` | `oklch(0.60 0.17 150)` | `oklch(0.7 0.16 150)` |
| `--warning` | `oklch(0.80 0.16 85)` | `oklch(0.8 0.15 85)` |
| `--highlight` | `oklch(0.85 0.15 90)` | `oklch(0.78 0.14 90)` |

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

Tailwind text sizes are retuned in `@theme inline`. Distinct role sizes are 10, 11, 12.5, 15, and 17px. UI must use semantic type roles, not raw `text-*` sizing.

| Role | Utility | Font | Use |
| --- | --- | --- | --- |
| Display | `type-display` | sans | rare top-level display, 17px |
| Heading | `type-heading` | sans | section headings, 15px |
| Title | `type-title` | sans | panel titles, 12.5px |
| Body | `type-body` | sans | prose and normal UI text, 12.5px |
| Caption | `type-caption` | sans | secondary text, 11px |
| Label | `type-label` | mono uppercase | small instrument labels, 10px |
| Button | `type-button` | mono uppercase | command labels, 11px |
| Value | `type-value` | mono tabular | numeric readouts and value inputs, 12.5px |
| Code | `type-code` | mono | code and radix/base editing, 12.5px |

Mono is reserved for punchy semantic uses only: buttons, numeric values/readouts, code, small instrument labels, and the brand label. Sans is used for headings, navigation, and prose.

Headings are understated: sans, medium weight, tight tracking, and followed by space from the parent stack. They are not big/bold display treatments.

## Stack Scale

Tailwind spacing is globally tightened:

```css
--spacing: 0.2rem;
--radius: 0rem;
```

On coarse pointers, spacing increases to `0.25rem` and `html` font-size becomes `18px`.

Spacing is owned by containers. Components should not ship external margins. The stack utilities are:

Three values in a clean x2 progression: 3.2px within, 6.4px between groups, 12.8px between sections (the healthy gap above each heading). Every gap resolves to one of them — nothing in between, and no ad-hoc margins on panels/headings.

| Utility | Tailwind gap | Rem | Use |
| --- | --- | --- | --- |
| `stack-tight` | `gap-1` | 0.2rem (3.2px) | parts of one control, label to field |
| `stack-field` | `gap-1` | 0.2rem (3.2px) | controls inside a panel body |
| `stack-group` | `gap-1` | 0.2rem (3.2px) | heading + panels within a section |
| `stack-section` | `gap-4` | 0.8rem (12.8px) | page sections (a real break above each heading) |

Panel defaults from `Panel.svelte`:

```ts
headerClass = 'bg-panel border-b border-border px-1 py-0.5 flex justify-between items-center text-panel-foreground gap-2'
contentClass = 'p-1 stack-field'
```

Panel grids and button/control clusters use `gap-1`; sections stack with `stack-group` inside a `stack-section` page column. A container owns the gap; children never set external margins.

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

Project header:

```svelte
<header class="flex items-center justify-between border-b border-purple-300 bg-purple-200 px-2 py-1 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200">
	<div class="font-mono text-xs uppercase tracking-wider">Sequence Toy</div>
	<ThemeToggle />
</header>
```

Segmented collapsed-border controls:

```svelte
<div class="inline-flex items-stretch border border-border bg-card">
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
	<span class="flex items-center border-l border-border bg-muted px-0.5 text-muted-foreground type-value">:</span>
	<input class="h-6 w-6 border-0 bg-card px-0.5 text-center type-value" />
</div>
```

The wrapper owns the single border. Inner segments are borderless and divided by 1px lines. Use fixed/tabular widths so digits do not shift layout.
