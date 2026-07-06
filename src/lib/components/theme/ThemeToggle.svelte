<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import { twMerge } from 'tailwind-merge';
	import { getThemeContext, type ThemeMode } from './ThemeProvider.svelte';

	type Props = {
		/** Fill the parent's height and use the app-bar's border, so it reads as a
		    built-in segment of the bar rather than a floating pill. Use inside `AppBar`. */
		integrated?: boolean;
		class?: string;
	};
	let { integrated = false, class: wrapperClass = '' }: Props = $props();

	const themeContext = getThemeContext();

	const OPTIONS = [
		{ label: 'Light', value: 'light', icon: Sun },
		{ label: 'Dark', value: 'dark', icon: Moon },
		{ label: 'System', value: 'system', icon: Monitor }
	] satisfies Array<{ label: string; value: ThemeMode; icon: typeof Sun }>;

	// A small segmented switch. Sans + sentence-case — reads as a control, not a
	// mono/uppercase command. Active segment is a solid primary chip.
	// `integrated` docks it into the app bar: full height, the bar's own border color,
	// no floating pill outline — vs. the standalone pill (primary-tinted border) used
	// on normal surfaces (e.g. the gallery demo).
	const containerClasses = integrated
		? 'flex items-stretch -mt-px divide-x divide-purple-300 border-l border-purple-300 dark:divide-purple-900 dark:border-purple-900'
		: 'inline-flex divide-x divide-primary/20 border border-primary/30';
	const baseButtonClasses =
		'inline-flex items-center gap-1 px-1 font-sans text-xs leading-none font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0';
	const activeButtonClasses = integrated
		? 'bg-purple-300 text-purple-950 dark:bg-purple-800 dark:text-purple-50'
		: 'bg-primary text-primary-foreground';
	const inactiveButtonClasses = 'hover:bg-primary/10';

	function optionClasses(value: ThemeMode) {
		return twMerge(
			baseButtonClasses,
			integrated ? '' : 'py-0.5',
			themeContext.theme === value ? activeButtonClasses : inactiveButtonClasses
		);
	}
</script>

<div class={twMerge(containerClasses, wrapperClass)} role="radiogroup" aria-label="Theme">
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
