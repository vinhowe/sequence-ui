<script lang="ts">
	import { onMount } from "svelte";

	import FormLabel from "./FormLabel.svelte";
	import ResetValueButton from "./ResetValueButton.svelte";

	let {
		min,
		max,
		useLog = false,
		base = 10,
		showTicks = true,
		tickCount = 10,
		step = 0.01,
		debounceMs = 120,
		label = "",
		id,
		value = $bindable(10),
		unit,
		tickFormatter,
		hasDefaultValue = false,
		onReset = undefined,
		class: className,
	}: {
		min: number;
		max: number;
		useLog?: boolean;
		base?: number;
		showTicks?: boolean;
		tickCount?: number;
		step?: number;
		debounceMs?: number;
		label?: string;
		id: string;
		value?: number;
		unit?: string;
		tickFormatter?: (value: number) => string;
		hasDefaultValue?: boolean;
		onReset?: () => void;
		class?: string;
	} = $props();

	let sliderPosition = $state(0);
	let isDragging = $state(false);
	let trackRef: HTMLDivElement | null = $state(null);
	let thumbRef: HTMLDivElement | null = $state(null);
	let inputValueString = $state("");
	let isInputFocused = $state(false);
	let lastValidNumericValue = $state(value);
	let displayValue = $state(value);
	let commitTimeout: number | null = $state(null);

	const EPSILON = 1e-8;
	const EXPONENTIAL_PRECISION = 2;

	const clamp = (v: number, lo: number, hi: number) =>
		Math.max(lo, Math.min(hi, v));
	const clampToRange = (v: number) => clamp(v, min, max);

	// Effective log base — falls back to natural log for degenerate bases.
	const logBase = $derived(base > 1 ? base : Math.E);
	const logOf = (val: number) => Math.log(val) / Math.log(logBase);

	// ── Single source of truth for value <-> track-fraction (0..1) mapping ──
	function valueToFraction(v: number): number {
		if (useLog) {
			const lo = Math.max(EPSILON, min);
			if (max <= 0 || lo <= 0) return 0;
			const minL = logOf(lo);
			const maxL = logOf(max);
			if (maxL <= minL) return 0;
			return (logOf(Math.max(lo, v)) - minL) / (maxL - minL);
		}
		const range = max - min;
		return range > 0 ? (v - min) / range : 0;
	}

	function fractionToValue(fraction: number): number {
		const f = clamp(fraction, 0, 1);
		if (useLog) {
			const lo = Math.max(EPSILON, min);
			if (max <= 0 || lo <= 0) return lo;
			const minL = logOf(lo);
			const maxL = logOf(max);
			if (maxL <= minL) return lo;
			return Math.pow(logBase, minL + f * (maxL - minL));
		}
		const range = max - min;
		return range > 0 ? min + f * range : min;
	}

	// Format exponential notation without trailing zeros in the mantissa.
	function formatExponential(num: number, precision?: number): string {
		const [mantissaRaw, exp] = (
			precision === undefined
				? num.toExponential()
				: num.toExponential(precision)
		).split("e");
		if (exp === undefined) return mantissaRaw;
		const mantissa = mantissaRaw.includes(".")
			? mantissaRaw.replace(/0+$/, "").replace(/\.$/, "")
			: mantissaRaw;
		return `${mantissa}e${exp}`;
	}

	function getFormattedInputValue(
		currentValue: number,
		isLog: boolean,
		currentStep: number,
		{ shortExponential = true }: { shortExponential?: boolean } = {},
	): string {
		if (isLog) {
			return shortExponential
				? formatExponential(currentValue, EXPONENTIAL_PRECISION)
				: currentValue.toExponential(EXPONENTIAL_PRECISION);
		}
		if (currentStep > 0 && currentStep % 1 === 0) {
			return currentValue.toFixed(0);
		}
		const decimals =
			currentStep > 0 && currentStep < 1
				? Math.ceil(-Math.log10(currentStep))
				: currentValue < 1
					? 3
					: 2;
		return currentValue.toFixed(decimals);
	}

	const formatEndpoint = (v: number) =>
		tickFormatter
			? tickFormatter(v)
			: useLog
				? formatExponential(v, EXPONENTIAL_PRECISION)
				: v.toLocaleString();

	// Track fill position (%) follows the display value.
	$effect(() => {
		sliderPosition = clamp(valueToFraction(displayValue), 0, 1) * 100;
	});

	// Keep the input string and last-valid value in sync while not editing.
	$effect(() => {
		if (!isInputFocused) {
			inputValueString = getFormattedInputValue(displayValue, useLog, step);
		}
		if (Math.abs(displayValue - lastValidNumericValue) > EPSILON / 100) {
			lastValidNumericValue = displayValue;
		}
	});

	// Adopt external value changes when the user isn't interacting.
	$effect(() => {
		if (!isDragging && !isInputFocused) {
			displayValue = value;
		}
	});

	// ── Commit pipeline: live displayValue, debounced write to bindable value ──
	function clearCommitTimeout() {
		if (commitTimeout !== null) {
			clearTimeout(commitTimeout);
			commitTimeout = null;
		}
	}

	function scheduleCommit(nextValue: number) {
		displayValue = nextValue;
		clearCommitTimeout();
		commitTimeout = window.setTimeout(() => {
			value = clampToRange(displayValue);
			commitTimeout = null;
		}, debounceMs);
	}

	function flushCommit() {
		clearCommitTimeout();
		value = clampToRange(displayValue);
	}

	// Shared linear "nice tick" parameters, used for rendering and alt-snapping.
	function computeLinearTickParams() {
		const range = max - min;
		const currentTickCount = Math.max(2, tickCount);
		const unroundedTickSize =
			currentTickCount > 1 ? range / (currentTickCount - 1) : range;
		const exponent = Math.floor(Math.log(unroundedTickSize) / Math.log(base));
		const fraction = unroundedTickSize / Math.pow(base, exponent);

		let localSteps = [1];
		if (base >= 2) localSteps.push(2);
		const halfB = base / 2;
		if (base % 2 === 0 && halfB > (localSteps.at(-1) ?? 0) && halfB < base) {
			localSteps.push(halfB);
		}
		if (base === 10 && 5 > (localSteps.at(-1) ?? 0)) localSteps.push(5);
		if (base > (localSteps.at(-1) ?? 0)) localSteps.push(base);
		localSteps = [...new Set(localSteps)].sort((a, b) => a - b);

		let niceFraction = localSteps[localSteps.length - 1];
		for (let i = localSteps.length - 2; i >= 0; i--) {
			if (fraction < Math.sqrt(localSteps[i] * localSteps[i + 1]))
				niceFraction = localSteps[i];
			else break;
		}

		const niceTickSize = niceFraction * Math.pow(base, exponent);
		const niceMin = Math.floor(min / niceTickSize) * niceTickSize;
		let majorTickGroupingFactor =
			base === 10 ? 5 : base % 2 === 0 && base > 2 ? base / 2 : base;
		if (majorTickGroupingFactor <= 1 && base > 1) majorTickGroupingFactor = base;

		return { niceTickSize, niceMin, majorTickGroupingFactor };
	}

	// Nearest "major" tick to a value, for Alt-drag snapping.
	function getNearestMajorValue(targetValue: number): number {
		if (useLog) {
			const lo = Math.max(EPSILON, min);
			if (max <= 0 || lo <= 0) return clampToRange(targetValue);
			return clampToRange(
				Math.pow(logBase, Math.round(logOf(Math.max(lo, targetValue)))),
			);
		}

		const range = max - min;
		if (range <= 0) return clampToRange(targetValue);
		const { niceTickSize, majorTickGroupingFactor } = computeLinearTickParams();
		const majorSpacing = majorTickGroupingFactor * niceTickSize;
		if (!(majorSpacing > EPSILON)) return clampToRange(targetValue);

		const candidates = [min, max];
		const startN = Math.ceil((min - EPSILON) / majorSpacing);
		const endN = Math.floor((max + EPSILON) / majorSpacing);
		for (let n = startN; n <= endN; n++) candidates.push(n * majorSpacing);

		let best = clampToRange(targetValue);
		let bestDist = Number.POSITIVE_INFINITY;
		for (const c of candidates) {
			const cc = clampToRange(c);
			const d = Math.abs(cc - targetValue);
			if (d < bestDist) {
				bestDist = d;
				best = cc;
			}
		}
		return best;
	}

	function positionToValue(position: number, altSnap = false): number {
		const raw = fractionToValue(position / 100);
		if (altSnap) return getNearestMajorValue(raw);
		if (step > 0) return Math.round(raw / step) * step;
		return Math.round(raw * 100) / 100;
	}

	// ── Number input field ──
	function handleInputChange(e: Event) {
		inputValueString = (e.target as HTMLInputElement).value;
		const parsed = parseFloat(inputValueString);
		if (!isNaN(parsed)) {
			const clamped = clampToRange(parsed);
			displayValue = clamped;
			value = clamped;
			lastValidNumericValue = clamped;
		}
	}

	function handleInputBlur() {
		isInputFocused = false;
		const parsed = parseFloat(inputValueString);
		if (!isNaN(parsed)) {
			displayValue = clampToRange(parsed);
			lastValidNumericValue = displayValue;
		} else {
			displayValue = lastValidNumericValue;
		}
		flushCommit();
		inputValueString = getFormattedInputValue(displayValue, useLog, step);
	}

	function handleInputKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
	}

	function handleThumbKeyDown(e: KeyboardEvent) {
		let stepAmount =
			step > 0 ? step : useLog ? displayValue * 0.05 : (max - min) / 100;
		if (stepAmount === 0 && max > min) stepAmount = (max - min) / 100;
		if (stepAmount === 0) stepAmount = EPSILON;

		if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
			scheduleCommit(clampToRange(displayValue - stepAmount));
		} else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
			scheduleCommit(clampToRange(displayValue + stepAmount));
		} else if (e.key === "Home") {
			scheduleCommit(min);
		} else if (e.key === "End") {
			scheduleCommit(max);
		}
	}

	let inputWidth = $derived(
		`${6 + getFormattedInputValue(max, useLog, step, { shortExponential: false }).length * 8}px`,
	);

	// ── Pointer drag (document-level listeners drive the drag) ──
	onMount(() => {
		const track = trackRef;
		const thumb = thumbRef;

		const positionFromClientX = (clientX: number) => {
			const rect = track!.getBoundingClientRect();
			return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
		};

		function startDrag() {
			isDragging = true;
			document.body.style.userSelect = "none";
			document.body.classList.add("cursor-grabbing");
		}

		function endDrag() {
			if (!isDragging) return;
			isDragging = false;
			document.body.style.userSelect = "";
			document.body.classList.remove("cursor-grabbing");
			flushCommit();
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging || !track) return;
			e.preventDefault(); // prevent scrolling during drag
			scheduleCommit(positionToValue(positionFromClientX(e.clientX), e.altKey));
		}

		function onThumbPointerDown(e: PointerEvent) {
			e.preventDefault();
			e.stopPropagation();
			startDrag();
			thumb?.focus();
		}

		function onTrackPointerDown(e: PointerEvent) {
			if ((e.target as HTMLElement)?.closest('[role="slider"]') || !track)
				return;
			e.preventDefault();
			scheduleCommit(positionToValue(positionFromClientX(e.clientX), e.altKey));
			startDrag();
			thumb?.focus();
		}

		function onVisibilityChange() {
			if (document.visibilityState === "hidden") endDrag();
		}

		thumb?.addEventListener("pointerdown", onThumbPointerDown);
		track?.addEventListener("pointerdown", onTrackPointerDown);
		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", endDrag);
		document.addEventListener("pointercancel", endDrag);
		document.addEventListener("visibilitychange", onVisibilityChange);
		window.addEventListener("blur", endDrag);

		return () => {
			thumb?.removeEventListener("pointerdown", onThumbPointerDown);
			track?.removeEventListener("pointerdown", onTrackPointerDown);
			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("pointerup", endDrag);
			document.removeEventListener("pointercancel", endDrag);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.removeEventListener("blur", endDrag);
			if (isDragging) {
				document.body.style.userSelect = "";
				document.body.classList.remove("cursor-grabbing");
			}
			clearCommitTimeout();
		};
	});

	// ── Tick marks ──
	type Tick = { key: string; class: string; style: string };

	const makeTick = (key: string, isMajor: boolean, position: number): Tick => ({
		key,
		class: `absolute w-px ${isMajor ? "h-2 bg-subtle-foreground" : "h-1 bg-border-strong"} transform -translate-x-1/2`,
		style: `left: ${clamp(position, 0, 100)}%; bottom: ${isMajor ? "-4px" : "-3px"};`,
	});

	const ticks = $derived.by((): Tick[] => {
		if (!showTicks) return [];
		const C_EPSILON = 0.0001;
		const out: Tick[] = [];
		const pos = (v: number) => valueToFraction(v) * 100;

		if (useLog) {
			const lo = Math.max(EPSILON, min);
			if (max <= lo || max <= 0 || lo <= 0) return [];
			const minL = logOf(lo);
			const maxL = logOf(max);
			if (maxL <= minL) return [];

			const orderSpan = maxL - minL;
			// Dense per-decade minors up to ~3 decades; otherwise a uniform grid.
			const useUniformGrid = orderSpan > 3 + EPSILON;

			let power = Math.floor(minL);
			let tickVal = Math.pow(logBase, power);
			while (tickVal <= max * (logBase * 0.9) && power <= maxL + 1) {
				if (tickVal >= lo / (logBase * 0.9)) {
					const p = pos(tickVal);
					if (p >= 0 && p <= 100)
						out.push(makeTick(`major-log-${logBase}-${power.toFixed(2)}`, true, p));
				}

				const nextMajor = Math.pow(logBase, power + 1);
				if (
					!useUniformGrid &&
					orderSpan > 0.5 &&
					nextMajor <= max * logBase &&
					nextMajor > tickVal * 1.1
				) {
					const minors =
						logBase === 10
							? (orderSpan > 4 ? [2, 5] : [2, 3, 4, 5, 6, 7, 8, 9]).map(
									(i) => ({ v: i * tickVal, key: `minor-log10-${power.toFixed(2)}-${i}` }),
								)
							: logBase > 1.5
								? [
										{
											v: Math.pow(logBase, logOf(tickVal) + 0.5),
											key: `minor-log-mid-${power.toFixed(2)}`,
										},
									]
								: [];
					for (const { v, key } of minors) {
						if (v > tickVal && v < nextMajor && v <= max) {
							const p = pos(v);
							if (p >= 0 && p <= 100) out.push(makeTick(key, false, p));
						}
					}
				}

				power++;
				tickVal = Math.pow(logBase, power);
				if (tickVal <= C_EPSILON && power > minL + 5) break;
			}

			const majorCount = out.filter((t) => t.class.includes("h-2")).length;
			if ((useUniformGrid || majorCount < 2) && orderSpan > C_EPSILON) {
				const numTicks = Math.min(Math.max(2, tickCount), 10);
				for (let i = 0; i <= numTicks; i++) {
					const fraction = i / numTicks;
					const tv = Math.pow(logBase, minL + fraction * (maxL - minL));
					const position = fraction * 100;
					const isMajor =
						i === 0 ||
						i === numTicks ||
						(tv > lo &&
							tv < max &&
							Math.abs(logOf(tv) - Math.round(logOf(tv))) < 0.05);
					const duplicate = out.some(
						(t) =>
							Math.abs(
								parseFloat(t.style.match(/left: ([\d.]+)%;/)?.[1] || "-1000") -
									position,
							) < 0.1,
					);
					if (!duplicate)
						out.push(makeTick(`log-small-range-tick-${i}`, isMajor, position));
				}
			}
			return out;
		}

		const range = max - min;
		if (range <= 0) return [];
		const { niceTickSize, niceMin, majorTickGroupingFactor } =
			computeLinearTickParams();

		// Degenerate tick size: just mark the endpoints.
		if (niceTickSize <= C_EPSILON) {
			if (min >= 0 && min <= 100) out.push(makeTick("linear-fallback-min", true, 0));
			if (max >= 0 && max <= 100 && Math.abs(max - min) > C_EPSILON)
				out.push(makeTick("linear-fallback-max", true, 100));
			return out;
		}

		for (
			let tickVal = niceMin;
			tickVal <= max + niceTickSize / 2;
			tickVal += niceTickSize
		) {
			if (tickVal < min - niceTickSize / 10) continue;
			const position = pos(tickVal);
			if (position < -1 || position > 101) continue;

			const isMinTick = Math.abs(tickVal - niceMin) < niceTickSize * 0.01;
			const isMaxCluster = tickVal >= max - niceTickSize * 0.1;
			const groupUnit = majorTickGroupingFactor * niceTickSize;
			const isIntermediateMajor =
				Math.abs(tickVal / groupUnit - Math.round(tickVal / groupUnit)) <
				C_EPSILON;
			const isMajor =
				isMinTick ||
				isMaxCluster ||
				(tickVal > niceMin + niceTickSize * 0.1 &&
					tickVal < max - niceTickSize * 0.1 &&
					isIntermediateMajor);

			out.push(makeTick(`linear-tick-${tickVal.toFixed(5)}`, isMajor, position));
		}
		return out;
	});
</script>

<div class="w-full stack-tight {className}">
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div class="flex w-full gap-x-3 mb-1">
		<div class="flex items-top gap-2 w-full">
			<div class="relative flex-1 flex flex-col gap-0.5 px-0.5">
				<div
					bind:this={trackRef}
					class="relative cursor-pointer py-1 px-0.5 touch-none"
				>
					<!-- Track (inactive/leftover) — border tone, not muted, so it reads as a
					     groove against the panel body (muted ≈ card, near-invisible). -->
					<div class="absolute h-0.5 w-full bg-border"></div>

					<!-- Filled Track -->
					<div
						class="absolute h-0.5 bg-border-strong"
						style:width="{sliderPosition}%"
					></div>

					<!-- Ticks (pointer-events-none so they don't block track clicks) -->
					{#if showTicks && ticks.length > 0}
						<div
							class="absolute w-full h-full bottom-0 pointer-events-none -translate-y-px"
						>
							{#each ticks as tick (tick.key)}
								<div class={tick.class} style={tick.style}></div>
							{/each}
						</div>
					{/if}

					<!-- Thumb -->
					<div
						bind:this={thumbRef}
						class="absolute w-2 h-4 bg-foreground border-l border-r border-background cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1.75 touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						style:left="{sliderPosition}%"
						role="slider"
						aria-valuemin={min}
						aria-valuemax={max}
						aria-valuenow={displayValue}
						tabindex="0"
						onkeydown={handleThumbKeyDown}
					></div>
				</div>
				<div
					class="flex justify-between text-muted-foreground pt-1 -mx-0.5 select-none type-value"
				>
					<div>{formatEndpoint(min)}</div>
					<div>{formatEndpoint(max)}</div>
				</div>
			</div>
		</div>

		<!-- Number Input -->
		<div class="flex gap-1.5 items-center">
			<div class="flex h-7">
				<input
					type="text"
					bind:value={inputValueString}
					oninput={handleInputChange}
					onfocus={() => (isInputFocused = true)}
					onblur={handleInputBlur}
					onkeydown={handleInputKeyDown}
					style:width={inputWidth}
					class="bg-transparent text-right border-border border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-full px-0.5 text-foreground type-value"
					{min}
					{max}
				/>
				<!-- Unit, like "%" or "ms", if provided -->
				{#if unit}
					<span
						class="inline-flex items-center border border-l-0 border-border bg-muted px-1 text-subtle-foreground h-full type-value"
					>
						{unit}
					</span>
				{/if}
			</div>

			{#if onReset}
				<ResetValueButton {hasDefaultValue} {onReset} />
			{/if}
		</div>
	</div>
</div>

<style>
	.cursor-grabbing {
		cursor: grabbing !important;
	}
	[role="slider"] {
		z-index: 10;
		touch-action: none;
	}
</style>
