<script lang="ts">
	import FormLabel from './FormLabel.svelte';

	type $$Props = {
		value: number;
		tolerance: number;
		unit?: string;
		id: string;
		label?: string;
		class?: string;
	};

	let {
		value = $bindable(0),
		tolerance = $bindable(0),
		unit,
		id,
		label,
		class: wrapperClass = ''
	}: $$Props = $props();

	let focusedField = $state<'value' | 'tolerance' | null>(null);
	let valueText = $state(String(value));
	let toleranceText = $state(String(tolerance));
	let toleranceInvalid = $state(false);

	$effect(() => {
		if (focusedField !== 'value') valueText = String(value);
		if (focusedField !== 'tolerance') {
			toleranceText = String(tolerance);
			toleranceInvalid = tolerance < 0;
		}
	});

	function updateValue(next: string) {
		valueText = next;
		const parsed = Number.parseFloat(next);
		if (!Number.isNaN(parsed)) value = parsed;
	}

	function updateTolerance(next: string) {
		toleranceText = next;
		const parsed = Number.parseFloat(next);
		if (Number.isNaN(parsed) || parsed < 0) {
			toleranceInvalid = true;
			return;
		}

		toleranceInvalid = false;
		tolerance = parsed;
	}
</script>

<div class={`stack-tight ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel forInputId={`${id}-value`} value={label} />
	{/if}
	<div class="inline-flex h-control items-stretch border border-border bg-card">
		<input
			id={`${id}-value`}
			type="text"
			inputmode="decimal"
			value={valueText}
			aria-label="Nominal value"
			class="w-20 border-0 bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
			onfocus={() => focusedField = 'value'}
			onblur={() => focusedField = null}
			oninput={(event) => updateValue((event.currentTarget as HTMLInputElement).value)}
		/>
		<span class="flex items-center border-l border-border bg-muted px-2 text-muted-foreground type-tag">±</span>
		<input
			id={`${id}-tolerance`}
			type="text"
			inputmode="decimal"
			value={toleranceText}
			aria-label="Tolerance"
			class={`w-16 border-0 bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value ${
				toleranceInvalid ? 'border border-destructive' : ''
			}`}
			onfocus={() => focusedField = 'tolerance'}
			onblur={() => focusedField = null}
			oninput={(event) => updateTolerance((event.currentTarget as HTMLInputElement).value)}
		/>
		{#if unit}
			<span class="flex items-center border-l border-border bg-muted px-2 text-muted-foreground type-tag">{unit}</span>
		{/if}
	</div>
</div>
