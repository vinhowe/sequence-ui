<script module lang="ts">
	export type CapacitySegment = {
		label: string;
		value: number;
		color?: string;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	import FormLabel from '../controls/FormLabel.svelte';

	type $$Props = {
		segments: CapacitySegment[];
		max?: number;
		thresholds?: number[];
		label?: string;
		unit?: string;
		id: string;
		class?: string;
	};

	let {
		segments,
		max = undefined,
		thresholds = [],
		label,
		unit,
		id,
		class: wrapperClass = ''
	}: $$Props = $props();

	const chartClasses = [
		'bg-chart-1',
		'bg-chart-2',
		'bg-chart-3',
		'bg-chart-4',
		'bg-chart-5'
	] as const;

	const positiveSegments = $derived(
		segments.map((segment) => ({
			...segment,
			value: Math.max(0, Number.isFinite(segment.value) ? segment.value : 0)
		}))
	);
	const segmentTotal = $derived(
		positiveSegments.reduce((total, segment) => total + segment.value, 0)
	);
	const scaleMax = $derived(Math.max(max ?? segmentTotal, segmentTotal, 0));

	function percentForValue(value: number) {
		if (scaleMax <= 0) return 0;
		return Math.max(0, Math.min(100, (value / scaleMax) * 100));
	}

	function formatValue(value: number) {
		const displayValue = Number.isInteger(value) ? String(value) : value.toLocaleString();
		return unit ? `${displayValue}${unit}` : displayValue;
	}

	const renderedSegments = $derived.by(() => {
		let offset = 0;
		return positiveSegments.map((segment, index) => {
			const start = Math.min(offset, scaleMax);
			offset += segment.value;
			const end = Math.min(offset, scaleMax);
			return {
				...segment,
				key: `${segment.label}-${index}`,
				width: percentForValue(end - start),
				className: chartClasses[index % chartClasses.length]
			};
		});
	});

	const renderedThresholds = $derived(
		thresholds.map((threshold, index) => ({
			key: `${threshold}-${index}`,
			position: percentForValue(threshold)
		}))
	);
</script>

<div class={twMerge('stack-tight', wrapperClass)}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div id={id} class="relative h-4 overflow-hidden border border-border bg-muted">
		<div class="flex h-full w-full">
			{#each renderedSegments as segment (segment.key)}
				{#if segment.width > 0}
					<div
						class={twMerge('h-full shrink-0', segment.color ? '' : segment.className)}
						style:width={`${segment.width}%`}
						style:background={segment.color}
						aria-hidden="true"
					></div>
				{/if}
			{/each}
		</div>
		{#each renderedThresholds as threshold (threshold.key)}
			<div
				class="absolute inset-y-0 w-px -translate-x-1/2 bg-foreground"
				style:left={`${threshold.position}%`}
				aria-hidden="true"
			></div>
		{/each}
	</div>
	<div class="flex flex-wrap gap-x-2 gap-y-1">
		{#each renderedSegments as segment (segment.key)}
			<div class="flex items-center gap-1">
				<span
					class={twMerge(
						'h-2.5 w-2.5 shrink-0 border border-border-strong',
						segment.color ? '' : segment.className
					)}
					style:background={segment.color}
					aria-hidden="true"
				></span>
				<span class="text-muted-foreground type-body">{segment.label}</span>
				<span class="type-value">{formatValue(segment.value)}</span>
			</div>
		{/each}
	</div>
</div>
