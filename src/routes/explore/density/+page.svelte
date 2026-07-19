<script lang="ts">
	import {
		AppBar,
		Button,
		CheckboxInput,
		Panel,
		ScrubInput,
		SelectInput,
		Slider,
		TextInput,
		ThemeProvider,
		ThemeToggle
	} from '$lib';
	import type { SelectOption } from '$lib';

	const columns = [
		{ cls: 'density-compact', label: '.density-compact (default, instrument)' },
		{ cls: 'density-cozy', label: '.density-cozy' },
		{ cls: 'density-comfortable', label: '.density-comfortable' }
	];

	const waveforms: SelectOption<{ label: string }>[] = [
		{ value: 'sine', label: 'Sine' },
		{ value: 'saw', label: 'Saw' },
		{ value: 'pulse', label: 'Pulse' }
	];

	// independent state per column so the controls actually work
	let state = $state(
		columns.map(() => ({
			name: 'Pattern 03',
			waveform: 'saw',
			tempo: 128,
			threshold: -42.5,
			sync: true
		}))
	);
</script>

<svelte:head><title>Explore · Density</title></svelte:head>

<ThemeProvider>
	<div class="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
		<AppBar title="Sequence UI" context="Density explore">
			<ThemeToggle integrated />
		</AppBar>

		<main class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
			<p class="prose mb-4 max-w-2xl text-muted-foreground">
				The exact same components and styling at three densities — set only by
				<code class="type-code">--density</code> on each column. Gaps, padding, and control
				heights scale together; type, icons, and borders stay fixed. Flip the theme too.
			</p>
			<div class="grid items-start gap-4 lg:grid-cols-3">
				{#each columns as col, i}
					<div class={col.cls}>
						<div class="mb-2 type-fine text-muted-foreground">{col.label}</div>
						<Panel title="Oscillator">
							<TextInput id={`name-${i}`} label="Pattern name" bind:value={state[i].name} />
							<SelectInput
								id={`wave-${i}`}
								label="Waveform"
								options={waveforms}
								bind:value={state[i].waveform}
							/>
							<Slider
								id={`tempo-${i}`}
								label="Tempo"
								min={60}
								max={220}
								step={1}
								unit="bpm"
								bind:value={state[i].tempo}
							/>
							<ScrubInput
								id={`thr-${i}`}
								label="Threshold"
								unit="dB"
								min={-90}
								max={0}
								step={0.5}
								precision={1}
								bind:value={state[i].threshold}
							/>
							<CheckboxInput id={`sync-${i}`} label="Sync to clock" bind:checked={state[i].sync} />
							<div class="flex flex-wrap gap-1">
								<Button tone="primary">Apply</Button>
								<Button variant="outline">Reset</Button>
								<Button variant="ghost" tone="destructive">Clear</Button>
							</div>
						</Panel>
					</div>
				{/each}
			</div>
		</main>
	</div>
</ThemeProvider>
