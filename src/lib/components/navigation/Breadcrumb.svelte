<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	import ChevronIcon from '../icons/ChevronIcon.svelte';

	type BreadcrumbItem = { label: string; href?: string; onSelect?: () => void };
	type VisibleItem = { kind: 'item'; item: BreadcrumbItem; originalIndex: number } | { kind: 'ellipsis' };
	type $$Props = {
		items: BreadcrumbItem[];
		class?: string;
		maxItems?: number;
	};

	let { items, class: wrapperClass = '', maxItems = undefined }: $$Props = $props();

	let expanded = $state(false);

	function buildVisibleItems(): VisibleItem[] {
		if (!maxItems || expanded || items.length <= maxItems || maxItems < 3) {
			return items.map((item, originalIndex) => ({ kind: 'item', item, originalIndex }));
		}

		const middleSlots = maxItems - 2;
		const frontCount = Math.max(1, Math.ceil(middleSlots / 2));
		const backCount = Math.max(1, middleSlots - frontCount);
		const front = items
			.slice(0, frontCount)
			.map((item, originalIndex) => ({ kind: 'item' as const, item, originalIndex }));
		const backStart = items.length - backCount;
		const back = items
			.slice(backStart)
			.map((item, index) => ({ kind: 'item' as const, item, originalIndex: backStart + index }));
		return [...front, { kind: 'ellipsis' }, ...back];
	}

	const visibleItems = $derived(buildVisibleItems());
</script>

<nav class={twMerge('flex flex-wrap items-center gap-1', wrapperClass)} aria-label="Breadcrumb">
	{#each visibleItems as visible, i}
		{#if i > 0}
			<ChevronIcon direction="right" class="h-3 w-3 text-subtle-foreground" strokeWidth={2.5} />
		{/if}

		{#if visible.kind === 'ellipsis'}
			<button
				type="button"
				aria-label="Show full path"
				class="px-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body"
				onclick={() => (expanded = true)}
			>
				…
			</button>
		{:else if visible.originalIndex === items.length - 1}
			<span aria-current="page" class="text-foreground type-body">{visible.item.label}</span>
		{:else if visible.item.href}
			<a
				href={visible.item.href}
				class="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body"
				onclick={() => visible.item.onSelect?.()}
			>
				{visible.item.label}
			</a>
		{:else if visible.item.onSelect}
			<button
				type="button"
				class="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body"
				onclick={visible.item.onSelect}
			>
				{visible.item.label}
			</button>
		{:else}
			<span class="text-muted-foreground type-body">{visible.item.label}</span>
		{/if}
	{/each}
</nav>
