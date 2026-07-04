<script lang="ts">
	import {
		ActionButton,
		Button,
		BaseField,
		BitField,
		Breadcrumb,
		CapacityBar,
		ProgressBar,
		CheckboxIcon,
		CheckboxInput,
		ChevronIcon,
		Citations,
		CollapsibleSection,
		FormLabel,
		IconButton,
		Menu,
		Note,
		NumberInput,
		Panel,
		Pagination,
		RadioGroupInput,
		RadioIcon,
		RadioInput,
		ResetValueButton,
		AngleField,
		ScrubInput,
		SegmentedControl,
		SelectInput,
		Slider,
		Statistic,
		ThresholdMarker,
		ThemeProvider,
		ThemeToggle,
		TimeBrush,
		TimecodeField,
		ToggleGroup,
		Tree,
		Pane,
		ToleranceField,
		Tooltip,
		TextInput
	} from '$lib';
	import type { CitationEntries, MenuItem, SelectOption, TreeNode } from '$lib';
	import {
		Activity,
		Archive,
		ChartLine,
		ChevronDown,
		Copy,
		Database,
		FileText,
		Folder,
		Info,
		MoreHorizontal,
		Pause,
		Play,
		RotateCcw,
		Settings2,
		Trash2,
		ZoomIn
	} from '@lucide/svelte';

	const navItems = [
		{ href: '#foundations', label: 'Foundations' },
		{ href: '#buttons', label: 'Buttons' },
		{ href: '#primitives', label: 'Primitives' },
		{ href: '#controls', label: 'Controls' },
		{ href: '#precision', label: 'Precision' },
		{ href: '#navigation', label: 'Navigation' },
		{ href: '#data', label: 'Data' },
		{ href: '#feedback', label: 'Feedback' },
		{ href: '#icons', label: 'Icons' },
		{ href: '#theme', label: 'Theme' }
	] as const;

	let activeSection = $state('foundations');
	$effect(() => {
		const root = document.querySelector('main');
		const els = navItems
			.map((i) => document.getElementById(i.href.slice(1)))
			.filter((el): el is HTMLElement => el !== null);
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeSection = entry.target.id;
				}
			},
			{ root, rootMargin: '-10% 0px -75% 0px', threshold: 0 }
		);
		els.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});

	const colorTokens = [
		'background',
		'foreground',
		'panel',
		'card',
		'muted',
		'muted-foreground',
		'subtle-foreground',
		'border',
		'border-strong',
		'primary',
		'destructive',
		'success',
		'warning',
		'highlight',
		'ring'
	] as const;

	const typeScale = [
		{ name: 'text-2xs', className: 'text-2xs' },
		{ name: 'text-xs', className: 'text-xs' },
		{ name: 'text-sm', className: 'text-sm' },
		{ name: 'text-base', className: 'text-base' },
		{ name: 'text-lg', className: 'text-lg' },
		{ name: 'text-xl', className: 'text-xl' },
		{ name: 'text-2xl', className: 'text-2xl' },
		{ name: 'text-3xl', className: 'text-3xl' },
		{ name: 'text-4xl', className: 'text-4xl' }
	] as const;

	const actionColors = ['blue', 'red', 'green', 'yellow', 'purple', 'gray'] as const;
	const selectOptions: SelectOption<{ label: string; text: string }>[] = [
		{ value: 'sine', label: 'Sine', text: 'Sine' },
		{ value: 'saw', label: 'Saw', text: 'Saw' },
		{ value: 'pulse', label: 'Pulse', text: 'Pulse' },
		{ value: 'noise', label: 'Noise', text: 'Noise', disabled: true }
	];
	const radioOptions = [
		{ value: 'clock', label: 'Clocked' },
		{ value: 'free', label: 'Free run' },
		{ value: 'hold', label: 'Hold' }
	];
	const panelCitations: CitationEntries = {
		entries: [
			{ name: 'Sequence Toy' },
			{ name: 'Theme contract', url: 'https://svelte.dev/' }
		],
		extra: ' / local port'
	};
	const snippets = {
		actionButton: `<ActionButton color="green" onclick={startSequence}>Start</ActionButton>
<ActionButton color="purple" highlighted>Armed</ActionButton>`,
		button: `<Button tone="primary" icon={Play}>Start</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" tone="destructive">Remove</Button>
<Button variant="link" tone="primary" href="/docs">Learn more</Button>`,
		iconButton: `<IconButton icon={RotateCcw} label="Restart" active={isLooping} />`,
		segmentedControl: `<SegmentedControl id="view" label="View" bind:value={view}
  options={[{ value: 'arrange', label: 'Arrange' }, { value: 'mix', label: 'Mix' }, { value: 'edit', label: 'Edit' }]} />`,
		panel: `<Panel title="Transport" citations={citations} contentClass="p-1">
  <ActionButton color="green">Start</ActionButton>
</Panel>`,
		collapsible: `<CollapsibleSection title="Advanced" isOpen={advancedOpen} ontoggle={() => (advancedOpen = !advancedOpen)}>
  <Slider id="gain" bind:value={gain} min={0} max={1} />
</CollapsibleSection>`,
		pane: `<Pane tabs={[{ id: 'metrics', label: 'Metrics', icon: ChartLine }, { id: 'about', label: 'About', icon: Info }]} bind:active={tab}>
  {#snippet actions()}<IconButton icon={Settings2} label="Settings" />{/snippet}
  {#snippet children(active)}
    {#if active === 'metrics'}<RunChart />{:else}<About />{/if}
  {/snippet}
</Pane>`,
		slider: `<Slider id="tempo" label="Tempo" bind:value={tempo} min={60} max={220} step={1} unit="bpm" />`,
		numberInput: `<NumberInput id="steps" label="Steps" bind:value={steps} min={1} max={64} step={1} />`,
		textInput: `<TextInput id="name" label="Name" bind:value={sequenceName} />`,
		timecodeField: `<TimecodeField id="cue" label="Cue" bind:value={cueFrames} fps={30} />`,
		scrubInput: `<ScrubInput id="velocity" label="Velocity" bind:value={velocity} min={0} max={127} step={1} unit="vel" />`,
		angleField: `<AngleField id="phase" label="Phase" bind:value={phase} />`,
		thresholdMarker: `<ThresholdMarker id="limit" label="Limit" bind:value={limit} min={-24} max={0} step={0.5} unit="dB" warnAt={-12} critAt={-3} />`,
		bitField: `<BitField id="flags" label="Flags" bind:value={flags} bits={16} />`,
		baseField: `<BaseField id="address" label="Address" bind:value={address} />`,
		toleranceField: `<ToleranceField id="pitch" label="Pitch" bind:value={pitch} bind:tolerance={pitchTolerance} unit="Hz" />`,
		menu: `<Menu items={menuItems}>
  {#snippet trigger()}Actions{/snippet}
</Menu>`,
		breadcrumb: `<Breadcrumb items={breadcrumbItems} maxItems={3} />`,
		pagination: `<Pagination bind:page={currentPage} pageCount={10} />`,
		tree: `<Tree items={treeItems} bind:selected={selectedTree} bind:expanded={expandedTree} />`,
		capacityBar: `<CapacityBar id="storage-capacity" label="Storage" segments={capacitySegments} max={128} thresholds={[112]} unit="GB" />`,
		timeBrush: `<TimeBrush id="clip-brush" label="Clip window" bind:start={brushStart} bind:end={brushEnd} min={0} max={23} data={brushData} />`,
		progressBar: `<ProgressBar label="Render" showValue value={progress} buffer={progress + 18} />
<ProgressBar label="Scanning" />`,
		selectInput: `<SelectInput id="waveform" label="Waveform" bind:value={waveform} options={options} />`,
		toggleGroup: `<ToggleGroup id="mod" title="Modulation" showEnableToggle bind:enabled={modEnabled}>
  <CheckboxInput id="sync" label="Sync" bind:checked={sync} />
</ToggleGroup>`,
		checkboxInput: `<CheckboxInput id="quantize" label="Quantize" bind:checked={quantized} />`,
		radioGroupInput: `<RadioGroupInput id="clock" name="clock" bind:value={clockMode} options={options} />`,
		radioInput: `<RadioInput id="bus-a" name="bus" bind:group={soloBus} value="a" label="Bus A" />`,
		formLabel: `<FormLabel forInputId="sequence-name" value="Sequence name" />`,
		resetValueButton: `<ResetValueButton hasDefaultValue={tempo === 128} onReset={() => (tempo = 128)} />`,
		statistic: `<Statistic label="Tempo">
  {tempo}
  {#snippet funFact()}bpm{/snippet}
</Statistic>`,
		note: `<Note label="Clock warning" type="warning">Output is running hot.</Note>`,
		citations: `<Citations citations={{ entries: [{ name: 'Spec' }], extra: ' / local' }} />`,
		tooltip: `<Tooltip icon={Settings2}>Hold Alt while dragging to snap to major ticks.</Tooltip>`,
		chevronIcon: `<ChevronIcon direction={isOpen ? 'down' : 'right'} />`,
		checkboxIcon: `<CheckboxIcon checked={enabled} />`,
		radioIcon: `<RadioIcon checked={selected === 'a'} />`,
		themeProvider: `<ThemeProvider>
  <ThemeToggle />
  <App />
</ThemeProvider>`,
		themeToggle: `<ThemeToggle />`
	};

	let actionCount = $state(0);
	let paneTab = $state('metrics');
	let activeTool = $state<'inspect' | 'zoom' | 'settings'>('inspect');
	let segView = $state('mix');
	let segTool = $state('zoom');
	let collapsibleOpen = $state(true);
	let toolbarRunning = $state(false);
	let tempo = $state(128);
	let swing = $state(14);
	let steps = $state(16);
	let sequenceName = $state('Pattern 03');
	let cueFrames = $state(109845);
	let velocity = $state(96);
	let phase = $state(405);
	let limit = $state(-9);
	let flags = $state(0x2ac5);
	let address = $state(4095);
	let pitch = $state(440);
	let pitchTolerance = $state(0.05);
	let waveform = $state<string | number>('saw');
	let modEnabled = $state(true);
	let modSync = $state(true);
	let quantized = $state(true);
	let clockMode = $state('clock');
	let soloBus = $state<string | number>('a');
	let checkIconState = $state(true);
	let radioIconState = $state(true);
	let menuAction = $state('Ready');
	let currentPage = $state(4);
	let selectedTree = $state('clip-a');
	let expandedTree = $state(['session']);
	let renderProgress = $state(24);
	$effect(() => {
		const timer = setInterval(() => {
			renderProgress = renderProgress >= 100 ? 0 : renderProgress + 4;
		}, 700);
		return () => clearInterval(timer);
	});
	let brushStart = $state(5);
	let brushEnd = $state(16);

	const breadcrumbItems = [
		{ label: 'Library', href: '#navigation' },
		{ label: 'Sessions', href: '#navigation' },
		{ label: 'Summer Grant', href: '#navigation' },
		{ label: 'Pattern 03' }
	];
	const menuItems: MenuItem[] = [
		{ heading: 'Pattern' },
		{ label: 'Duplicate', icon: Copy, shortcut: 'D', onSelect: () => (menuAction = 'Duplicated') },
		{ label: 'Archive', icon: Archive, shortcut: 'A', onSelect: () => (menuAction = 'Archived') },
		{ separator: true },
		{ label: 'Delete', icon: Trash2, destructive: true, onSelect: () => (menuAction = 'Delete queued') },
		{ label: 'Sync disabled', disabled: true }
	];
	const treeItems: TreeNode[] = [
		{
			id: 'session',
			label: 'Session',
			icon: Folder,
			children: [
				{ id: 'clip-a', label: 'Clip A', icon: FileText },
				{ id: 'clip-b', label: 'Clip B', icon: FileText },
				{
					id: 'sources',
					label: 'Sources',
					icon: Database,
					children: [
						{ id: 'source-midi', label: 'MIDI take', icon: FileText },
						{ id: 'source-notes', label: 'Notes', icon: FileText }
					]
				}
			]
		},
		{ id: 'render', label: 'Render queue', icon: Folder }
	];
	const capacitySegments = [
		{ label: 'Used', value: 58 },
		{ label: 'Reserved', value: 22 },
		{ label: 'Free', value: 18 }
	];
	const brushData = [
		5, 8, 12, 9, 14, 18, 22, 19, 15, 20, 24, 28, 26, 21, 17, 23, 29, 31, 25, 18,
		14, 11, 9, 13
	];

	const tempoIsDefault = $derived(tempo === 128);
	const stepsIsDefault = $derived(steps === 16);
	const nameIsDefault = $derived(sequenceName === 'Pattern 03');
	const waveformIsDefault = $derived(waveform === 'saw');
	const quantizedIsDefault = $derived(quantized);
	const clockIsDefault = $derived(clockMode === 'clock');

	function resetTempo() {
		tempo = 128;
	}

	function resetSteps() {
		steps = 16;
	}

	function resetName() {
		sequenceName = 'Pattern 03';
	}

	function resetWaveform() {
		waveform = 'saw';
	}

	function resetQuantized() {
		quantized = true;
	}

	function resetClock() {
		clockMode = 'clock';
	}
</script>

<ThemeProvider>
	<div class="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
		<header
			class="sticky top-0 z-30 flex h-[20px] shrink-0 items-center justify-between gap-8 border-b border-purple-300 bg-purple-200 px-1.5 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200"
		>
			<span class="font-mono text-xs font-semibold uppercase tracking-wider">Sequence UI</span>
			<ThemeToggle />
		</header>

		<div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[10rem_1fr]">
			<aside
				class="hidden min-h-0 overflow-y-auto overscroll-contain border-r border-border bg-panel md:block"
				aria-label="Gallery sections"
			>
				<nav class="flex flex-col">
					{#each navItems as item, i}
						{@const active = activeSection === item.href.slice(1)}
						<a
							href={item.href}
							aria-current={active ? 'page' : undefined}
							class={`flex items-center px-2 py-1 type-title ${
								i < navItems.length - 1 ? 'border-b border-b-border/60' : ''
							} ${
								active
									? 'bg-card text-foreground'
									: 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
							}`}
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</aside>

			<main class="min-h-0 overflow-y-auto overscroll-contain scroll-smooth bg-background">
				<!-- Spacing is container-owned, two levels only: sections are spaced by
				     `stack-section` (6.4px); everything inside a section — heading to
				     panels, panel to panel, both axes — is `stack-group` / `gap-1`
				     (3.2px). No panel or heading sets its own external margin. -->
				<div class="mx-auto max-w-7xl stack-section p-2 sm:p-4">
					<section id="foundations" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Foundations</h2>

						<div class="grid gap-1 xl:grid-cols-[1.15fr_0.85fr]">
							<Panel title="Color Tokens" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Semantic OKLCH variables drive the surfaces, text, borders, status colors, and
									focus rings. Toggle the theme to inspect the live token swap.
								</p>
								<div class="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
									{#each colorTokens as token}
										<div class="border border-border bg-card p-1">
											<div
												class="h-9 border border-border-strong"
												style={`background: var(--${token});`}
											></div>
											<div
												class="mt-1 truncate text-muted-foreground type-label"
											>
												{token}
											</div>
										</div>
									{/each}
								</div>
							</Panel>

							<Panel title="Density" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Base spacing is 0.25rem, with half-step sizing used for inputs, rows, and
									buttons. Labels and prose are sans; mono is reserved for values, code, and terse tags.
								</p>
								<div class="grid grid-cols-4 gap-1">
									{#each [1, 2, 3, 4, 5, 6, 7, 8] as unit}
										<div class="border border-border bg-muted p-1">
											<div class="h-3 bg-foreground" style={`width: ${unit * 0.2}rem;`}></div>
											<div class="mt-1 text-subtle-foreground type-label">
												{unit}u
											</div>
										</div>
									{/each}
								</div>
								<Note label="Density note" type="info">
									Sharp corners, 1px borders, and compact line heights are part of the API.
								</Note>
							</Panel>
						</div>

						<Panel title="Type Scale" contentClass="pad-box stack-field">
							<div class="grid gap-1 lg:grid-cols-2">
								{#each typeScale as type}
									<div class="grid grid-cols-[5.5rem_1fr] items-baseline gap-2 border border-border bg-muted/50 p-1">
										<div class="font-mono text-2xs font-bold uppercase tracking-wide text-muted-foreground">
											{type.name}
										</div>
										<div class="grid gap-1 sm:grid-cols-2">
											<p class={`${type.className} font-mono`}>Mono sample 0123</p>
											<p class={`${type.className} font-sans`}>Sans sample interface text</p>
										</div>
									</div>
								{/each}
							</div>
						</Panel>
					</section>

					<section id="buttons" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Buttons</h2>
						<div class="grid gap-1 lg:grid-cols-2">
							<Panel title="ActionButton" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Gradient command button with six semantic colors and a highlighted pulse state.
								</p>
								<div class="flex flex-wrap gap-1">
									{#each actionColors as color}
										<ActionButton {color} onclick={() => actionCount += 1}>{color}</ActionButton>
									{/each}
									<ActionButton color="purple" highlighted onclick={() => actionCount += 1}>
										Armed {actionCount}
									</ActionButton>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.actionButton}</code></pre>
							</Panel>

							<Panel title="IconButton" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Square icon command for toolbars, toggles, and dense control clusters.
								</p>
								<div class="flex items-center gap-1">
									<IconButton
										icon={Activity}
										label="Inspect"
										active={activeTool === 'inspect'}
										onclick={() => activeTool = 'inspect'}
									/>
									<IconButton
										icon={ZoomIn}
										label="Zoom"
										active={activeTool === 'zoom'}
										onclick={() => activeTool = 'zoom'}
									/>
									<IconButton
										icon={Settings2}
										label="Settings"
										highlighted={activeTool === 'settings'}
										onclick={() => activeTool = 'settings'}
									/>
									<span class="ml-2 text-muted-foreground type-label">
										{activeTool}
									</span>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.iconButton}</code></pre>
							</Panel>

							<Panel title="Button" class="lg:col-span-2" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									The everyday flat button — a thin hairline by default (1px border, accent in border + text) × tone
									(default / primary / destructive) × size, with icon, loading, and disabled
									states. The calm complement to ActionButton.
								</p>
								<div class="flex flex-wrap items-center gap-1">
									<Button tone="primary" icon={Play}>Start</Button>
									<Button tone="destructive" icon={Trash2}>Delete</Button>
									<Button>Cancel</Button>
								</div>
								<div class="flex flex-wrap items-center gap-1">
									<Button variant="ghost">Ghost</Button>
									<Button variant="ghost" tone="destructive">Ghost danger</Button>
									<Button variant="link" tone="primary">Link</Button>
									<Button iconRight={ChevronDown}>Menu</Button>
									<Button tone="primary" loading>Saving</Button>
									<Button disabled>Disabled</Button>
								</div>
								<div class="flex flex-wrap items-center gap-1">
									<Button size="sm" variant="outline">Small</Button>
									<Button size="sm" tone="primary" icon={Play}>Small primary</Button>
									<Button size="sm" variant="ghost">Small ghost</Button>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.button}</code></pre>
							</Panel>

							<Panel title="SegmentedControl" class="lg:col-span-2" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Single-select cluster of joined segments with shared hairline dividers — a
									mode or tool switch (DAW/AE-style). Keyboard: arrows, Home/End. Text or
									icon-only segments.
								</p>
								<div class="flex flex-wrap items-center gap-2">
									<SegmentedControl
										id="seg-view"
										ariaLabel="View"
										bind:value={segView}
										options={[
											{ value: 'arrange', label: 'Arrange' },
											{ value: 'mix', label: 'Mix' },
											{ value: 'edit', label: 'Edit' }
										]}
									/>
									<SegmentedControl
										ariaLabel="Tool"
										bind:value={segTool}
										options={[
											{ value: 'inspect', icon: Activity },
											{ value: 'zoom', icon: ZoomIn },
											{ value: 'settings', icon: Settings2 }
										]}
									/>
									<SegmentedControl
										size="sm"
										ariaLabel="Density"
										bind:value={segView}
										options={[
											{ value: 'arrange', label: 'A' },
											{ value: 'mix', label: 'B' },
											{ value: 'edit', label: 'C' }
										]}
									/>
									<span class="text-muted-foreground type-label">{segView} · {segTool}</span>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.segmentedControl}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="primitives" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Primitives</h2>
						<div class="grid gap-1 xl:grid-cols-3">
							<Panel title="Panel" citations={panelCitations} contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Bordered surface with a filled header, optional citations, and action slot.
								</p>
								<div class="grid grid-cols-2 gap-1">
									<Statistic label="Tempo">{tempo}<span>bpm</span></Statistic>
									<Statistic label="Steps">{steps}<span>total</span></Statistic>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.panel}</code></pre>
							</Panel>

							<Panel title="CollapsibleSection" contentClass="p-0">
								<CollapsibleSection
									title="Modulation Bus"
									isOpen={collapsibleOpen}
									ontoggle={() => collapsibleOpen = !collapsibleOpen}
								>
									<CheckboxInput id="collapsible-sync" label="Sync modulation" bind:checked={modSync} />
									<Slider id="collapsible-swing" label="Swing" bind:value={swing} min={0} max={64} step={1} unit="%" />
								</CollapsibleSection>
								<div class="pad-box stack-field">
									<p class="text-foreground prose">
										Keyboard and pointer operable section row for nested settings.
									</p>
									<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.collapsible}</code></pre>
								</div>
							</Panel>

							<Panel title="Pane" contentClass="p-0">
								<Pane
									tabs={[
										{ id: 'metrics', label: 'Metrics', icon: ChartLine },
										{ id: 'about', label: 'About', icon: Info }
									]}
									bind:active={paneTab}
									class="border-0"
								>
									{#snippet actions()}
										<IconButton icon={Settings2} label="Settings" />
									{/snippet}
									{#snippet children(active)}
										{#if active === 'metrics'}
											<div class="grid gap-1">
												<Statistic label="State">{toolbarRunning ? 'running' : 'paused'}</Statistic>
												<Note label="Transport" type={toolbarRunning ? 'info' : 'warning'}>
													Tabbed content pane — like a VS Code editor group.
												</Note>
											</div>
											<div class="flex items-center gap-1">
												<IconButton icon={Play} label="Run" active={toolbarRunning} onclick={() => (toolbarRunning = true)} />
												<IconButton icon={Pause} label="Pause" active={!toolbarRunning} onclick={() => (toolbarRunning = false)} />
												<IconButton icon={RotateCcw} label="Restart" onclick={() => (actionCount = 0)} />
											</div>
										{:else}
											<p class="text-foreground prose">
												Each tab switches the pane body; the strip carries an optional actions slot.
											</p>
										{/if}
									{/snippet}
								</Pane>
								<div class="pad-box stack-field">
									<p class="text-foreground prose">
										Tabbed content pane (app-shell / editor-group pattern).
									</p>
									<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.pane}</code></pre>
								</div>
							</Panel>
						</div>
					</section>

					<section id="controls" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Controls</h2>
						<div class="grid gap-1 xl:grid-cols-2">
							<Panel title="Slider" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Pointer, keyboard, typed entry, ticks, unit display, and reset support.
								</p>
								<Slider
									id="tempo"
									label="Tempo"
									bind:value={tempo}
									min={60}
									max={220}
									step={1}
									unit="bpm"
									hasDefaultValue={tempoIsDefault}
									onReset={resetTempo}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.slider}</code></pre>
							</Panel>

							<Panel title="NumberInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Compact numeric field with mono numeric sizing, unit affordance, and reset.
								</p>
								<NumberInput
									id="steps"
									label="Steps"
									bind:value={steps}
									min={1}
									max={64}
									step={1}
									unit="steps"
									hasDefaultValue={stepsIsDefault}
									onReset={resetSteps}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.numberInput}</code></pre>
							</Panel>

							<Panel title="TextInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Tokenized text field for compact forms and control captions.
								</p>
								<TextInput
									id="sequence-name"
									label="Name"
									bind:value={sequenceName}
									placeholder="Pattern name"
									hasDefaultValue={nameIsDefault}
									onReset={resetName}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.textInput}</code></pre>
							</Panel>

							<Panel title="SelectInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Custom listbox select with disabled options, keyboard navigation, and portal menu.
								</p>
								<SelectInput
									id="waveform"
									label="Waveform"
									bind:value={waveform}
									options={selectOptions}
									hasDefaultValue={waveformIsDefault}
									onReset={resetWaveform}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.selectInput}</code></pre>
							</Panel>

							<ToggleGroup
								id="mod-toggle"
								title="ToggleGroup"
								showEnableToggle
								bind:enabled={modEnabled}
								contentClass="pad-box stack-field"
							>
								<p class="text-foreground prose">
									Panel-backed enable group that gates child controls behind a checkbox toggle.
								</p>
								<CheckboxInput id="mod-sync" label="Sync to transport" bind:checked={modSync} />
								<Slider id="mod-depth" label="Depth" bind:value={swing} min={0} max={100} step={1} unit="%" />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.toggleGroup}</code></pre>
							</ToggleGroup>

							<Panel title="CheckboxInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Accessible checkbox with custom icon, citation support, and reset action.
								</p>
								<CheckboxInput
									id="quantized"
									label="Quantize output"
									bind:checked={quantized}
									hasDefaultValue={quantizedIsDefault}
									onReset={resetQuantized}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.checkboxInput}</code></pre>
							</Panel>

							<Panel title="RadioGroupInput / RadioInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Group helper for related radio options, plus the raw radio primitive for custom rows.
								</p>
								<RadioGroupInput
									id="clock-mode"
									name="clock-mode"
									label="Clock"
									bind:value={clockMode}
									options={radioOptions}
									hasDefaultValue={clockIsDefault}
									onReset={resetClock}
								/>
								<div class="mt-1 border border-border bg-muted p-1">
									<FormLabel value="Solo bus" />
									<div class="mt-1 flex gap-1">
										<RadioInput id="bus-a" name="solo-bus" bind:group={soloBus} value="a" label="Bus A" />
										<RadioInput id="bus-b" name="solo-bus" bind:group={soloBus} value="b" label="Bus B" />
									</div>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.radioGroupInput}</code></pre>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.radioInput}</code></pre>
							</Panel>

							<Panel title="FormLabel / ResetValueButton" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Small label primitive and reset icon used by the input family.
								</p>
								<FormLabel forInputId="manual-reset-value" value="Manual reset lane" />
								<div class="flex items-center gap-1">
									<input
										id="manual-reset-value"
										class="flex-1 border border-border bg-card px-1.5 py-0.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body"
										bind:value={sequenceName}
									/>
									<ResetValueButton hasDefaultValue={nameIsDefault} onReset={resetName} />
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.formLabel}</code></pre>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.resetValueButton}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="precision" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Precision</h2>
						<div class="grid gap-1 xl:grid-cols-2">
							<Panel title="TimecodeField" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Segmented frame-accurate entry with carry-aware arrow stepping.
								</p>
								<TimecodeField
									id="cue-timecode"
									label="Cue point"
									bind:value={cueFrames}
									fps={30}
									hasDefaultValue={cueFrames === 109845}
									onReset={() => cueFrames = 109845}
								/>
								<p class="text-muted-foreground type-label">
									{cueFrames} frames
								</p>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.timecodeField}</code></pre>
							</Panel>

							<Panel title="ScrubInput" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Horizontal drag-to-set numeric input with direct typed entry and reset support.
								</p>
								<ScrubInput
									id="velocity-scrub"
									label="Velocity"
									bind:value={velocity}
									min={0}
									max={127}
									step={1}
									unit="vel"
									hasDefaultValue={velocity === 96}
									onReset={() => velocity = 96}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.scrubInput}</code></pre>
							</Panel>

							<Panel title="AngleField" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Flat angular drag control with accumulated revolutions and typed degree entry.
								</p>
								<AngleField id="phase-angle" label="Phase" bind:value={phase} />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.angleField}</code></pre>
							</Panel>

							<Panel title="ThresholdMarker" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Compact threshold scale with warning and critical ranges plus keyboard adjustment.
								</p>
								<ThresholdMarker
									id="limit-threshold"
									label="Limit"
									bind:value={limit}
									min={-24}
									max={0}
									step={0.5}
									unit="dB"
									warnAt={-12}
									critAt={-3}
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.thresholdMarker}</code></pre>
							</Panel>

							<Panel title="BitField" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									MSB-first bit toggles with editable hexadecimal and decimal readouts.
								</p>
								<BitField id="flags-field" label="Flags" bind:value={flags} bits={16} />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.bitField}</code></pre>
							</Panel>

							<Panel title="BaseField" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									One integer mirrored live across decimal, hexadecimal, binary, and octal.
								</p>
								<BaseField id="address-field" label="Address" bind:value={address} />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.baseField}</code></pre>
							</Panel>

							<Panel title="ToleranceField" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Nominal numeric value plus non-negative tolerance and optional unit.
								</p>
								<ToleranceField
									id="pitch-field"
									label="Pitch"
									bind:value={pitch}
									bind:tolerance={pitchTolerance}
									unit="Hz"
								/>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.toleranceField}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="navigation" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Navigation</h2>
						<div class="grid gap-1 xl:grid-cols-2">
							<Panel title="Menu" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Portal action menu with roving keyboard navigation, shortcuts, headings, and
									destructive text treatment.
								</p>
								<div class="flex flex-wrap items-center gap-1">
									<Menu items={menuItems}>
										{#snippet trigger(open)}
											<MoreHorizontal class="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
											{open ? 'Open' : 'Actions'}
										{/snippet}
									</Menu>
									<span class="ml-2 text-muted-foreground type-label">{menuAction}</span>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.menu}</code></pre>
							</Panel>

							<Panel title="Breadcrumb" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Wrap-friendly hierarchy links with sans navigation labels and chevron separators.
								</p>
								<Breadcrumb items={breadcrumbItems} maxItems={3} />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.breadcrumb}</code></pre>
							</Panel>

							<Panel title="Pagination" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Fixed-width page controls with first/last anchors, sibling pages, and collapsed
									gaps.
								</p>
								<div class="flex flex-wrap items-center gap-1">
									<Pagination bind:page={currentPage} pageCount={10} />
									<span class="text-muted-foreground type-label">Page {currentPage}</span>
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.pagination}</code></pre>
							</Panel>

							<Panel title="Tree" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Expandable hierarchy with full-row selection fill, indentation depth, and roving
									row focus.
								</p>
								<Tree
									items={treeItems}
									bind:selected={selectedTree}
									bind:expanded={expandedTree}
									class="border border-border bg-card p-1"
								/>
								<p class="text-muted-foreground type-label">Selected {selectedTree}</p>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.tree}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="data" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Data</h2>
						<div class="grid gap-1 xl:grid-cols-2">
							<Panel title="CapacityBar" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Stacked utilization with chart token fills, an empty remainder, threshold ticks, and
									a compact legend.
								</p>
								<CapacityBar
									id="storage-capacity"
									label="Storage"
									segments={capacitySegments}
									max={128}
									thresholds={[112]}
									unit="GB"
								/>
								<p class="text-muted-foreground type-label">
									Threshold 112GB
								</p>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.capacityBar}</code></pre>
							</Panel>

							<Panel title="TimeBrush" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Resizable range over a compact chart strip with edge handles, body dragging, and
									track-to-create selection.
								</p>
								<TimeBrush
									id="clip-brush"
									label="Clip window"
									bind:start={brushStart}
									bind:end={brushEnd}
									min={0}
									max={23}
									data={brushData}
								/>
								<p class="text-muted-foreground type-label">
									Selected {brushStart} - {brushEnd}
								</p>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.timeBrush}</code></pre>
							</Panel>

							<Panel title="ProgressBar" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Determinate, buffered, and indeterminate progress with an optional label/value
									readout plus color and size variants.
								</p>
								<div class="stack-field">
									<ProgressBar
										label="Render"
										showValue
										value={renderProgress}
										buffer={Math.min(100, renderProgress + 18)}
										size="sm"
									/>
									<ProgressBar label="Bounce" showValue value={92} color="success" size="sm" />
									<ProgressBar label="Disk" showValue value={87} color="warning" size="sm" />
									<ProgressBar label="Scanning" size="sm" />
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.progressBar}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="feedback" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Feedback</h2>
						<div class="grid gap-1 lg:grid-cols-2 xl:grid-cols-4">
							<Panel title="Statistic" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Dense metric tile with mono value and optional contextual text.</p>
								<Statistic label="Tempo">
									{tempo}
									{#snippet funFact()}bpm{/snippet}
								</Statistic>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.statistic}</code></pre>
							</Panel>

							<Panel title="Note" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Status callout with info, warning, and error color treatments.</p>
								<Note label="Clock warning" type="warning">
									Swing above 50% may destabilize tightly clocked patterns.
								</Note>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.note}</code></pre>
							</Panel>

							<Panel title="Citations" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Inline provenance text for formulas, imported models, or specs.</p>
								<Citations citations={panelCitations} />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.citations}</code></pre>
							</Panel>

							<Panel title="Tooltip" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Icon-led helper block for dense interfaces that need one precise hint.</p>
								<Tooltip icon={Settings2}>
									Hold Alt while dragging the slider thumb to snap to major ticks.
								</Tooltip>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.tooltip}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="icons" class="scroll-mt-14 stack-group">
						<h2 class="border-b border-border pb-2 type-heading">Icons</h2>
						<div class="grid gap-1 lg:grid-cols-3">
							<Panel title="ChevronIcon" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Directional disclosure glyph used by sections and selects.</p>
								<button
									type="button"
									class="inline-flex h-6 items-center gap-1 border border-border bg-panel px-1.5 type-body"
									onclick={() => collapsibleOpen = !collapsibleOpen}
								>
									<ChevronIcon direction={collapsibleOpen ? 'down' : 'right'} />
									{collapsibleOpen ? 'Open' : 'Closed'}
								</button>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.chevronIcon}</code></pre>
							</Panel>

							<Panel title="CheckboxIcon" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Standalone check state icon that powers CheckboxInput.</p>
								<button
									type="button"
									class="inline-flex h-6 items-center gap-1 border border-border bg-panel px-1.5"
									onclick={() => checkIconState = !checkIconState}
								>
									<CheckboxIcon checked={checkIconState} />
									<span class="type-body">{checkIconState ? 'Checked' : 'Clear'}</span>
								</button>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.checkboxIcon}</code></pre>
							</Panel>

							<Panel title="RadioIcon" contentClass="pad-box stack-field">
								<p class="text-foreground prose">Standalone radio state icon that powers RadioInput.</p>
								<button
									type="button"
									class="inline-flex h-6 items-center gap-1 border border-border bg-panel px-1.5"
									onclick={() => radioIconState = !radioIconState}
								>
									<RadioIcon checked={radioIconState} />
									<span class="type-body">{radioIconState ? 'Selected' : 'Idle'}</span>
								</button>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.radioIcon}</code></pre>
							</Panel>
						</div>
					</section>

					<section id="theme" class="scroll-mt-14 stack-group pb-4">
						<h2 class="border-b border-border pb-2 type-heading">Theme</h2>
						<div class="grid gap-1 lg:grid-cols-2">
							<Panel title="ThemeProvider" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									ThemeProvider resolves localStorage, system preference, and default theme, then
									applies the html.dark class that powers Tailwind's custom dark variant.
								</p>
								<div class="border border-border bg-muted p-1 text-muted-foreground type-caption">
									Storage key: sequence-ui-theme / class target: document.documentElement
								</div>
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.themeProvider}</code></pre>
							</Panel>

							<Panel title="ThemeToggle" contentClass="pad-box stack-field">
								<p class="text-foreground prose">
									Three-way segmented control for light, dark, and system modes.
								</p>
								<ThemeToggle />
								<pre class="overflow-x-auto border border-border bg-muted pad-box text-foreground type-code"><code>{snippets.themeToggle}</code></pre>
							</Panel>
						</div>
					</section>
				</div>
			</main>
		</div>
	</div>
</ThemeProvider>
