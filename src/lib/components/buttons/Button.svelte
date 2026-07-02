<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	type Variant = 'solid' | 'outline' | 'ghost' | 'link';
	type Tone = 'default' | 'primary' | 'destructive';
	type Size = 'sm' | 'md';

	interface Props extends HTMLButtonAttributes {
		/** Emphasis: filled, bordered, chromeless, or a text link. */
		variant?: Variant;
		/** Color intent. */
		tone?: Tone;
		size?: Size;
		/** Leading icon (replaced by a spinner while loading). */
		icon?: Component;
		/** Trailing icon (e.g. a chevron). */
		iconRight?: Component;
		loading?: boolean;
		/** Render as an <a> that looks like a button. */
		href?: string;
		children?: Snippet;
	}

	let {
		variant = 'outline',
		tone = 'default',
		size = 'md',
		icon: Icon,
		iconRight: IconRight,
		loading = false,
		href,
		class: additionalClasses,
		disabled,
		children,
		...restProps
	}: Props = $props();

	const base =
		'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border transition-[background-color,color,border-color,opacity] select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:pointer-events-none type-button [&_svg]:shrink-0';

	const SIZE: Record<Size, string> = {
		sm: 'h-6 px-2 [&_svg]:h-3.5 [&_svg]:w-3.5',
		md: 'h-7.5 px-2.5 [&_svg]:h-4 [&_svg]:w-4'
	};

	// [variant][tone] — `border` is in base; each sets its border color (or transparent).
	const STYLES: Record<Variant, Record<Tone, string>> = {
		solid: {
			default: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70',
			primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/85',
			destructive:
				'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85'
		},
		outline: {
			default: 'border-border bg-card text-foreground hover:bg-muted',
			primary: 'border-primary/60 bg-card text-primary hover:bg-primary/10',
			destructive: 'border-destructive/60 bg-card text-destructive hover:bg-destructive/10'
		},
		ghost: {
			default: 'border-transparent text-foreground hover:bg-muted',
			primary: 'border-transparent text-primary hover:bg-primary/10',
			destructive: 'border-transparent text-destructive hover:bg-destructive/10'
		},
		link: {
			default: 'h-auto border-transparent px-0 text-foreground underline-offset-2 hover:underline',
			primary: 'h-auto border-transparent px-0 text-primary underline-offset-2 hover:underline',
			destructive:
				'h-auto border-transparent px-0 text-destructive underline-offset-2 hover:underline'
		}
	};

	const classes = $derived(
		twMerge(
			base,
			SIZE[size],
			STYLES[variant][tone],
			typeof additionalClasses === 'string' ? additionalClasses : ''
		)
	);
	const isDisabled = $derived(Boolean(disabled) || loading);
</script>

{#if href}
	<a {href} class={classes} aria-disabled={isDisabled} {...(restProps as Record<string, unknown>)}>
		{#if loading}
			<LoaderCircle class="animate-spin" aria-hidden="true" />
		{:else if Icon}
			<Icon aria-hidden="true" />
		{/if}
		{@render children?.()}
		{#if IconRight && !loading}
			<IconRight aria-hidden="true" />
		{/if}
	</a>
{:else}
	<button type="button" class={classes} disabled={isDisabled} {...restProps}>
		{#if loading}
			<LoaderCircle class="animate-spin" aria-hidden="true" />
		{:else if Icon}
			<Icon aria-hidden="true" />
		{/if}
		{@render children?.()}
		{#if IconRight && !loading}
			<IconRight aria-hidden="true" />
		{/if}
	</button>
{/if}
