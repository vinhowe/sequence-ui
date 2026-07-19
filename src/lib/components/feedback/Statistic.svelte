<script lang="ts">
	import type { Snippet } from 'svelte';

	import KatexBlock from '../optional/KatexBlock.svelte';

	type $$Props = {
		label: string;
		children: Snippet;
		funFact?: Snippet;
	};

	let { label, children, funFact }: $$Props = $props();
</script>

<div
	class="stack-tight pad-box bg-card/70 border border-border-strong/60 text-foreground"
>
	<span class="text-foreground type-label"
		><KatexBlock text={label} /></span
	>
	<span class="flex flex-wrap items-baseline gap-x-1">
		<span class="whitespace-nowrap type-value">
			{@render children?.()}
		</span>
		{#if funFact}
			<span class="text-muted-foreground type-body">
				{@render funFact?.()}
			</span>
		{/if}
	</span>
</div>
