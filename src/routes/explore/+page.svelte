<script lang="ts">
	import ThemeProvider from '$lib/components/theme/ThemeProvider.svelte';
	import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';

	const sample =
		'The everyday flat button is a thin hairline by default, with the accent living in its border and text. Toggle the theme to inspect the live token swap, or read the spec for the full contract — surfaces, borders, and status colors all resolve from OKLCH tokens.';

	// Vary ONE thing per group so you can pick each independently.
	const colors = [
		{ label: 'muted-foreground (current)', cls: 'text-muted-foreground' },
		{ label: 'subtle-foreground', cls: 'text-subtle-foreground' },
		{ label: 'foreground (full contrast)', cls: 'text-foreground' }
	];
	const sizes = [
		{ label: '12px', cls: 'text-[12px]' },
		{ label: '12.5px (current)', cls: 'text-[12.5px]' },
		{ label: '13px', cls: 'text-[13px]' },
		{ label: '13.5px', cls: 'text-[13.5px]' }
	];
	const leadings = [
		{ label: '1.35', cls: 'leading-[1.35]' },
		{ label: '1.45 (current)', cls: 'leading-[1.45]' },
		{ label: '1.55', cls: 'leading-[1.55]' },
		{ label: '1.65', cls: 'leading-[1.65]' }
	];
	const weights = [
		{ label: '400 (current)', w: 400 },
		{ label: '415', w: 415 },
		{ label: '430', w: 430 },
		{ label: '450', w: 450 },
		{ label: '470', w: 470 },
		{ label: '500 (medium)', w: 500 }
	];
</script>

<ThemeProvider>
	<div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
		<header
			class="sticky top-0 z-30 flex h-[20px] shrink-0 items-center justify-between gap-8 border-b border-purple-300 bg-purple-200 px-1.5 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200"
		>
			<div class="type-button">SEQUENCE UI · BODY TEXT</div>
			<ThemeToggle />
		</header>

		<main class="min-h-0 flex-1 overflow-auto">
			<div class="mx-auto flex max-w-2xl flex-col gap-2 p-3">
				<p class="type-caption text-muted-foreground">
					Same paragraph, one variable perturbed per group. Pick a color, a size, and a
					line-height — I'll combine your picks into <code class="type-code">type-body</code>.
				</p>

				<Panel title="Color — (12.5px · lh 1.45 · weight 400)" contentClass="p-2 flex flex-col gap-2">
					{#each colors as v}
						<div class="border-b border-border/60 pb-2 last:border-0 last:pb-0">
							<div class="type-label mb-1 text-muted-foreground">{v.label}</div>
							<p class={`font-sans text-[12.5px] leading-[1.45] font-normal ${v.cls}`}>{sample}</p>
						</div>
					{/each}
				</Panel>

				<Panel title="Size — (foreground · lh 1.5 · weight 400)" contentClass="p-2 flex flex-col gap-2">
					{#each sizes as v}
						<div class="border-b border-border/60 pb-2 last:border-0 last:pb-0">
							<div class="type-label mb-1 text-muted-foreground">{v.label}</div>
							<p class={`font-sans leading-[1.5] font-normal text-foreground ${v.cls}`}>{sample}</p>
						</div>
					{/each}
				</Panel>

				<Panel title="Line-height — (foreground · 13px · weight 400)" contentClass="p-2 flex flex-col gap-2">
					{#each leadings as v}
						<div class="border-b border-border/60 pb-2 last:border-0 last:pb-0">
							<div class="type-label mb-1 text-muted-foreground">{v.label}</div>
							<p class={`font-sans text-[13px] font-normal text-foreground ${v.cls}`}>{sample}</p>
						</div>
					{/each}
				</Panel>

				<Panel title="Weight — (foreground · 12.5px · lh 1.5)" contentClass="p-2 flex flex-col gap-2">
					{#each weights as v}
						<div class="border-b border-border/60 pb-2 last:border-0 last:pb-0">
							<div class="type-label mb-1 text-muted-foreground">{v.label}</div>
							<p class="font-sans text-[12.5px] leading-[1.5] text-foreground" style={`font-weight:${v.w}`}>
								{sample}
							</p>
						</div>
					{/each}
				</Panel>
			</div>
		</main>
	</div>
</ThemeProvider>
