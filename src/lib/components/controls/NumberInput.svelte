<script lang="ts">
	import FormLabel from './FormLabel.svelte';
	import ResetValueButton from './ResetValueButton.svelte';

	type $$Props = {
		label?: string;
		value: number;
		id: string;
		step?: number;
		min?: number;
		max?: number;
		unit?: string;
		class?: string;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		label,
		value = $bindable(),
		id,
		step,
		min,
		max,
		unit,
		class: wrapperClass = '',
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();
</script>

<div class={`stack-tight ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div class="flex gap-1.5 items-center">
		{#if unit}
			<div class="flex">
				<input
					type="number"
					{id}
					bind:value
					{step}
					{min}
					{max}
					class="block w-full border border-border bg-card px-1.5 py-0.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
				/>
				<span
					class="inline-flex items-center border border-l-0 border-border bg-muted px-3 text-subtle-foreground type-value"
				>
					{unit}
				</span>
			</div>
		{:else}
			<input
				type="number"
				{id}
				bind:value
				{step}
				{min}
				{max}
				class="block w-full border border-border bg-card px-1.5 py-0.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
			/>
		{/if}
		{#if onReset}
			<div class="translate-y-0.5">
				<ResetValueButton {hasDefaultValue} {onReset} />
			</div>
		{/if}
	</div>
</div>
