# Sequence UI

Sequence UI is a standalone Svelte 5, Tailwind v4, and TypeScript design system extracted from the Sequence Toy app aesthetic. It is built for dense instrument panels: 13px base type, very tight spacing, sharp corners, flat surfaces, thin hairline borders, Lucide icons, gradient action buttons, and first-class light/dark theming.

The system is CSS-first Tailwind v4 through `@tailwindcss/vite`. Components are plain Svelte 5 runes components designed to be copied into an app through a shadcn-svelte registry item or directly from source.

## Install

Registry components live under `static/r/*.json` after running the registry build. A consumer installs one item with:

```sh
npx shadcn-svelte@latest add <url>/r/<name>.json
```

For local or manual use, copy the registry JSON or the source component file directly into the consuming project. Consumers must also bring the required CSS tokens and fonts. The sans face is **Inter** (SIL Open Font License), self-hosted as the v4.1 variable font (`static/InterVariable.woff2`) — it ships with the system, so no external font service is required. Berkeley Mono is bundled here for local dev and the gallery; downstream projects need their own licensed mono font file or a font substitution.

## Minimal Usage

Import `src/app.css` once in the app shell, then wrap the application in `ThemeProvider`. Import copied components from wherever the registry installed them.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import ThemeProvider from '$lib/components/theme/ThemeProvider.svelte';

	let { children } = $props();
</script>

<ThemeProvider>
	{@render children()}
</ThemeProvider>
```

```svelte
<!-- Example page -->
<script lang="ts">
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Slider from '$lib/components/controls/Slider.svelte';
	import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';

	let gain = $state(10);
</script>

<div class="stack-section p-4">
	<header class="flex items-center justify-between border-b border-purple-300 bg-purple-200 px-2 py-1 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200">
		<div class="font-mono text-xs uppercase tracking-wider">Sequence Toy</div>
		<ThemeToggle />
	</header>

	<Panel title="Transport">
		<Slider id="gain" label="Gain" min={0} max={100} bind:value={gain} unit="%" />
	</Panel>
</div>
```

## Development

```sh
pnpm dev --port 5199
pnpm check
pnpm build
pnpm registry:build
```

## Component Catalog

Buttons:

- `ActionButton`
- `Button`
- `IconButton`
- `SegmentedControl`

Primitives:

- `Panel`
- `BorderedGroup` alias for `Panel`
- `CollapsibleSection`
- `Pane`

Controls:

- `Slider`
- `NumberInput`
- `ScrubInput`
- `AngleField`
- `ThresholdMarker`
- `TextInput`
- `TimecodeField`
- `BitField`
- `BaseField`
- `ToleranceField`
- `SelectInput`
- `ToggleGroup`
- `CheckboxInput`
- `RadioGroupInput`
- `RadioInput`
- `FormLabel`
- `ResetValueButton`

Feedback:

- `Statistic`
- `ControlsStatistic` alias for `Statistic`
- `Note`
- `ControlsNote` alias for `Note`
- `Citations`
- `Tooltip`
- `UserGuideTooltip` alias for `Tooltip`

Navigation:

- `Menu`
- `Breadcrumb`
- `Pagination`
- `Tree`

Data:

- `CapacityBar`
- `TimeBrush`
- `ProgressBar`

Icons:

- `ChevronIcon`
- `CheckboxIcon`
- `RadioIcon`

Theme:

- `ThemeProvider`
- `ThemeToggle`

Optional:

- `KatexBlock`
- `Footnote`
- `FootnotesProvider`
- `Portal`

Non-component exports:

- `getThemeContext`
- `PaneTab`
- `SelectOption`
- `CitationEntries`
- `MenuItem`
- `TreeNode`
- `CapacitySegment`
- `ThemeMode`
- `ThemeContext`
