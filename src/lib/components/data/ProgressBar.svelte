<script lang="ts">
	type ProgressColor = 'primary' | 'success' | 'warning' | 'destructive';
	type ProgressSize = 'sm' | 'md' | 'lg';

	type Props = {
		/** Current value in `max` units. Pass `null`/omit for an indeterminate bar. */
		value?: number | null;
		max?: number;
		/** Optional secondary progress (e.g. buffered ahead of `value`), rendered as a faint fill. */
		buffer?: number;
		label?: string;
		/** Show a numeric readout (defaults to a percentage) on the right of the label row. */
		showValue?: boolean;
		color?: ProgressColor;
		size?: ProgressSize;
		id?: string;
		class?: string;
		/** Custom readout formatter, e.g. (v, max) => `${v}/${max}`. */
		valueFormat?: (value: number, max: number) => string;
	};

	let {
		value = null,
		max = 100,
		buffer,
		label,
		showValue = false,
		color = 'primary',
		size = 'md',
		id,
		class: className = '',
		valueFormat
	}: Props = $props();

	const FILL: Record<ProgressColor, string> = {
		primary: 'bg-primary',
		success: 'bg-success',
		warning: 'bg-warning',
		destructive: 'bg-destructive'
	};
	const BUFFER: Record<ProgressColor, string> = {
		primary: 'bg-primary/25',
		success: 'bg-success/25',
		warning: 'bg-warning/25',
		destructive: 'bg-destructive/25'
	};
	const SIZE: Record<ProgressSize, string> = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3'
	};

	const indeterminate = $derived(value == null);
	const clamped = $derived(indeterminate ? 0 : Math.min(max, Math.max(0, value as number)));
	const pct = $derived(max > 0 ? (clamped / max) * 100 : 0);
	const bufferPct = $derived(buffer == null ? 0 : Math.min(100, Math.max(0, (buffer / max) * 100)));
	const readout = $derived(
		indeterminate ? '' : valueFormat ? valueFormat(clamped, max) : `${Math.round(pct)}%`
	);
</script>

<div class={`stack-tight ${className}`.trim()}>
	{#if label || showValue}
		<div class="flex items-baseline justify-between gap-2">
			{#if label}<span class="type-caption text-muted-foreground">{label}</span>{/if}
			{#if showValue && !indeterminate}
				<span class="ml-auto type-value text-muted-foreground">{readout}</span>
			{/if}
		</div>
	{/if}

	<div
		{id}
		class={`relative w-full overflow-hidden border border-border bg-muted ${SIZE[size]}`}
		role="progressbar"
		aria-label={label}
		aria-valuemin={0}
		aria-valuemax={max}
		aria-valuenow={indeterminate ? undefined : clamped}
	>
		{#if !indeterminate && buffer != null}
			<div class={`absolute inset-y-0 left-0 ${BUFFER[color]}`} style={`width:${bufferPct}%`}></div>
		{/if}
		{#if indeterminate}
			<div class={`sui-progress-indeterminate absolute inset-y-0 ${FILL[color]}`}></div>
		{:else}
			<div
				class={`absolute inset-y-0 left-0 ${FILL[color]} transition-[width] duration-300 ease-out`}
				style={`width:${pct}%`}
			></div>
		{/if}
	</div>
</div>

<style>
	.sui-progress-indeterminate {
		width: 30%;
		animation: sui-progress-slide 1.15s ease-in-out infinite;
	}

	@keyframes sui-progress-slide {
		0% {
			transform: translateX(-110%);
		}
		100% {
			transform: translateX(370%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sui-progress-indeterminate {
			animation: none;
			width: 100%;
			opacity: 0.4;
		}
	}
</style>
