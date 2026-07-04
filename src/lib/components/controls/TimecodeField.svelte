<script lang="ts">
	import FormLabel from './FormLabel.svelte';
	import ResetValueButton from './ResetValueButton.svelte';

	type TimecodeFormat = 'HH:MM:SS:FF' | 'MM:SS';
	type SegmentKey = 'HH' | 'MM' | 'SS' | 'FF';

	type $$Props = {
		value: number;
		fps?: number;
		format?: TimecodeFormat;
		id: string;
		label?: string;
		class?: string;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		value = $bindable(0),
		fps = 30,
		format = 'HH:MM:SS:FF',
		id,
		label,
		class: wrapperClass = '',
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();

	const segmentRefs: HTMLInputElement[] = [];

	let focusedIndex = $state<number | null>(null);
	let editValues = $state<Record<SegmentKey, string>>({
		HH: '00',
		MM: '00',
		SS: '00',
		FF: '00'
	});

	const safeFps = $derived(Math.max(1, Math.floor(fps)));
	const segments = $derived<SegmentKey[]>(format === 'MM:SS' ? ['MM', 'SS'] : ['HH', 'MM', 'SS', 'FF']);

	function padSegment(num: number): string {
		return String(Math.max(0, Math.floor(num))).padStart(2, '0');
	}

	function decompose(totalFrames: number) {
		const frames = Math.max(0, Math.round(totalFrames));
		const ff = frames % safeFps;
		const totalSeconds = Math.floor(frames / safeFps);
		const hh = Math.floor(totalSeconds / 3600);
		const mm = Math.floor(totalSeconds / 60) % 60;
		const ss = totalSeconds % 60;

		return { HH: hh, MM: mm, SS: ss, FF: ff };
	}

	function syncEditValues() {
		const parts = decompose(value);
		editValues = {
			HH: padSegment(parts.HH),
			MM: padSegment(parts.MM),
			SS: padSegment(parts.SS),
			FF: padSegment(parts.FF)
		};
	}

	$effect(() => {
		if (focusedIndex === null) {
			syncEditValues();
		}
	});

	function segmentLimit(segment: SegmentKey): number {
		if (segment === 'FF') return safeFps - 1;
		if (segment === 'SS' || segment === 'MM') return 59;
		return Number.POSITIVE_INFINITY;
	}

	function readSegment(segment: SegmentKey): number {
		const parsed = Number.parseInt(editValues[segment], 10);
		if (Number.isNaN(parsed)) return 0;
		return Math.max(0, Math.min(segmentLimit(segment), parsed));
	}

	function composeFromEdits(): number {
		if (format === 'MM:SS') {
			return (readSegment('MM') * 60 + readSegment('SS')) * safeFps;
		}

		return (
			((readSegment('HH') * 60 + readSegment('MM')) * 60 + readSegment('SS')) * safeFps +
			readSegment('FF')
		);
	}

	function setSegmentText(segment: SegmentKey, text: string) {
		editValues = { ...editValues, [segment]: text };
		value = composeFromEdits();
	}

	function updateFocusedSegment(index: number, delta: number) {
		const segment = segments[index];
		if (!segment) return;

		const unit =
			segment === 'HH'
				? 3600 * safeFps
				: segment === 'MM'
					? 60 * safeFps
					: segment === 'SS'
						? safeFps
						: 1;

		value = Math.max(0, Math.round(value) + delta * unit);
		syncEditValues();
		queueMicrotask(() => segmentRefs[index]?.select());
	}

	function focusSegment(index: number) {
		const next = segmentRefs[index];
		if (!next) return;
		next.focus();
		next.select();
	}

	function onSegmentInput(event: Event, segment: SegmentKey, index: number) {
		const input = event.currentTarget as HTMLInputElement;
		const next = input.value.replace(/\D/g, '').slice(0, 2);
		input.value = next;
		setSegmentText(segment, next);

		if (next.length === 2 && index < segments.length - 1) {
			focusSegment(index + 1);
		}
	}

	function onSegmentKeydown(event: KeyboardEvent, index: number) {
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				updateFocusedSegment(index, 1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				updateFocusedSegment(index, -1);
				break;
			case ':':
				event.preventDefault();
				focusSegment(index + 1);
				break;
			case 'Tab':
				if (!event.shiftKey && index < segments.length - 1) {
					event.preventDefault();
					focusSegment(index + 1);
				}
				break;
		}
	}
</script>

<div class={`stack-tight ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel forInputId={`${id}-${segments[0]?.toLowerCase()}`} value={label} />
	{/if}
	<div class="flex items-center gap-1.5">
		<div class="inline-flex items-stretch border border-border bg-card text-foreground">
			{#each segments as segment, index}
				{#if index > 0}
					<span class="flex items-center border-l border-border bg-muted px-0.5 text-muted-foreground type-value">:</span>
				{/if}
				<input
					id={`${id}-${segment.toLowerCase()}`}
					bind:this={segmentRefs[index]}
					type="text"
					inputmode="numeric"
					aria-label={segment}
					value={editValues[segment]}
					class="w-6 border-0 bg-card px-0.5 py-0.5 text-center text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
					onfocus={(event) => {
						focusedIndex = index;
						(event.currentTarget as HTMLInputElement).select();
					}}
					onblur={() => {
						focusedIndex = null;
						syncEditValues();
					}}
					oninput={(event) => onSegmentInput(event, segment, index)}
					onkeydown={(event) => onSegmentKeydown(event, index)}
				/>
			{/each}
		</div>
		{#if onReset}
			<ResetValueButton {hasDefaultValue} {onReset} />
		{/if}
	</div>
</div>
