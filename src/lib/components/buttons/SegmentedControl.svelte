<script lang="ts" module>
	import type { Component } from 'svelte';

	export type SegmentedOption = {
		value: string;
		/** Text label. Omit for an icon-only segment. */
		label?: string;
		icon?: Component;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import FormLabel from '../controls/FormLabel.svelte';
	import ResetValueButton from '../controls/ResetValueButton.svelte';

	type $$Props = {
		/** Single-select segments, joined into one hairline-divided cluster. */
		options: SegmentedOption[];
		value: string;
		id?: string;
		label?: string;
		/** Accessible name when no visible `label` is given. */
		ariaLabel?: string;
		size?: 'sm' | 'md';
		class?: string;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		options = [],
		value = $bindable(),
		id,
		label,
		ariaLabel,
		size = 'md',
		class: wrapperClass = '',
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();

	let buttonEls = $state<HTMLButtonElement[]>([]);

	const SIZE = {
		sm: 'h-control-sm px-1 text-xs font-[550] [&_svg]:h-[10px] [&_svg]:w-[10px]',
		md: 'h-control px-1.5 text-sm [&_svg]:h-[11px] [&_svg]:w-[11px]'
	} as const;

	// Match the bolder sm label: thicken sm icon strokes (they render at 10px).
	const iconStroke = $derived(size === 'sm' ? 3 : 2.5);

	function selectableIndices(): number[] {
		return options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
	}

	function select(i: number) {
		const opt = options[i];
		if (!opt || opt.disabled) return;
		value = String(opt.value);
		queueMicrotask(() => buttonEls[i]?.focus());
	}

	function onKeydown(e: KeyboardEvent, i: number) {
		const idxs = selectableIndices();
		const pos = idxs.indexOf(i);
		if (pos < 0) return;
		let next = -1;
		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				next = idxs[(pos + 1) % idxs.length];
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				next = idxs[(pos - 1 + idxs.length) % idxs.length];
				break;
			case 'Home':
				next = idxs[0];
				break;
			case 'End':
				next = idxs[idxs.length - 1];
				break;
			default:
				return;
		}
		e.preventDefault();
		select(next);
	}

	const firstSelectable = $derived(selectableIndices()[0] ?? -1);
</script>

<div class={twMerge('relative stack-tight', wrapperClass)}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div class="flex items-start gap-2">
		<div
			{id}
			role="radiogroup"
			aria-label={ariaLabel ?? label}
			class="inline-flex divide-x divide-border border border-border"
		>
			{#each options as opt, i (String(opt.value))}
				{@const Icon = opt.icon}
				{@const selected = String(opt.value) === String(value)}
				<button
					bind:this={buttonEls[i]}
					type="button"
					role="radio"
					aria-checked={selected}
					aria-label={opt.label ? undefined : String(opt.value)}
					tabindex={selected || (!value && i === firstSelectable) ? 0 : -1}
					disabled={opt.disabled}
					onclick={() => select(i)}
					onkeydown={(e) => onKeydown(e, i)}
					class={twMerge(
						'relative inline-flex items-center justify-center gap-1.5 font-sans leading-none font-medium whitespace-nowrap select-none focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none disabled:opacity-50 [&_svg]:shrink-0',
						SIZE[size],
						selected
							? 'bg-primary-accent/15 text-primary-accent active:bg-primary-accent/(--tint-solid-hover)'
							: 'text-foreground hover:bg-muted active:bg-border/50',
						opt.label ? '' : 'aspect-square px-0'
					)}
				>
					{#if Icon}<Icon strokeWidth={iconStroke} aria-hidden="true" />{/if}
					{#if opt.label}<span>{opt.label}</span>{/if}
				</button>
			{/each}
		</div>
		{#if onReset}
			<div class="self-center">
				<ResetValueButton {hasDefaultValue} {onReset} />
			</div>
		{/if}
	</div>
</div>
