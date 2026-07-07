<script lang="ts">
	import ScrubInput from './ScrubInput.svelte';

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
		step = 1,
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

<!-- NumberInput is the COUNT-flavored preset of ScrubInput — one numeric-field
     implementation for the whole system (typed entry, drag-to-set, Shift=×10 /
     Alt=÷10, clamping, unit affix, spinbutton a11y). Defaults to integer steps;
     the old bare <input type="number"> (browser spinners, no formatting, no drag)
     is retired. Prefer ScrubInput directly for fine-tune/float values. -->
<ScrubInput
	{label}
	bind:value
	{id}
	{step}
	{min}
	{max}
	{unit}
	{disabled}
	class={wrapperClass}
	{fieldClass}
	{hasDefaultValue}
	{onReset}
/>
