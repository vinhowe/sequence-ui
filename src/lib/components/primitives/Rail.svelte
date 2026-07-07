<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		class?: string;
	};

	let { children, class: wrapperClass = '' }: Props = $props();
</script>

<!--
  The RAIL — the canonical settings/inspector surface (Lightroom/Blender
  properties-rail): ONE continuous bordered surface whose children are
  CollapsibleSection header rows sharing hairlines at zero gap. The Rail owns
  the outer border and suppresses the last row's border-b so it doesn't double
  with the wrapper. Titles live in the section header rows; a Rail page has no
  h2s and no stack-section. Nest CollapsibleSections for twirl-down subgroups.
-->
<div class={twMerge('border border-border [&>:last-child]:border-b-0', wrapperClass)}>
	{@render children?.()}
</div>
