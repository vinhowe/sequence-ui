<script lang="ts">
	import { onDestroy } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	import FormLabel from './FormLabel.svelte';

	type $$Props = {
		value: number;
		label?: string;
		id: string;
		class?: string;
	};

	let {
		value = $bindable(0),
		label,
		id,
		class: wrapperClass = ''
	}: $$Props = $props();

	let ringRef: HTMLButtonElement | null = $state(null);
	let inputValue = $state('');
	let isFocused = $state(false);
	let isDragging = $state(false);
	let activePointerId: number | null = null;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let lastPointerAngle = 0;
	let dragAngle = 0;

	const DRAG_THRESHOLD = 3;
	const SVG_CENTER = 12;
	const INDICATOR_RADIUS = 8;

	const normalizedAngle = $derived(((value % 360) + 360) % 360);
	const indicatorX = $derived(
		SVG_CENTER + Math.cos((normalizedAngle * Math.PI) / 180) * INDICATOR_RADIUS
	);
	const indicatorY = $derived(
		SVG_CENTER + Math.sin((normalizedAngle * Math.PI) / 180) * INDICATOR_RADIUS
	);

	function formatAngle(nextValue: number) {
		const revolutions = Math.floor(nextValue / 360);
		const degrees = ((nextValue % 360) + 360) % 360;
		return `${revolutions}x +${degrees.toFixed(1).padStart(5, '0')} deg`;
	}

	function parseAngle(text: string) {
		const revolved = text.match(/^\s*([+-]?\d+)\s*x\s*([+-]?)\s*(\d+(?:\.\d+)?)\s*(?:deg)?\s*$/i);
		if (revolved) {
			const revolutions = Number.parseInt(revolved[1], 10);
			const sign = revolved[2] === '-' ? -1 : 1;
			const degrees = Number.parseFloat(revolved[3]) * sign;
			return revolutions * 360 + degrees;
		}

		const plain = text.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*(?:deg)?\s*$/i);
		if (plain) return Number.parseFloat(plain[1]);
		return null;
	}

	function angleFromPointer(event: PointerEvent) {
		const rect = ringRef?.getBoundingClientRect();
		if (!rect) return 0;
		const x = event.clientX - (rect.left + rect.width / 2);
		const y = event.clientY - (rect.top + rect.height / 2);
		return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
	}

	function nearestUnwrappedAngle(rawAngle: number, reference: number) {
		let candidate = Math.floor(reference / 360) * 360 + rawAngle;
		while (candidate - reference > 180) candidate -= 360;
		while (candidate - reference < -180) candidate += 360;
		return candidate;
	}

	function applySnap(nextValue: number, event: PointerEvent) {
		const snap = event.shiftKey ? 45 : event.altKey ? 15 : 0;
		return snap > 0 ? Math.round(nextValue / snap) * snap : Number(nextValue.toFixed(1));
	}

	function commitText() {
		const parsed = parseAngle(inputValue);
		if (parsed === null || Number.isNaN(parsed)) {
			inputValue = formatAngle(value);
			return;
		}

		value = Number(parsed.toFixed(1));
		inputValue = formatAngle(value);
	}

	$effect(() => {
		if (!isFocused && !isDragging) inputValue = formatAngle(value);
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
		const deltaY = event.clientY - pointerStartY;
		if (!isDragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

		event.preventDefault();
		const rawAngle = angleFromPointer(event);
		if (!isDragging) {
			isDragging = true;
			document.body.style.userSelect = 'none';
			dragAngle = nearestUnwrappedAngle(rawAngle, value);
		} else {
			let delta = rawAngle - lastPointerAngle;
			if (delta > 180) delta -= 360;
			if (delta < -180) delta += 360;
			dragAngle += delta;
		}

		lastPointerAngle = rawAngle;
		value = applySnap(dragAngle, event);
	}

	function onDocumentPointerUp(event: PointerEvent) {
		if (activePointerId !== null && event.pointerId !== activePointerId) return;
		isDragging = false;
		removeDocumentListeners();
	}

	function onRingPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		ringRef?.focus();
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		lastPointerAngle = angleFromPointer(event);
		dragAngle = value;
		activePointerId = event.pointerId;
		document.addEventListener('pointermove', onDocumentPointerMove, { passive: false });
		document.addEventListener('pointerup', onDocumentPointerUp);
		document.addEventListener('pointercancel', onDocumentPointerUp);
		window.addEventListener('blur', cancelDrag);
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
	<div class="flex items-center gap-1.5">
		<button
			bind:this={ringRef}
			type="button"
			aria-label={label ?? 'Angle'}
			class={twMerge(
				'flex h-7 w-7 cursor-grab items-center justify-center border border-border-strong bg-transparent text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
				isDragging && 'cursor-grabbing bg-muted ring-1 ring-border-strong'
			)}
			onpointerdown={onRingPointerDown}
		>
			<svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
				<circle cx="12" cy="12" r="9" fill="transparent" stroke="currentColor" stroke-width="1" />
				<line
					x1="12"
					y1="12"
					x2={indicatorX}
					y2={indicatorY}
					stroke="currentColor"
					stroke-width="1"
					stroke-linecap="butt"
				/>
				<circle cx="12" cy="12" r="1.5" fill="currentColor" />
			</svg>
		</button>
		<input
			{id}
			type="text"
			inputmode="decimal"
			bind:value={inputValue}
			class="h-7 w-27 border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
			onfocus={() => {
				isFocused = true;
			}}
			onblur={() => {
				isFocused = false;
				commitText();
			}}
			onkeydown={onInputKeydown}
		/>
	</div>
</div>
