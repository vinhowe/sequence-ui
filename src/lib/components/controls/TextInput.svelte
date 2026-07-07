<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	import FormLabel from './FormLabel.svelte';
	import ResetValueButton from './ResetValueButton.svelte';

	type $$Props = {
		label?: string;
		value: string | number;
		id: string;
		class?: string;
		/** Classes for the bordered field wrapper — the right place for a content
		    width (`fieldClass="w-24"`). Widths on `class` squeeze the LABEL too. */
		fieldClass?: string;
		placeholder?: string;
		type?: string;
		disabled?: boolean;
		/** Leading affix cell inside the border (a tag, an icon, "https://"). */
		prefix?: Snippet;
		/** Trailing affix cell inside the border. A bare `<button>` here is styled
		    as a flush ghost cell automatically (Reveal / Browse / clear). */
		suffix?: Snippet;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		label,
		value = $bindable(),
		id,
		class: wrapperClass = '',
		fieldClass = '',
		placeholder = '',
		type = 'text',
		disabled = false,
		prefix,
		suffix,
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();

	// Affix cells follow the collapsed-border model (NumberInput's unit box,
	// ToleranceField's ±): ONE bordered wrapper owns h-control; the input and any
	// affixes are borderless cells separated by hairline dividers. A bare <button>
	// dropped into an affix snippet is styled as a flush ghost command cell —
	// full-height, sans, quiet hover/press — so consumers write plain markup.
	const affixCell =
		'flex shrink-0 items-stretch [&>button]:flex [&>button]:items-center [&>button]:px-1.5 [&>button]:font-sans [&>button]:text-sm [&>button]:font-medium [&>button]:text-muted-foreground [&>button]:hover:bg-muted [&>button]:hover:text-foreground [&>button]:active:bg-border/50 [&>button]:focus-visible:outline-none [&>button]:focus-visible:ring-1 [&>button]:focus-visible:ring-ring [&>button]:focus-visible:ring-inset [&>span]:flex [&>span]:items-center [&>span]:px-1.5 [&>span]:text-muted-foreground';
</script>

<div class={`relative stack-tight ${disabled ? 'pointer-events-none opacity-50' : ''} ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel forInputId={id} value={label} />
	{/if}
	<div class="flex gap-1.5 items-center">
		<div
			class={twMerge(
				'flex h-control w-full items-stretch border border-border bg-card focus-within:ring-1 focus-within:ring-ring',
				fieldClass
			)}
		>
			{#if prefix}
				<div class={`${affixCell} border-r border-border`}>
					{@render prefix()}
				</div>
			{/if}
			<input
				{id}
				{type}
				{placeholder}
				{disabled}
				bind:value
				class="block h-full w-full min-w-0 flex-1 border-0 bg-transparent px-1 text-foreground placeholder:text-subtle-foreground focus-visible:outline-none type-body"
			/>
			{#if suffix}
				<div class={`${affixCell} border-l border-border`}>
					{@render suffix()}
				</div>
			{/if}
		</div>
		{#if onReset}
			<ResetValueButton {hasDefaultValue} {onReset} />
		{/if}
	</div>
</div>
