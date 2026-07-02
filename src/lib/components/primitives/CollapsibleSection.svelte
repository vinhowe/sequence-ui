<script lang="ts">
	import type { Snippet } from 'svelte';

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
		contentClass = 'p-1.5 stack-field',
		children
	}: $$Props = $props();

	function handleClick() {
		if (ontoggle) {
			ontoggle();
		}
	}

	const sectionId = $derived(`section-content-${title.toLowerCase().replace(/\s+/g, '-')}`);
</script>

<div class={twMerge(`border-b border-border overflow-hidden bg-card`, wrapperClass)}>
	<div
		class="px-1 py-0.5 flex justify-between items-center cursor-pointer select-none bg-gradient-to-r from-muted to-panel border-border"
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
