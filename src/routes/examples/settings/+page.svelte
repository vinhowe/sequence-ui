<script lang="ts">
	import {
		AppBar,
		Button,
		CapacityBar,
		CheckboxInput,
		NumberInput,
		Note,
		Panel,
		RadioGroupInput,
		ScrubInput,
		SelectInput,
		Slider,
		Statistic,
		TextInput,
		ThemeProvider,
		ThemeToggle,
		ToggleGroup
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
	// One deep-reactive object so "Reset to defaults" is a single assign-back.

	const defaults = {
		// General
		deviceName: 'relay-workstation-07',
		region: 'us-west-2',
		launchAtLogin: true,
		updateChannel: 'stable',
		// Capture
		captureEnabled: true,
		sampleRate: 100,
		triggerThreshold: -42.5,
		bufferWindow: 30,
		maxStreams: 4,
		// Storage
		cacheDir: '~/Library/Application Support/Relay/cache',
		retentionDays: 14,
		autoPurge: true,
		// Sync
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

	// ── Disk usage (readout only; "Clear all captured data" zeroes it) ──────

	const diskQuotaGb = 128;
	let usedCapturesGb = $state(34.2);
	let usedIndexGb = $state(7.9);
	const usedTotalGb = $derived(usedCapturesGb + usedIndexGb);
	const usedPercent = $derived(Math.round((usedTotalGb / diskQuotaGb) * 100));

	// ── Danger zone: two-step confirm for the destructive action ────────────

	let confirmingClear = $state(false);

	function clearCapturedData() {
		usedCapturesGb = 0;
		usedIndexGb = 0;
		confirmingClear = false;
	}

	// API token: no reveal component exists, so gate the input's type locally.
	let tokenVisible = $state(false);
</script>

<svelte:head>
	<title>Relay — Settings</title>
</svelte:head>

<ThemeProvider>
	<div class="fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
		<AppBar title="Relay — Settings">
			<ThemeToggle integrated />
		</AppBar>

		<main class="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
			<!-- A settings page is a stack of titled panels, NOT heading-led page sections:
			     panels convey their own grouping via their title bars, so they stack tight
			     (stack-group, 4px) — `stack-section` is only for h2-led page regions. -->
			<div class="mx-auto w-full max-w-2xl stack-group p-2 sm:p-4">
				<!-- General -->
				<section class="stack-group">
					<Panel title="General">
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
					</Panel>
				</section>

				<!-- Capture — the header checkbox gates every child control -->
				<section class="stack-group">
					<ToggleGroup
						id="capture"
						title="Capture"
						showEnableToggle
						bind:enabled={s.captureEnabled}
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
						/>
					</ToggleGroup>
				</section>

				<!-- Storage -->
				<section class="stack-group">
					<Panel title="Storage">
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
						/>
						<CheckboxInput
							id="auto-purge"
							label="Auto-purge oldest captures on low disk (90% of quota)"
							bind:checked={s.autoPurge}
						/>
					</Panel>
				</section>

				<!-- Sync -->
				<section class="stack-group">
					<Panel title="Sync">
						<NumberInput
							id="sync-interval"
							label="Sync interval"
							unit="min"
							min={1}
							max={1440}
							step={1}
							bind:value={s.syncInterval}
						/>
						<TextInput
							id="endpoint-url"
							label="API endpoint"
							type="url"
							bind:value={s.endpointUrl}
							placeholder="https://ingest.example.com/v1"
						/>
						<!-- No password/reveal field component exists; compose TextInput's
						     `type` prop with a small toggle button instead. -->
						<div class="flex items-end gap-1">
							<TextInput
								id="api-token"
								label="API token"
								type={tokenVisible ? 'text' : 'password'}
								bind:value={s.apiToken}
								class="min-w-0 flex-1"
							/>
							<Button onclick={() => (tokenVisible = !tokenVisible)}>
								{tokenVisible ? 'Hide' : 'Reveal'}
							</Button>
						</div>
						<CheckboxInput
							id="pause-on-metered"
							label="Pause sync on metered connections"
							bind:checked={s.pauseOnMetered}
						/>
					</Panel>
				</section>

				<!-- Danger zone -->
				<section class="stack-group">
					<Panel title="Danger zone">
						<Note label="Irreversible" type="warning">
							Clearing captured data deletes every capture and index entry in the local cache
							({usedTotalGb.toLocaleString(undefined, { maximumFractionDigits: 1 })} GB). Data
							already synced to the workspace is not affected.
						</Note>
						<div class="flex flex-wrap items-center gap-1">
							{#if confirmingClear}
								<Button
									variant="solid"
									tone="destructive"
									onclick={clearCapturedData}
								>
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
					</Panel>
				</section>
			</div>
		</main>
	</div>
</ThemeProvider>
