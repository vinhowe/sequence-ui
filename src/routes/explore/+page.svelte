<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import ThemeProvider from '$lib/components/theme/ThemeProvider.svelte';
	import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Play from '@lucide/svelte/icons/play';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Magnet from '@lucide/svelte/icons/magnet';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import Square from '@lucide/svelte/icons/square';
	import Circle from '@lucide/svelte/icons/circle';
	import Repeat from '@lucide/svelte/icons/repeat';

	// Shared geometry — no border/bg here so each language fully controls its surface.
	const base =
		'inline-flex items-center justify-center gap-1.5 h-7.5 px-2.5 text-sm font-medium leading-none cursor-pointer select-none transition-[background,color,border-color,box-shadow] whitespace-nowrap [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0';

	type Tones = { primary: string; neutral: string; destructive: string; active: string };

	const languages: Array<{ name: string; desc: string; tones: Tones }> = [
		{
			name: 'A · Soft Tint',
			desc: 'Current. Low-alpha accent fill + colored text; auto lighter-on-light / darker-on-dark.',
			tones: {
				primary: 'border border-transparent bg-primary/15 text-primary hover:bg-primary/25',
				neutral: 'border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70',
				destructive: 'border border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25',
				active: 'border border-transparent bg-primary/25 text-primary'
			}
		},
		{
			name: 'B · Flat Hairline',
			desc: 'Precise / CAD. Everything is a 1px hairline; accent lives in border + text, faint fill only.',
			tones: {
				primary: 'border border-primary/55 bg-primary/5 text-primary hover:bg-primary/12',
				neutral: 'border border-border bg-card text-foreground hover:bg-muted',
				destructive: 'border border-destructive/55 bg-destructive/5 text-destructive hover:bg-destructive/12',
				active: 'border border-primary bg-primary/10 text-primary'
			}
		},
		{
			name: 'C · Raised Bevel',
			desc: 'Tactile hardware panel (Logic/Ableton). Top-lit gradient + 1px inner highlight + faint drop.',
			tones: {
				neutral:
					'border border-border text-foreground bg-gradient-to-b from-neutral-50 to-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_1.5px_rgba(0,0,0,0.12)] hover:from-white hover:to-neutral-100 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] dark:border-black/50 dark:from-neutral-700 dark:to-neutral-900 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.55)]',
				primary:
					'border border-primary/60 text-primary-foreground bg-gradient-to-b from-primary to-primary/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.2)] hover:to-primary/85',
				destructive:
					'border border-destructive/60 text-destructive-foreground bg-gradient-to-b from-destructive to-destructive/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.2)]',
				active:
					'border border-border text-foreground bg-neutral-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.28)] dark:bg-neutral-900 dark:border-black/50 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]'
			}
		},
		{
			name: 'D · Recessed Inset',
			desc: 'Engraved / machined. Surface sits below the panel with an inner shadow; keys feel milled-in.',
			tones: {
				neutral:
					'border border-border bg-muted text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.13)] hover:bg-card dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.55)]',
				primary:
					'border border-primary/40 bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] hover:bg-primary/16 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]',
				destructive:
					'border border-destructive/40 bg-destructive/10 text-destructive shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]',
				active:
					'border border-primary/60 bg-primary/18 text-primary shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]'
			}
		},
		{
			name: 'E · Accent Underline',
			desc: 'After Effects flat. No box — a 2px accent underline carries intent; active adds a muted fill.',
			tones: {
				primary: 'border-b-2 border-b-primary bg-transparent text-primary hover:bg-primary/6',
				neutral: 'border-b-2 border-b-transparent bg-transparent text-foreground hover:bg-muted',
				destructive: 'border-b-2 border-b-destructive bg-transparent text-destructive hover:bg-destructive/6',
				active: 'border-b-2 border-b-primary bg-muted text-foreground'
			}
		},
		{
			name: 'F · Solid Command',
			desc: 'Bold reference — full-saturation fills with white text (what we softened away from).',
			tones: {
				primary: 'border border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
				neutral: 'border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive: 'border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
				active: 'border border-transparent bg-primary text-primary-foreground'
			}
		}
	];
</script>

{#snippet row(t: Tones)}
	<div class="flex flex-wrap items-center gap-1.5">
		<button type="button" class={twMerge(base, t.primary)}><Play strokeWidth={2.5} />Render</button>
		<button type="button" class={twMerge(base, t.neutral)}>Export</button>
		<button type="button" class={twMerge(base, t.destructive)}><Trash2 strokeWidth={2.5} />Delete</button>
		<button type="button" class={twMerge(base, t.active)} aria-pressed="true"><Magnet strokeWidth={2.5} />Snap</button>
		<button type="button" aria-label="Settings" class={twMerge(base, t.neutral, 'w-7.5 px-0')}>
			<Settings2 strokeWidth={2.5} />
		</button>
	</div>
{/snippet}

<ThemeProvider>
	<div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
		<header
			class="sticky top-0 z-30 flex h-[20px] shrink-0 items-center justify-between gap-8 border-b border-purple-300 bg-purple-200 px-1.5 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200"
		>
			<div class="type-button">SEQUENCE UI · BUTTON EXPLORATIONS</div>
			<ThemeToggle />
		</header>

		<main class="min-h-0 flex-1 overflow-auto">
			<div class="mx-auto flex max-w-6xl flex-col gap-2 p-3">
				<p class="type-body max-w-2xl text-muted-foreground">
					Six button design languages, each shown across the same set — a primary action, a neutral
					action, a destructive action, an <em>armed / toggled-on</em> state, and an icon-only button.
					Toggle light/dark up top. Tell me which chrome you like; text style (sans vs mono) is
					independent and can be applied to any of these.
				</p>

				<div class="grid gap-2 lg:grid-cols-2">
					{#each languages as lang}
						<Panel title={lang.name} contentClass="p-2 flex flex-col gap-2">
							<p class="type-caption text-muted-foreground">{lang.desc}</p>
							{@render row(lang.tones)}
						</Panel>
					{/each}
				</div>

				<Panel title="G · Segmented Transport" contentClass="p-2 flex flex-col gap-2">
					<p class="type-caption text-muted-foreground">
						DAW transport cluster — buttons joined with shared hairline dividers, one armed (record =
						red), one latched (loop). Any language above can be packed into a group like this.
					</p>
					<div class="flex flex-wrap items-center gap-3">
						<!-- Neutral segmented group -->
						<div class="inline-flex divide-x divide-border border border-border">
							<button type="button" aria-label="Play" class="flex h-7.5 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted [&_svg]:h-3.5 [&_svg]:w-3.5"><Play strokeWidth={2.5} /></button>
							<button type="button" aria-label="Stop" class="flex h-7.5 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted [&_svg]:h-3.5 [&_svg]:w-3.5"><Square strokeWidth={2.5} /></button>
							<button type="button" aria-label="Record" aria-pressed="true" class="flex h-7.5 w-8 items-center justify-center bg-destructive/15 text-destructive transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-current"><Circle strokeWidth={2.5} /></button>
							<button type="button" aria-label="Loop" aria-pressed="true" class="flex h-7.5 w-8 items-center justify-center bg-primary/15 text-primary transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5"><Repeat strokeWidth={2.5} /></button>
						</div>
						<!-- Text segmented (mode selector) -->
						<div class="inline-flex divide-x divide-border border border-border">
							<button type="button" class="h-7.5 px-2.5 text-sm font-medium leading-none text-foreground transition-colors hover:bg-muted">Move</button>
							<button type="button" class="h-7.5 bg-muted px-2.5 text-sm font-medium leading-none text-foreground transition-colors">Cut</button>
							<button type="button" class="h-7.5 px-2.5 text-sm font-medium leading-none text-foreground transition-colors hover:bg-muted">Draw</button>
						</div>
					</div>
				</Panel>
			</div>
		</main>
	</div>
</ThemeProvider>
