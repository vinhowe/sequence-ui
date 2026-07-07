<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, setContext } from 'svelte';

	import { twMerge } from 'tailwind-merge';
	import ChevronIcon from '../icons/ChevronIcon.svelte';

	type $$Props = {
		title: string;
		isOpen: boolean;
		class?: string;
		ontoggle?: () => void;
		contentClass?: string;
		children?: Snippet;
	};

	let {
		title,
		isOpen,
		class: wrapperClass = '',
		ontoggle,
		contentClass = 'pad-box stack-field',
		children
	}: $$Props = $props();

	// Depth-aware nesting (pro-inspector convention: Blender sub-panels, AE
	// twirl-downs). A CollapsibleSection inside another one detects it via
	// context and restyles itself as a NESTED twirl-down — left chevron, quiet
	// sans header, indented content behind an indent-guide rule — while the
	// top level keeps the filled full-width header row. Zero API; just nest.
	const DEPTH_KEY = 'sequence-ui:collapsible-depth';
	const depth: number = getContext(DEPTH_KEY) ?? 0;
	setContext(DEPTH_KEY, depth + 1);
	const nested = depth > 0;

	function handleClick() {
		if (ontoggle) {
			ontoggle();
		}
	}

	const sectionId = $derived(`section-content-${title.toLowerCase().replace(/\s+/g, '-')}`);
</script>

{#if nested}
	<div class={twMerge('stack-tight', wrapperClass)}>
		<div
			class="flex select-none items-center gap-1 py-0.5 text-muted-foreground hover:text-foreground"
			onclick={handleClick}
			role="button"
			tabindex="0"
			aria-expanded={isOpen}
			aria-controls={sectionId}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			<ChevronIcon direction={isOpen ? 'down' : 'right'} size={10} />
			<h3 class="type-label">{title}</h3>
		</div>

		{#if isOpen}
			<!-- Indent guide: content steps in behind a hairline rule, tree-style. -->
			<div class={twMerge('ml-1 border-l border-border pl-2', contentClass)} id={sectionId}>
				{@render children?.()}
			</div>
		{/if}
	</div>
{:else}
	<div class={twMerge(`border-b border-border overflow-hidden bg-background`, wrapperClass)}>
		<div
			class="px-1 py-0.5 flex justify-between items-center select-none bg-gradient-to-r from-muted to-panel border-border"
			class:border-b={isOpen}
			onclick={handleClick}
			role="button"
			tabindex="0"
			aria-expanded={isOpen}
			aria-controls={sectionId}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			<h2 class="text-foreground type-title">{title}</h2>
			<ChevronIcon direction={isOpen ? 'down' : 'right'} class="text-muted-foreground" />
		</div>

		{#if isOpen}
			<div class={contentClass} id={sectionId}>
				{@render children?.()}
			</div>
		{/if}
	</div>
{/if}
