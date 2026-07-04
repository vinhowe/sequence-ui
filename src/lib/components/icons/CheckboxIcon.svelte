<script lang="ts">
	let { checked }: { checked: boolean } = $props();
</script>

<span
	class="h-[13px] w-[13px] flex shrink-0 items-center justify-center peer-focus-visible:ring-1 peer-focus-visible:ring-ring"
	class:bg-foreground={checked}
	class:bg-border-strong={!checked}
>
	<svg
		class={`h-[11px] w-[11px] ${checked ? 'opacity-100' : 'opacity-0'}`}
		aria-hidden={!checked}
		viewBox="0 0 16 16"
		fill="currentColor"
		class:text-background={checked}
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
		/>
	</svg>
</span>
