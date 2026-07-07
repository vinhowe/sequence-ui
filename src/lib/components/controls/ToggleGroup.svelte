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
		contentClass = 'pad-box stack-field',
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
	<!-- Gated children are DISABLED in place (grayed), not hidden — the desktop
	     convention for enable-gates (the user can act on the adjacent checkbox, and
	     the layout stays stable). Native <fieldset disabled> cascades the disabled
	     state to every form control inside with zero per-child wiring; hiding is
	     reserved for contextual irrelevance (mode switches), not gates. -->
	<fieldset
		disabled={showEnableToggle && !enabled}
		class={`min-w-0 border-0 ${contentClass} ${showEnableToggle && !enabled ? 'opacity-50' : ''}`.trim()}
	>
		{@render children?.()}
	</fieldset>
</Panel>
