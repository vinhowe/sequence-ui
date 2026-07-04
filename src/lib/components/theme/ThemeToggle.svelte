<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import { twMerge } from 'tailwind-merge';
	import { getThemeContext, type ThemeMode } from './ThemeProvider.svelte';

	const themeContext = getThemeContext();

	const OPTIONS = [
		{ label: 'Light', value: 'light', icon: Sun },
		{ label: 'Dark', value: 'dark', icon: Moon },
		{ label: 'System', value: 'system', icon: Monitor }
	] satisfies Array<{ label: string; value: ThemeMode; icon: typeof Sun }>;

	// A small segmented switch (mirrors SegmentedControl), sized to fit the app bar.
	// Sans + sentence-case — it reads as a control, not a mono/uppercase command.
	// Colors track `primary` so it harmonizes with the purple bar it usually sits on;
	// the active segment is a solid primary chip for a clear selected state on that
	// colored ground.
	const baseButtonClasses =
		'inline-flex items-center gap-1 px-1 py-0.5 font-sans text-xs leading-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0';
	const activeButtonClasses = 'bg-primary text-primary-foreground';
	const inactiveButtonClasses = 'hover:bg-primary/10';

	function optionClasses(value: ThemeMode) {
		return twMerge(
			baseButtonClasses,
			themeContext.theme === value ? activeButtonClasses : inactiveButtonClasses
		);
	}
</script>

<div
	class="inline-flex divide-x divide-primary/20 border border-primary/30"
	role="radiogroup"
	aria-label="Theme"
>
	{#each OPTIONS as option}
		{@const Icon = option.icon}
		<button
			type="button"
			role="radio"
			aria-checked={themeContext.theme === option.value}
			class={optionClasses(option.value)}
			onclick={() => themeContext.setTheme(option.value)}
		>
			<Icon size={11} strokeWidth={2} aria-hidden="true" />
			<span>{option.label}</span>
		</button>
	{/each}
</div>
