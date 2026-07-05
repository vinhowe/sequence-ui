<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Snippet } from 'svelte';

	type Props = {
		/** Brand / project name, rendered at the left as a small mono uppercase label. */
		title?: string;
		/** Override the left/brand area entirely (takes precedence over `title`). */
		brand?: Snippet;
		/** Right-side content — actions, a ThemeToggle, etc. */
		children?: Snippet;
		class?: string;
	};

	let { title, brand, children, class: wrapperClass = '' }: Props = $props();
</script>

<!--
  App chrome: a thin, full-width sticky top bar. Height is a fixed integer px
  (`--bar-height`, default 20px) — deliberately OUTSIDE the 4px grid and NOT `py-*` —
  so the ~18px ThemeToggle and 11px brand text center on whole pixels. Padding-based
  sizing rounds unevenly at this height and drifts the contents up/down. Purple is the
  on-brand default; override colors via `class` if your app's chrome differs.
-->
<header
	class={twMerge(
		'sticky top-0 z-30 flex h-[var(--bar-height)] shrink-0 items-center justify-between gap-8 border-b border-purple-300 bg-purple-200 px-1.5 text-purple-900 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200',
		wrapperClass
	)}
>
	{#if brand}
		{@render brand()}
	{:else if title}
		<span class="font-mono text-xs font-semibold uppercase tracking-wider">{title}</span>
	{:else}
		<span></span>
	{/if}
	{#if children}
		<div class="flex items-center gap-2">{@render children()}</div>
	{/if}
</header>
