# Sequence UI

Sequence UI is a standalone Svelte 5, Tailwind v4, and TypeScript design system extracted from the Sequence Toy app aesthetic. It is built for dense instrument panels: 12.5px base type, very tight spacing, sharp corners, flat surfaces, thin hairline borders, Lucide icons, gradient action buttons, and first-class light/dark theming.

The system is CSS-first Tailwind v4 through `@tailwindcss/vite`. Components are plain Svelte 5 runes components designed to be copied into an app through a shadcn-svelte registry item or directly from source.

## Install

Registry components live under `static/r/*.json` after running the registry build. A consumer installs one item with:

```sh
npx shadcn-svelte@latest add <url>/r/<name>.json
```

For local or manual use, copy the registry JSON or the source component file directly into the consuming project. Consumers must also bring the required CSS tokens and fonts. The sans face is **Inter** (SIL Open Font License), self-hosted as the v4.1 variable font (`static/InterVariable.woff2`) — it ships with the system, so no external font service is required. Berkeley Mono is bundled here for local dev and the gallery; downstream projects need their own licensed mono font file or a font substitution.

## Claude Code Skill

This repo ships an installable [Claude Code](https://claude.com/claude-code) **skill** that teaches an agent to build or restyle a UI in the Sequence UI style — read the design contract, set up the theme once, copy components from the registry, and compose by the rules. It lives at [`.claude/skills/sequence-ui/SKILL.md`](.claude/skills/sequence-ui/SKILL.md) and pulls the authoritative rules (`AGENTS.md`, `docs/design-spec.md`, `llms.txt`) and registry items live from this repo, so it never goes stale.

The skill is a single self-contained `SKILL.md`. Install it **globally** (available in every project):

```sh
mkdir -p ~/.claude/skills/sequence-ui
curl -fsSL https://raw.githubusercontent.com/vinhowe/sequence-ui/main/.claude/skills/sequence-ui/SKILL.md \
  -o ~/.claude/skills/sequence-ui/SKILL.md
```

…or **per-project** (check it in for your team) by copying the folder into the target project's `.claude/skills/`:

```sh
mkdir -p .claude/skills
cp -r /path/to/cloned/sequence-ui/.claude/skills/sequence-ui .claude/skills/
```

(If you clone this repo and work *inside* it, the skill is already active as a project skill — nothing to install.)

Then in Claude Code, run `/sequence-ui`, or just ask for the Sequence UI look — the skill auto-triggers on mentions of Sequence UI, sequence.toys, or the Sequence Toy aesthetic. The only requirement in the target app is Tailwind v4 (`@tailwindcss/vite`) + Svelte 5.

## Updating

Copy-in means there are no version numbers — the registry and rules are always served from `main`, so your "version" is the `main` commit SHA you last pulled from. There is **no SHA baked into the files** (it can't be stamped correctly at build time); read it live:

```sh
git ls-remote https://github.com/vinhowe/sequence-ui.git main | cut -f1
```

Record it (e.g. `.sequence-ui.json`: `{ "sha": "…", "components": [...] }`). To update, compare `github.com/vinhowe/sequence-ui/compare/<your-sha>...main`, re-pull the components you use, and reconcile via your app's git diff. See [`CHANGELOG.md`](CHANGELOG.md) for breaking changes, and the skill's "Staying up to date" for the full loop.

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
	import AppBar from '$lib/components/primitives/AppBar.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Slider from '$lib/components/controls/Slider.svelte';
	import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';

	let gain = $state(10);
</script>

<div class="stack-section p-4">
	<AppBar title="Sequence Toy">
		<ThemeToggle integrated />
	</AppBar>

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

- `AppBar` — full-width top chrome bar (fixed `--bar-height`, brand + context + actions slots)
- `Panel`
- `BorderedGroup` alias for `Panel`
- `CollapsibleSection` — collapsible header-row section; depth-aware (nested = twirl-down)
- `Rail` — the canonical settings/inspector surface: bordered zero-gap stack of CollapsibleSections
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
