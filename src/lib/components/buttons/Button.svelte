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
		'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap border select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:pointer-events-none font-sans font-medium [&_svg]:shrink-0';

	// Fixed height + the font's NATURAL line-height, so every button matches height
	// (icon or not) and the caps sit optically centered. (leading-none clips the
	// font's ~18px line box and shoves the text low → "more space above".)
	const SIZE: Record<Size, string> = {
		sm: 'h-control-sm gap-1 px-1 text-xs font-[550] [&_svg]:h-[10px] [&_svg]:w-[10px]',
		md: 'h-control gap-1.25 px-1.5 text-sm [&_svg]:h-[11px] [&_svg]:w-[11px]'
	};

	// [variant][tone] — `border` is in base; each sets its border color (or transparent).
	const STYLES: Record<Variant, Record<Tone, string>> = {
		solid: {
			default: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70',
			primary: 'border-transparent bg-primary-accent/15 text-primary-accent hover:bg-primary-accent/25',
			destructive:
				'border-transparent bg-destructive-accent/15 text-destructive-accent hover:bg-destructive-accent/25'
		},
		// Flat Hairline (the default look): 1px hairline everywhere; the accent lives
		// in the border + text, with only a faint wash of fill that deepens on hover.
		outline: {
			default: 'border-border bg-card text-foreground hover:bg-muted',
			primary: 'border-primary-accent/55 bg-primary-accent/5 text-primary-accent hover:bg-primary-accent/12',
			destructive:
				'border-destructive-accent/55 bg-destructive-accent/5 text-destructive-accent hover:bg-destructive-accent/12'
		},
		ghost: {
			default: 'border-transparent text-foreground hover:bg-muted',
			primary: 'border-transparent text-primary-accent hover:bg-primary-accent/10',
			destructive: 'border-transparent text-destructive-accent hover:bg-destructive-accent/10'
		},
		link: {
			default: 'border-transparent px-0 text-foreground underline-offset-2 hover:underline',
			primary: 'border-transparent px-0 text-primary-accent underline-offset-2 hover:underline',
			destructive:
				'border-transparent px-0 text-destructive-accent underline-offset-2 hover:underline'
		}
	};

	// A leading icon has visual air around its glyph, so the left gap reads larger
	// than the right — trim the left padding a touch when one is present.
	const LEADING_INSET: Record<Size, string> = { sm: 'pl-0.75', md: 'pl-1.25' };
	const leadingGlyph = $derived(loading || Boolean(Icon));

	// sm glyphs render smaller (10px), so a flat stroke reads thinner — thicken it
	// to keep icon weight in step with the bolder (550) sm label.
	const iconStroke = $derived(size === 'sm' ? 3 : 2.5);

	const classes = $derived(
		twMerge(
			base,
			SIZE[size],
			leadingGlyph ? LEADING_INSET[size] : '',
			STYLES[variant][tone],
			typeof additionalClasses === 'string' ? additionalClasses : ''
		)
	);
	const isDisabled = $derived(Boolean(disabled) || loading);
</script>

{#if href}
	<a {href} class={classes} aria-disabled={isDisabled} {...(restProps as Record<string, unknown>)}>
		{#if loading}
			<LoaderCircle class="animate-spin" strokeWidth={iconStroke} aria-hidden="true" />
		{:else if Icon}
			<Icon strokeWidth={iconStroke} aria-hidden="true" />
		{/if}
		{@render children?.()}
		{#if IconRight && !loading}
			<IconRight strokeWidth={iconStroke} aria-hidden="true" />
		{/if}
	</a>
{:else}
	<button type="button" class={classes} disabled={isDisabled} {...restProps}>
		{#if loading}
			<LoaderCircle class="animate-spin" strokeWidth={iconStroke} aria-hidden="true" />
		{:else if Icon}
			<Icon strokeWidth={iconStroke} aria-hidden="true" />
		{/if}
		{@render children?.()}
		{#if IconRight && !loading}
			<IconRight strokeWidth={iconStroke} aria-hidden="true" />
		{/if}
	</button>
{/if}
