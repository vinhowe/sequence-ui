<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	import IconButton from '../buttons/IconButton.svelte';
	import ChevronIcon from '../icons/ChevronIcon.svelte';

	type PageToken = number | 'gap';
	type $$Props = {
		page: number;
		pageCount: number;
		siblingCount?: number;
		class?: string;
	};

	let { page = $bindable(1), pageCount, siblingCount = 1, class: wrapperClass = '' }: $$Props = $props();

	function clampPage(value: number): number {
		return Math.min(Math.max(1, value), Math.max(1, pageCount));
	}

	function buildTokens(): PageToken[] {
		const total = Math.max(1, pageCount);
		const current = clampPage(page);
		const siblings = Math.max(0, siblingCount);
		const visibleWindow = siblings * 2 + 5;

		if (total <= visibleWindow) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const left = Math.max(2, current - siblings);
		const right = Math.min(total - 1, current + siblings);
		const showLeftGap = left > 2;
		const showRightGap = right < total - 1;
		const tokens: PageToken[] = [1];

		if (showLeftGap) tokens.push('gap');
		else for (let value = 2; value < left; value++) tokens.push(value);

		for (let value = left; value <= right; value++) tokens.push(value);

		if (showRightGap) tokens.push('gap');
		else for (let value = right + 1; value < total; value++) tokens.push(value);

		tokens.push(total);
		return tokens;
	}

	const tokens = $derived(buildTokens());

	function setPage(next: number) {
		page = clampPage(next);
	}

	$effect(() => {
		const next = clampPage(page);
		if (next !== page) page = next;
	});
</script>

<nav class={twMerge('flex items-center gap-1', wrapperClass)} aria-label="Pagination">
	<IconButton label="Previous page" disabled={page <= 1} onclick={() => setPage(page - 1)}>
		<ChevronIcon direction="right" class="rotate-180" />
	</IconButton>

	<div class="flex items-center gap-1">
		{#each tokens as token, i (`${token}-${i}`)}
			{#if token === 'gap'}
				<span class="flex h-5.5 w-5.5 items-center justify-center text-muted-foreground type-button">…</span>
			{:else}
				<button
					type="button"
					aria-current={token === page ? 'page' : undefined}
					class={twMerge(
						'flex h-5.5 w-5.5 items-center justify-center border border-border tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-button',
						token === page ? 'bg-foreground text-background' : 'bg-panel text-foreground hover:bg-muted'
					)}
					onclick={() => setPage(token)}
				>
					{token}
				</button>
			{/if}
		{/each}
	</div>

	<IconButton label="Next page" disabled={page >= pageCount} onclick={() => setPage(page + 1)}>
		<ChevronIcon direction="right" />
	</IconButton>
</nav>
