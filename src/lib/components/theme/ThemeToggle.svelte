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

	// Transparent + inherits the bar's text color so the toggle blends into whatever
	// header it sits in; the active segment is a subtle translucent tint (never a
	// stark bg-foreground box), and inactive segments are dimmed.
	const baseButtonClasses =
		'inline-flex items-center gap-1 border-r border-black/10 px-1.5 py-0 leading-none transition last:border-r-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 type-button dark:border-white/15';
	const activeButtonClasses = 'bg-black/12 dark:bg-white/18';
	const inactiveButtonClasses = 'opacity-55 hover:bg-black/5 hover:opacity-90 dark:hover:bg-white/10';

	function optionClasses(value: ThemeMode) {
		return twMerge(
			baseButtonClasses,
			themeContext.theme === value ? activeButtonClasses : inactiveButtonClasses
		);
	}
</script>

<div
	class="inline-flex border border-black/15 dark:border-white/20"
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
			<Icon size={13} strokeWidth={2} aria-hidden="true" />
			<span>{option.label}</span>
		</button>
	{/each}
</div>
