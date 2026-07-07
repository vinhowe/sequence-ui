<script lang="ts">
	import { twMerge } from 'tailwind-merge';

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
		disabled?: boolean;
		class?: string;
		/** Classes for the bordered field itself — the right place for a content
		    width (`fieldClass="w-24"`). Widths on `class` squeeze the LABEL too. */
		fieldClass?: string;
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
		disabled = false,
		class: wrapperClass = '',
		fieldClass = '',
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();
</script>

<div class={`stack-tight ${disabled ? 'pointer-events-none opacity-50' : ''} ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div class="flex gap-1.5 items-center">
		{#if unit}
			<div class={`flex ${fieldClass}`.trim()}>
				<input
					type="number"
					{id}
					{disabled}
					bind:value
					{step}
					{min}
					{max}
					class="block h-control w-full border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
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
				{disabled}
				bind:value
				{step}
				{min}
				{max}
				class={twMerge('block h-control w-full border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value', fieldClass)}
			/>
		{/if}
		{#if onReset}
			<div class="translate-y-0.5">
				<ResetValueButton {hasDefaultValue} {onReset} />
			</div>
		{/if}
	</div>
</div>
