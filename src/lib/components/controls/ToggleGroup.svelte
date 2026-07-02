<script lang="ts">
	import type { Snippet } from 'svelte';

	import CheckboxInput from './CheckboxInput.svelte';
	import Panel from '../primitives/Panel.svelte';
	import type { CitationEntries as CitationsType } from '../feedback/Citations.svelte';

	type $$Props = {
		title?: string;
		id: string;
		citations?: CitationsType;
		showEnableToggle?: boolean;
		enabled?: boolean;
		class?: string;
		headerClass?: string;
		contentClass?: string;
		header?: Snippet;
		children?: Snippet;
		hasDefaultValue?: boolean;
		onReset?: () => void;
	};

	let {
		title,
		id,
		citations,
		showEnableToggle = false,
		enabled = $bindable(false),
		class: rootClass = '',
		headerClass = undefined,
		contentClass = 'p-1.5 stack-field',
		header,
		children,
		hasDefaultValue = false,
		onReset = undefined
	}: $$Props = $props();
</script>

<Panel {title} {id} {citations} {header} class={rootClass} {headerClass} contentClass={null}>
	{#snippet action()}
		{#if showEnableToggle}
			<CheckboxInput
				id={`${id}-enable-toggle`}
				bind:checked={enabled}
				{hasDefaultValue}
				{onReset}
			/>
		{/if}
	{/snippet}
	{#if !showEnableToggle || (showEnableToggle && enabled)}
		<div class={contentClass}>
			{@render children?.()}
		</div>
	{/if}
</Panel>
