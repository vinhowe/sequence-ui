export { default as ActionButton } from './components/buttons/ActionButton.svelte';
export { default as IconButton } from './components/buttons/IconButton.svelte';

export { default as Panel } from './components/primitives/Panel.svelte';
export { default as BorderedGroup } from './components/primitives/Panel.svelte';
export { default as CollapsibleSection } from './components/primitives/CollapsibleSection.svelte';
export { default as Pane, type PaneTab } from './components/primitives/Pane.svelte';

export { default as Slider } from './components/controls/Slider.svelte';
export { default as NumberInput } from './components/controls/NumberInput.svelte';
export { default as ScrubInput } from './components/controls/ScrubInput.svelte';
export { default as AngleField } from './components/controls/AngleField.svelte';
export { default as ThresholdMarker } from './components/controls/ThresholdMarker.svelte';
export { default as TextInput } from './components/controls/TextInput.svelte';
export { default as TimecodeField } from './components/controls/TimecodeField.svelte';
export { default as BitField } from './components/controls/BitField.svelte';
export { default as BaseField } from './components/controls/BaseField.svelte';
export { default as ToleranceField } from './components/controls/ToleranceField.svelte';
export {
	default as SelectInput,
	type SelectOption
} from './components/controls/SelectInput.svelte';
export { default as ToggleGroup } from './components/controls/ToggleGroup.svelte';
export { default as CheckboxInput } from './components/controls/CheckboxInput.svelte';
export { default as RadioGroupInput } from './components/controls/RadioGroupInput.svelte';
export { default as RadioInput } from './components/controls/RadioInput.svelte';
export { default as FormLabel } from './components/controls/FormLabel.svelte';
export { default as ResetValueButton } from './components/controls/ResetValueButton.svelte';

export { default as Statistic } from './components/feedback/Statistic.svelte';
export { default as ControlsStatistic } from './components/feedback/Statistic.svelte';
export { default as Note } from './components/feedback/Note.svelte';
export { default as ControlsNote } from './components/feedback/Note.svelte';
export {
	default as Citations,
	type CitationEntries
} from './components/feedback/Citations.svelte';
export { default as Tooltip } from './components/feedback/Tooltip.svelte';
export { default as UserGuideTooltip } from './components/feedback/Tooltip.svelte';

export {
	default as Menu,
	type MenuItem
} from './components/navigation/Menu.svelte';
export { default as Breadcrumb } from './components/navigation/Breadcrumb.svelte';
export { default as Pagination } from './components/navigation/Pagination.svelte';
export {
	default as Tree,
	type TreeNode
} from './components/navigation/Tree.svelte';

export {
	default as CapacityBar,
	type CapacitySegment
} from './components/data/CapacityBar.svelte';
export { default as TimeBrush } from './components/data/TimeBrush.svelte';
export { default as ProgressBar } from './components/data/ProgressBar.svelte';

export { default as ChevronIcon } from './components/icons/ChevronIcon.svelte';
export { default as CheckboxIcon } from './components/icons/CheckboxIcon.svelte';
export { default as RadioIcon } from './components/icons/RadioIcon.svelte';

export { default as ThemeProvider } from './components/theme/ThemeProvider.svelte';
export { default as ThemeToggle } from './components/theme/ThemeToggle.svelte';
export { getThemeContext } from './components/theme/ThemeProvider.svelte';
export type { ThemeMode, ThemeContext } from './components/theme/ThemeProvider.svelte';

// Optional components require the peer-optional `katex` CSS/runtime when LaTeX rendering is used.
export { default as KatexBlock } from './components/optional/KatexBlock.svelte';
export { default as Footnote } from './components/optional/Footnote.svelte';
export { default as FootnotesProvider } from './components/optional/FootnotesProvider.svelte';
export { default as Portal } from './components/optional/Portal.svelte';
