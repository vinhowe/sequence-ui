<script lang="ts">
	import {
		AppBar,
		Button,
		CapacityBar,
		CheckboxInput,
		CollapsibleSection,
		NumberInput,
		Note,
		RadioGroupInput,
		Rail,
		ScrubInput,
		SelectInput,
		Slider,
		Statistic,
		TextInput,
		ThemeProvider,
		ThemeToggle
	} from '$lib';
	import type { SelectOption } from '$lib';

	// ── Option catalogs ─────────────────────────────────────────────────────

	const regionOptions: SelectOption<{ label: string }>[] = [
		{ value: 'us-west-2', label: 'US West (Oregon)' },
		{ value: 'us-east-1', label: 'US East (Virginia)' },
		{ value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
		{ value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' }
	];

	const channelOptions = [
		{ value: 'stable', label: 'Stable' },
		{ value: 'beta', label: 'Beta' },
		{ value: 'nightly', label: 'Nightly' }
	];

	const sampleRateOptions: SelectOption<{ label: string }>[] = [
		{ value: 1, label: '1 Hz' },
		{ value: 10, label: '10 Hz' },
		{ value: 100, label: '100 Hz' },
		{ value: 1000, label: '1 kHz' }
	];

	// ── Settings state ──────────────────────────────────────────────────────

	const defaults = {
		deviceName: 'relay-workstation-07',
		region: 'us-west-2',
		launchAtLogin: true,
		updateChannel: 'stable',
		captureEnabled: true,
		sampleRate: 100,
		triggerThreshold: -42.5,
		preTriggerMs: 250,
		hysteresisDb: 3,
		bufferWindow: 30,
		maxStreams: 4,
		cacheDir: '~/Library/Application Support/Relay/cache',
		retentionDays: 14,
		autoPurge: true,
		syncInterval: 15,
		endpointUrl: 'https://ingest.relay.example.com/v1',
		apiToken: 'rly_sk_2f8a1c9d4e7b3a6f5091',
		pauseOnMetered: true
	};

	let s = $state(structuredClone(defaults));

	function resetToDefaults() {
		Object.assign(s, structuredClone(defaults));
		confirmingClear = false;
	}

	// ── The rail: one continuous surface of collapsible sections ────────────

	let open = $state({
		general: true,
		capture: true,
		advancedTrigger: false,
		storage: true,
		sync: true,
		danger: true
	});
	type SectionKey = keyof typeof open;
	const toggle = (key: SectionKey) => () => (open[key] = !open[key]);

	// ── Disk usage ──────────────────────────────────────────────────────────

	const diskQuotaGb = 128;
	let usedCapturesGb = $state(34.2);
	let usedIndexGb = $state(7.9);
	const usedTotalGb = $derived(usedCapturesGb + usedIndexGb);
	const usedPercent = $derived(Math.round((usedTotalGb / diskQuotaGb) * 100));

	// ── Danger zone ─────────────────────────────────────────────────────────

	let confirmingClear = $state(false);

	function clearCapturedData() {
		usedCapturesGb = 0;
		usedIndexGb = 0;
		confirmingClear = false;
	}

	let tokenVisible = $state(false);
</script>

<svelte:head>
	<title>Relay — Settings</title>
</svelte:head>

<ThemeProvider>
	<div class="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
		<AppBar title="Relay" context="Settings">
			<ThemeToggle integrated />
		</AppBar>

		<main class="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
			<!-- The RAIL: the canonical settings surface — ONE continuous bordered
			     surface of CollapsibleSection header rows sharing hairlines (Lightroom /
			     Blender properties-rail). The Rail component owns the outer border and
			     last-row border suppression. -->
			<div class="mx-auto w-full max-w-2xl p-2 sm:p-4">
				<Rail>
					<CollapsibleSection
						title="General"
						isOpen={open.general}
						ontoggle={toggle('general')}
					>
						<TextInput
							id="device-name"
							label="Device name"
							bind:value={s.deviceName}
							placeholder="relay-hostname"
						/>
						<SelectInput
							id="workspace-region"
							label="Workspace region"
							options={regionOptions}
							bind:value={s.region}
						/>
						<CheckboxInput
							id="launch-at-login"
							label="Launch Relay at login"
							bind:checked={s.launchAtLogin}
						/>
						<RadioGroupInput
							id="update-channel"
							name="update-channel"
							label="Update channel"
							options={channelOptions}
							bind:value={s.updateChannel}
						/>
					</CollapsibleSection>

					<CollapsibleSection
						title="Capture"
						isOpen={open.capture}
						ontoggle={toggle('capture')}
					>
						<CheckboxInput
							id="capture-enabled"
							label="Capture enabled"
							bind:checked={s.captureEnabled}
						/>
						<!-- Gated controls DISABLE in place (desktop convention) — never hide.
						     Native fieldset cascades disabled to every control inside. -->
						<fieldset
							disabled={!s.captureEnabled}
							class={`min-w-0 border-0 stack-field ${s.captureEnabled ? '' : 'opacity-50'}`.trim()}
						>
							<SelectInput
								id="sample-rate"
								label="Sample rate"
								options={sampleRateOptions}
								bind:value={s.sampleRate}
							/>
							<ScrubInput
								id="trigger-threshold"
								label="Trigger threshold"
								unit="dB"
								min={-90}
								max={0}
								step={0.5}
								precision={1}
								bind:value={s.triggerThreshold}
								hasDefaultValue={s.triggerThreshold === defaults.triggerThreshold}
								onReset={() => (s.triggerThreshold = defaults.triggerThreshold)}
							/>
							<!-- NESTED section: renders as a quiet twirl-down (left chevron,
							     indent-guide rule) — depth is detected automatically. -->
							<CollapsibleSection
								title="Advanced trigger"
								isOpen={open.advancedTrigger}
								ontoggle={toggle('advancedTrigger')}
							>
								<ScrubInput
									id="pre-trigger"
									label="Pre-trigger window"
									unit="ms"
									min={0}
									max={2000}
									step={10}
									bind:value={s.preTriggerMs}
								/>
								<ScrubInput
									id="hysteresis"
									label="Hysteresis"
									unit="dB"
									min={0}
									max={12}
									step={0.5}
									precision={1}
									bind:value={s.hysteresisDb}
								/>
							</CollapsibleSection>
							<Slider
								id="buffer-window"
								label="Buffer window"
								unit="s"
								min={1}
								max={120}
								step={1}
								bind:value={s.bufferWindow}
							/>
							<NumberInput
								id="max-streams"
								label="Max concurrent streams"
								min={1}
								max={32}
								step={1}
								bind:value={s.maxStreams}
								fieldClass="w-24"
							/>
						</fieldset>
					</CollapsibleSection>

					<CollapsibleSection
						title="Storage"
						isOpen={open.storage}
						ontoggle={toggle('storage')}
					>
						<TextInput
							id="cache-dir"
							label="Local cache directory"
							bind:value={s.cacheDir}
							placeholder="~/relay/cache"
						/>
						<Statistic label="Disk usage">
							{usedTotalGb.toLocaleString(undefined, { maximumFractionDigits: 1 })} GB
							{#snippet funFact()}
								of {diskQuotaGb} GB quota ({usedPercent}%)
							{/snippet}
						</Statistic>
						<CapacityBar
							id="disk-usage"
							label="Cache breakdown"
							unit=" GB"
							max={diskQuotaGb}
							thresholds={s.autoPurge ? [diskQuotaGb * 0.9] : []}
							segments={[
								{ label: 'Captures', value: usedCapturesGb },
								{ label: 'Index', value: usedIndexGb }
							]}
						/>
						<NumberInput
							id="retention-days"
							label="Retention"
							unit="days"
							min={1}
							max={365}
							step={1}
							bind:value={s.retentionDays}
							fieldClass="w-32"
						/>
						<CheckboxInput
							id="auto-purge"
							label="Auto-purge oldest captures on low disk (90% of quota)"
							bind:checked={s.autoPurge}
						/>
					</CollapsibleSection>

					<CollapsibleSection title="Sync" isOpen={open.sync} ontoggle={toggle('sync')}>
						<NumberInput
							id="sync-interval"
							label="Sync interval"
							unit="min"
							min={1}
							max={1440}
							step={1}
							bind:value={s.syncInterval}
							fieldClass="w-32"
						/>
						<TextInput
							id="endpoint-url"
							label="API endpoint"
							type="url"
							bind:value={s.endpointUrl}
							placeholder="https://ingest.example.com/v1"
						/>
						<TextInput
							id="api-token"
							label="API token"
							type={tokenVisible ? 'text' : 'password'}
							bind:value={s.apiToken}
						>
							{#snippet suffix()}
								<button type="button" onclick={() => (tokenVisible = !tokenVisible)}>
									{tokenVisible ? 'Hide' : 'Reveal'}
								</button>
							{/snippet}
						</TextInput>
						<CheckboxInput
							id="pause-on-metered"
							label="Pause sync on metered connections"
							bind:checked={s.pauseOnMetered}
						/>
					</CollapsibleSection>

					<CollapsibleSection
						title="Danger zone"
						isOpen={open.danger}
						ontoggle={toggle('danger')}
					>
						<Note label="Irreversible" type="warning">
							Clearing captured data deletes every capture and index entry in the local cache
							({usedTotalGb.toLocaleString(undefined, { maximumFractionDigits: 1 })} GB). Data
							already synced to the workspace is not affected.
						</Note>
						<div class="flex flex-wrap items-center gap-1">
							{#if confirmingClear}
								<Button variant="solid" tone="destructive" onclick={clearCapturedData}>
									Confirm — delete {usedTotalGb.toLocaleString(undefined, {
										maximumFractionDigits: 1
									})} GB
								</Button>
								<Button onclick={() => (confirmingClear = false)}>Cancel</Button>
							{:else}
								<Button
									tone="destructive"
									onclick={() => (confirmingClear = true)}
									disabled={usedTotalGb === 0}
								>
									Clear all captured data
								</Button>
							{/if}
						</div>
						<div class="flex flex-wrap items-center gap-1">
							<Button onclick={resetToDefaults}>Reset settings to defaults</Button>
							<span class="text-muted-foreground type-body">
								Restores every setting above; captured data is kept.
							</span>
						</div>
					</CollapsibleSection>
				</Rail>
			</div>
		</main>
	</div>
</ThemeProvider>
