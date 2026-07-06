<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	export type PaneTab = {
		id: string;
		label: string;
		icon?: Component;
		disabled?: boolean;
	};

	type Props = {
		tabs: PaneTab[];
		/** The active tab id (bindable). */
		active?: string;
		class?: string;
		tabsClass?: string;
		bodyClass?: string;
		/** Optional controls pinned to the right of the tab strip (e.g. a settings button). */
		actions?: Snippet;
		/** Pane body; receives the active tab id. */
		children?: Snippet<[string]>;
	};

	let {
		tabs,
		active = $bindable(tabs[0]?.id),
		class: rootClass = '',
		tabsClass = '',
		bodyClass = 'pad-box stack-field',
		actions,
		children
	}: Props = $props();
</script>

<div class={twMerge('flex min-h-0 flex-col border border-border bg-background', rootClass)}>
	<!-- Tab strip. The active tab uses the body's bg-background + a transparent bottom border,
	     and the row is pulled down 1px (-mb-px) so it merges into the pane below (VS Code look). -->
	<div
		class={twMerge('flex shrink-0 items-stretch bg-panel', tabsClass)}
		role="tablist"
	>
		<div class="-mb-px flex">
			{#each tabs as tab (tab.id)}
				{@const isActive = tab.id === active}
				{@const Icon = tab.icon}
				<button
					type="button"
					role="tab"
					aria-selected={isActive}
					disabled={tab.disabled}
					class={twMerge(
						'flex h-control items-center gap-1.5 border-r border-b border-border px-2 type-body disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
						isActive
							? 'border-b-transparent bg-background text-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
					onclick={() => (active = tab.id)}
				>
					{#if Icon}
						<Icon size={13} strokeWidth={2} aria-hidden="true" />
					{/if}
					{tab.label}
				</button>
			{/each}
		</div>
		{#if actions}
			<div class="ml-auto flex items-center gap-1 border-b border-border px-1">
				{@render actions()}
			</div>
		{/if}
	</div>
	<div class={twMerge('min-h-0 flex-1 overflow-y-auto', bodyClass)} role="tabpanel">
		{@render children?.(active)}
	</div>
</div>
