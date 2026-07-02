<script lang="ts">
	import { onDestroy } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	import FormLabel from '../controls/FormLabel.svelte';

	type DragMode = 'left' | 'right' | 'body' | 'create';

	type $$Props = {
		start?: number;
		end?: number;
		min: number;
		max: number;
		step?: number;
		data?: number[];
		label?: string;
		id: string;
		class?: string;
	};

	let {
		start = $bindable(0),
		end = $bindable(0),
		min,
		max,
		step = 1,
		data = [],
		label,
		id,
		class: wrapperClass = ''
	}: $$Props = $props();

	let trackRef: HTMLDivElement | null = $state(null);
	let leftHandleRef: HTMLDivElement | null = $state(null);
	let rightHandleRef: HTMLDivElement | null = $state(null);
	let isScrubbing = $state(false);
	let dragMode: DragMode | null = $state(null);
	let activePointerId: number | null = null;
	let pointerStartX = 0;
	let pointerStartValue = 0;
	let dragStart = 0;
	let dragEnd = 0;
	let createAnchor = 0;

	const DRAG_THRESHOLD = 3;

	const range = $derived(Math.max(max - min, 0));
	const normalizedStart = $derived(clamp(Math.min(start, end)));
	const normalizedEnd = $derived(clamp(Math.max(start, end)));
	const startPosition = $derived(positionForValue(normalizedStart));
	const endPosition = $derived(positionForValue(normalizedEnd));
	const selectionWidth = $derived(Math.max(0, endPosition - startPosition));
	const dataMax = $derived(Math.max(...data.map((value) => Math.max(0, value)), 0));
	const bars = $derived(
		data.map((value, index) => ({
			key: `${index}-${value}`,
			height: dataMax > 0 ? Math.max(4, (Math.max(0, value) / dataMax) * 100) : 0
		}))
	);

	function clamp(nextValue: number) {
		return Math.max(min, Math.min(max, nextValue));
	}

	function decimalsForStep(nextStep: number) {
		if (!Number.isFinite(nextStep) || nextStep <= 0) return 0;
		const asString = String(nextStep);
		if (asString.includes('e-')) return Number(asString.split('e-')[1]);
		return asString.includes('.') ? asString.split('.')[1].length : 0;
	}

	function effectiveStep(event: PointerEvent | KeyboardEvent) {
		let nextStep = step > 0 ? step : 1;
		if (event.shiftKey) nextStep *= 10;
		if (event.altKey) nextStep /= 10;
		return nextStep;
	}

	function snap(nextValue: number, nextStep = step) {
		const currentStep = nextStep > 0 ? nextStep : 1;
		const snapped = min + Math.round((nextValue - min) / currentStep) * currentStep;
		return Number(clamp(snapped).toFixed(Math.min(decimalsForStep(currentStep) + 2, 12)));
	}

	function snapDelta(delta: number, nextStep = step) {
		const currentStep = nextStep > 0 ? nextStep : 1;
		return Number(
			(Math.round(delta / currentStep) * currentStep).toFixed(
				Math.min(decimalsForStep(currentStep) + 2, 12)
			)
		);
	}

	function positionForValue(value: number) {
		if (range <= 0) return 0;
		return Math.max(0, Math.min(100, ((value - min) / range) * 100));
	}

	function valueFromClientX(clientX: number, nextStep = step) {
		const rect = trackRef?.getBoundingClientRect();
		if (!rect || rect.width <= 0 || range <= 0) return min;
		const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return snap(min + fraction * range, nextStep);
	}

	function rawValueFromClientX(clientX: number) {
		const rect = trackRef?.getBoundingClientRect();
		if (!rect || rect.width <= 0 || range <= 0) return min;
		const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return clamp(min + fraction * range);
	}

	function formatValue(nextValue: number) {
		const decimals = decimalsForStep(step);
		return decimals > 0 ? nextValue.toFixed(decimals) : String(Math.round(nextValue));
	}

	function commitRange(nextStart: number, nextEnd: number) {
		start = clamp(Math.min(nextStart, nextEnd));
		end = clamp(Math.max(nextStart, nextEnd));
	}

	function moveSelection(clientX: number, nextStep: number) {
		const width = dragEnd - dragStart;
		const delta = snapDelta(rawValueFromClientX(clientX) - pointerStartValue, nextStep);
		let nextStart = dragStart + delta;
		if (nextStart < min) nextStart = min;
		if (nextStart + width > max) nextStart = max - width;
		commitRange(nextStart, nextStart + width);
	}

	function resizeSelection(mode: 'left' | 'right', clientX: number, nextStep: number) {
		const nextValue = valueFromClientX(clientX, nextStep);
		if (mode === 'left') commitRange(nextValue, dragEnd);
		else commitRange(dragStart, nextValue);
	}

	function createSelection(clientX: number, nextStep: number) {
		const nextValue = valueFromClientX(clientX, nextStep);
		commitRange(createAnchor, nextValue);
	}

	function removeDocumentListeners() {
		if (typeof document === 'undefined') return;
		document.removeEventListener('pointermove', onDocumentPointerMove);
		document.removeEventListener('pointerup', onDocumentPointerUp);
		document.removeEventListener('pointercancel', onDocumentPointerUp);
		window.removeEventListener('blur', cancelDrag);
		document.body.style.userSelect = '';
		document.body.classList.remove('cursor-grabbing');
		activePointerId = null;
		dragMode = null;
	}

	function cancelDrag() {
		isScrubbing = false;
		removeDocumentListeners();
	}

	function onDocumentPointerMove(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		const deltaX = event.clientX - pointerStartX;
		if (!isScrubbing && Math.abs(deltaX) < DRAG_THRESHOLD) return;

		event.preventDefault();
		if (!isScrubbing) {
			isScrubbing = true;
			document.body.style.userSelect = 'none';
			document.body.classList.add('cursor-grabbing');
		}

		const nextStep = effectiveStep(event);
		if (dragMode === 'body') moveSelection(event.clientX, nextStep);
		else if (dragMode === 'left' || dragMode === 'right') {
			resizeSelection(dragMode, event.clientX, nextStep);
		} else if (dragMode === 'create') createSelection(event.clientX, nextStep);
	}

	function onDocumentPointerUp(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		isScrubbing = false;
		removeDocumentListeners();
	}

	function startPointerDrag(event: PointerEvent, mode: DragMode) {
		if (event.button !== 0) return;
		event.preventDefault();
		pointerStartX = event.clientX;
		pointerStartValue = rawValueFromClientX(event.clientX);
		dragStart = normalizedStart;
		dragEnd = normalizedEnd;
		dragMode = mode;
		activePointerId = event.pointerId;

		if (mode === 'left') leftHandleRef?.focus();
		if (mode === 'right') rightHandleRef?.focus();
		if (mode === 'create') {
			createAnchor = valueFromClientX(event.clientX, effectiveStep(event));
			commitRange(createAnchor, createAnchor);
		}

		document.addEventListener('pointermove', onDocumentPointerMove, { passive: false });
		document.addEventListener('pointerup', onDocumentPointerUp);
		document.addEventListener('pointercancel', onDocumentPointerUp);
		window.addEventListener('blur', cancelDrag);
	}

	function onHandleKeydown(event: KeyboardEvent, side: 'left' | 'right') {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			const direction = event.key === 'ArrowRight' ? 1 : -1;
			const nextValue =
				side === 'left'
					? snap(normalizedStart + direction * effectiveStep(event), effectiveStep(event))
					: snap(normalizedEnd + direction * effectiveStep(event), effectiveStep(event));
			if (side === 'left') commitRange(Math.min(nextValue, normalizedEnd), normalizedEnd);
			else commitRange(normalizedStart, Math.max(nextValue, normalizedStart));
		}
	}

	onDestroy(() => {
		removeDocumentListeners();
	});
</script>

<div class={twMerge('stack-tight', wrapperClass)}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
		<div
			bind:this={trackRef}
			id={id}
			role="group"
			aria-label={label ?? 'Time brush'}
			class={twMerge(
				'relative h-10 touch-none overflow-hidden border border-border bg-muted',
				isScrubbing && 'ring-1 ring-border-strong'
		)}
		onpointerdown={(event) => startPointerDrag(event, 'create')}
	>
		<div class="absolute inset-0 flex items-end gap-px px-0.5 py-0.5" aria-hidden="true">
			{#each bars as bar (bar.key)}
				<div
					class="min-w-px flex-1 bg-muted-foreground/40"
					style:height={`${bar.height}%`}
				></div>
			{/each}
		</div>
		<button
			type="button"
			tabindex="-1"
			aria-label={`${label ?? 'Time brush'} selection`}
			class={twMerge(
				'absolute inset-y-0 cursor-grab appearance-none border-0 bg-primary/15 p-0 active:cursor-grabbing',
				isScrubbing && dragMode === 'body' && 'cursor-grabbing'
			)}
			style:left={`${startPosition}%`}
			style:width={`${selectionWidth}%`}
			onpointerdown={(event) => {
				event.stopPropagation();
				startPointerDrag(event, 'body');
			}}
		></button>
		<div
			bind:this={leftHandleRef}
			role="slider"
			tabindex="0"
			aria-label={`${label ?? 'Time brush'} start`}
			aria-valuemin={min}
			aria-valuemax={normalizedEnd}
			aria-valuenow={normalizedStart}
			class="absolute inset-y-0 w-1 -translate-x-1/2 cursor-ew-resize bg-primary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			style:left={`${startPosition}%`}
			onpointerdown={(event) => {
				event.stopPropagation();
				startPointerDrag(event, 'left');
			}}
			onkeydown={(event) => onHandleKeydown(event, 'left')}
		></div>
		<div
			bind:this={rightHandleRef}
			role="slider"
			tabindex="0"
			aria-label={`${label ?? 'Time brush'} end`}
			aria-valuemin={normalizedStart}
			aria-valuemax={max}
			aria-valuenow={normalizedEnd}
			class="absolute inset-y-0 w-1 -translate-x-1/2 cursor-ew-resize bg-primary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			style:left={`${endPosition}%`}
			onpointerdown={(event) => {
				event.stopPropagation();
				startPointerDrag(event, 'right');
			}}
			onkeydown={(event) => onHandleKeydown(event, 'right')}
		></div>
	</div>
	<div class="type-value">
		{formatValue(normalizedStart)} - {formatValue(normalizedEnd)}
	</div>
</div>

<style>
	.cursor-grabbing {
		cursor: grabbing !important;
	}
</style>
