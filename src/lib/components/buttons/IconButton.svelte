<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		icon?: Component;
		label?: string;
		children?: Snippet;
		size?: 'sm' | 'md';
		strokeWidth?: number;
		active?: boolean;
		highlighted?: boolean;
	}

	let {
		icon: Icon,
		label,
		children,
		size = 'md',
		strokeWidth = 2.5,
		active = false,
		highlighted = false,
		class: additionalClasses,
		disabled,
		...restProps
	}: Props = $props();

	const baseClasses =
		'inline-flex shrink-0 items-center justify-center border border-border bg-panel text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 type-button';

	const sizeClasses = $derived(size === 'sm' ? 'h-control-sm w-control-sm' : 'h-control w-control');
	const stateClasses = $derived(
		highlighted
			? 'border-primary bg-primary text-primary-foreground animate-pulse'
			: active
				? // Selected = the system-wide primary tint (like SegmentedControl/Tree) —
					// never surface-pair contrast (bg-panel vs bg-card collapses in dark).
					'bg-primary-accent/15 text-primary-accent active:bg-primary-accent/(--tint-solid-hover)'
				: 'hover:bg-muted active:bg-border/50'
	);
	const iconClasses = $derived(size === 'sm' ? 'h-[10px] w-[10px]' : 'h-[11px] w-[11px]');
	const normalizedAdditionalClasses = $derived(
		typeof additionalClasses === 'string' ? additionalClasses : ''
	);
</script>

<button
	type="button"
	aria-label={label}
	title={label}
	class={twMerge(baseClasses, sizeClasses, stateClasses, normalizedAdditionalClasses)}
	{disabled}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else if Icon}
		<Icon class={iconClasses} {strokeWidth} aria-hidden="true" />
	{/if}
</button>
