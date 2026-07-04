<script lang="ts">
	import { onDestroy } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	import FormLabel from './FormLabel.svelte';

	type $$Props = {
		value: number;
		min: number;
		max: number;
		step?: number;
		label?: string;
		unit?: string;
		warnAt?: number;
		critAt?: number;
		id: string;
		class?: string;
	};

	let {
		value = $bindable(0),
		min,
		max,
		step = 1,
		label,
		unit,
		warnAt = undefined,
		critAt = undefined,
		id,
		class: wrapperClass = ''
	}: $$Props = $props();

	let trackRef: HTMLDivElement | null = $state(null);
	let markerRef: HTMLDivElement | null = $state(null);
	let inputValue = $state('');
	let isFocused = $state(false);
	let isDragging = $state(false);
	let activePointerId: number | null = null;
	let pointerStartX = 0;

	const DRAG_THRESHOLD = 3;

	const range = $derived(Math.max(max - min, 0));
	const markerPosition = $derived(range > 0 ? ((clamp(value) - min) / range) * 100 : 0);
	const warnPosition = $derived(warnAt === undefined ? null : thresholdPosition(warnAt));
	const critPosition = $derived(critAt === undefined ? null : thresholdPosition(critAt));

	function clamp(nextValue: number) {
		return Math.max(min, Math.min(max, nextValue));
	}

	function thresholdPosition(threshold: number) {
		if (range <= 0) return 0;
		return Math.max(0, Math.min(100, ((threshold - min) / range) * 100));
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

	function formatValue(nextValue: number) {
		const decimals = decimalsForStep(step);
		return decimals > 0 ? nextValue.toFixed(decimals) : String(Math.round(nextValue));
	}

	function valueFromClientX(clientX: number, nextStep = step) {
		const rect = trackRef?.getBoundingClientRect();
		if (!rect || rect.width <= 0) return value;
		const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return snap(min + fraction * range, nextStep);
	}

	function commitText() {
		const parsed = Number.parseFloat(inputValue);
		if (Number.isNaN(parsed)) {
			inputValue = formatValue(value);
			return;
		}

		value = snap(parsed);
		inputValue = formatValue(value);
	}

	$effect(() => {
		if (!isFocused && !isDragging) inputValue = formatValue(value);
	});

	function removeDocumentListeners() {
		if (typeof document === 'undefined') return;
		document.removeEventListener('pointermove', onDocumentPointerMove);
		document.removeEventListener('pointerup', onDocumentPointerUp);
		document.removeEventListener('pointercancel', onDocumentPointerUp);
		window.removeEventListener('blur', cancelDrag);
		document.body.style.userSelect = '';
		activePointerId = null;
	}

	function cancelDrag() {
		isDragging = false;
		removeDocumentListeners();
	}

	function onDocumentPointerMove(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;

		const deltaX = event.clientX - pointerStartX;
		if (!isDragging && Math.abs(deltaX) < DRAG_THRESHOLD) return;

		event.preventDefault();
		if (!isDragging) {
			isDragging = true;
			document.body.style.userSelect = 'none';
		}

		value = valueFromClientX(event.clientX, effectiveStep(event));
	}

	function onDocumentPointerUp(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		isDragging = false;
		removeDocumentListeners();
	}

	function startPointerDrag(event: PointerEvent, setOnPress: boolean) {
		if (event.button !== 0) return;
		event.preventDefault();
		pointerStartX = event.clientX;
		activePointerId = event.pointerId;
		markerRef?.focus();
		if (setOnPress) value = valueFromClientX(event.clientX, effectiveStep(event));
		document.addEventListener('pointermove', onDocumentPointerMove, { passive: false });
		document.addEventListener('pointerup', onDocumentPointerUp);
		document.addEventListener('pointercancel', onDocumentPointerUp);
		window.addEventListener('blur', cancelDrag);
	}

	function onMarkerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			const direction = event.key === 'ArrowRight' ? 1 : -1;
			value = snap(value + direction * effectiveStep(event), effectiveStep(event));
		} else if (event.key === 'Home') {
			event.preventDefault();
			value = min;
		} else if (event.key === 'End') {
			event.preventDefault();
			value = max;
		}
	}

	function onInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			(event.currentTarget as HTMLInputElement).blur();
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
	<div class="flex items-center gap-2">
		<div
			bind:this={trackRef}
			role="presentation"
			class={twMerge(
				'relative h-5 flex-1 cursor-pointer touch-none border border-border bg-muted',
				isDragging && 'ring-1 ring-border-strong'
			)}
			onpointerdown={(event) => startPointerDrag(event, true)}
		>
			{#if warnPosition !== null}
				<div class="absolute inset-y-0 right-0 bg-warning/15" style:left={`${warnPosition}%`}></div>
			{/if}
			{#if critPosition !== null}
				<div class="absolute inset-y-0 right-0 bg-destructive/20" style:left={`${critPosition}%`}></div>
			{/if}
			<div
				bind:this={markerRef}
				id={`${id}-marker`}
				role="slider"
				tabindex="0"
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={value}
				class={twMerge(
					'absolute top-0 h-full w-0.5 -translate-x-1/2 cursor-ew-resize bg-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
					isDragging && 'ring-1 ring-border-strong'
				)}
				style:left={`${markerPosition}%`}
				onpointerdown={(event) => {
					event.stopPropagation();
					startPointerDrag(event, false);
				}}
				onkeydown={onMarkerKeydown}
			></div>
		</div>
		<div class="flex items-stretch">
			<input
				{id}
				type="text"
				inputmode="decimal"
				bind:value={inputValue}
				class="w-16 border border-border bg-card px-1.5 py-0.5 text-right text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
				onfocus={() => {
					isFocused = true;
				}}
				onblur={() => {
					isFocused = false;
					commitText();
				}}
				onkeydown={onInputKeydown}
			/>
			{#if unit}
				<span
					class="inline-flex items-center border border-l-0 border-border bg-muted px-1.5 text-subtle-foreground type-value"
				>
					{unit}
				</span>
			{/if}
		</div>
	</div>
</div>
