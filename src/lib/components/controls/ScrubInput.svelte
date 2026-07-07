<script lang="ts">
	import { onDestroy } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	import FormLabel from './FormLabel.svelte';
	import ResetValueButton from './ResetValueButton.svelte';

	type $$Props = {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		precision?: number;
		label?: string;
		unit?: string;
		id: string;
		class?: string;
		/** Classes for the bordered field itself — the right place for a content
		    width (`fieldClass="w-24"`). Widths on `class` squeeze the LABEL too. */
		fieldClass?: string;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		value = $bindable(0),
		min = undefined,
		max = undefined,
		step = 1,
		precision = undefined,
		label,
		unit,
		id,
		class: wrapperClass = '',
		fieldClass = '',
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();

	let inputRef: HTMLInputElement | null = $state(null);
	let inputValue = $state('');
	let isFocused = $state(false);
	let isScrubbing = $state(false);
	let pointerStartX = 0;
	let pointerStartValue = 0;
	let activePointerId: number | null = null;

	const DRAG_THRESHOLD = 3;

	function clamp(nextValue: number) {
		let out = nextValue;
		if (min !== undefined) out = Math.max(min, out);
		if (max !== undefined) out = Math.min(max, out);
		return out;
	}

	function decimalsForStep(nextStep: number) {
		if (precision !== undefined) return Math.max(0, precision);
		if (!Number.isFinite(nextStep) || nextStep <= 0) return 0;
		const asString = String(nextStep);
		if (asString.includes('e-')) return Number(asString.split('e-')[1]);
		return asString.includes('.') ? asString.split('.')[1].length : 0;
	}

	function normalize(nextValue: number, nextStep = step) {
		const clamped = clamp(nextValue);
		const decimals = decimalsForStep(nextStep);
		return Number(clamped.toFixed(Math.min(decimals + 2, 12)));
	}

	function formatValue(nextValue: number) {
		if (precision !== undefined) return nextValue.toFixed(Math.max(0, precision));
		const decimals = decimalsForStep(step);
		return decimals > 0 ? nextValue.toFixed(decimals) : String(Math.round(nextValue));
	}

	function effectiveStep(event: PointerEvent | KeyboardEvent) {
		let nextStep = step > 0 ? step : 1;
		if (event.shiftKey) nextStep *= 10;
		if (event.altKey) nextStep /= 10;
		return nextStep;
	}

	function commitText() {
		const parsed = Number.parseFloat(inputValue);
		if (Number.isNaN(parsed)) {
			inputValue = formatValue(value);
			return;
		}
		value = normalize(parsed);
		inputValue = formatValue(value);
	}

	$effect(() => {
		if (!isFocused && !isScrubbing) {
			inputValue = formatValue(value);
		}
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
		}

		const nextStep = effectiveStep(event);
		value = normalize(pointerStartValue + deltaX * nextStep, nextStep);
		// Live feedback is the whole point of scrubbing: mirror the value into the
		// text while dragging. (The sync $effect skips during scrub/focus, and blur
		// commits whatever text is showing — leaving this stale both froze the
		// display mid-drag AND could clobber the dragged value on blur.)
		inputValue = formatValue(value);
	}

	function onDocumentPointerUp(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		const shouldFocus = !isScrubbing;
		isScrubbing = false;
		removeDocumentListeners();

		if (shouldFocus) {
			inputRef?.focus();
			inputRef?.select();
		}
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		pointerStartX = event.clientX;
		pointerStartValue = value;
		activePointerId = event.pointerId;
		document.addEventListener('pointermove', onDocumentPointerMove, { passive: false });
		document.addEventListener('pointerup', onDocumentPointerUp);
		document.addEventListener('pointercancel', onDocumentPointerUp);
		window.addEventListener('blur', cancelDrag);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			(event.currentTarget as HTMLInputElement).blur();
			return;
		}

		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			const direction = event.key === 'ArrowUp' ? 1 : -1;
			const nextStep = effectiveStep(event);
			value = normalize(value + direction * nextStep, nextStep);
			inputValue = formatValue(value);
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
	<div class="flex items-center gap-1.5">
		<div class={`flex ${fieldClass}`.trim()}>
			<input
				bind:this={inputRef}
				{id}
				type="text"
				inputmode="decimal"
				bind:value={inputValue}
				class={twMerge(
					'block h-control w-full cursor-ew-resize touch-none border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value',
					isScrubbing && 'bg-muted ring-1 ring-border-strong'
				)}
				onpointerdown={onPointerDown}
				onfocus={() => {
					isFocused = true;
				}}
				onblur={() => {
					isFocused = false;
					commitText();
				}}
				onkeydown={onKeydown}
			/>
			{#if unit}
				<span
					class="inline-flex items-center border border-l-0 border-border bg-muted px-3 text-subtle-foreground type-value"
				>
					{unit}
				</span>
			{/if}
		</div>
		{#if onReset}
			<div class="translate-y-0.5">
				<ResetValueButton {hasDefaultValue} {onReset} />
			</div>
		{/if}
	</div>
</div>
