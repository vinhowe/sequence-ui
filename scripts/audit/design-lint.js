/**
 * Design lint — the consistency engine's enforcement half.
 *
 * A component should never hand-pick a raw spacing/type/color value; it should reach for a
 * NAMED ROLE (a stack or gap tier, pad-box, pad-control, a type role, a semantic color
 * token). Roles encode what a bare number can't — e.g. whether a gap scales with --density
 * (air) or stays fixed (structure). This script fails the build when a component uses a raw
 * value instead of a role, so consistency is ENFORCED, not remembered.
 *
 * Generic by design: rules are independent scanners over the component tree. Today there's
 * one (no-raw-spacing); no-raw-type / no-raw-color / no-raw-hover-alpha slot in as siblings.
 *
 * Run:  node scripts/audit/design-lint.js       (exit 1 on any violation)
 *       pnpm lint:design
 *
 * An allowlist entry is the ledger of every DELIBERATELY fixed exception: each records a
 * file, the utility, and WHY it is intrinsic (a control's own geometry, not layout air).
 * Adding a raw value forces a choice — use a role, or record why it's an exception.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const COMPONENTS = join(ROOT, 'src', 'lib', 'components');

function walk(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) out.push(...walk(p));
		else if (name.endsWith('.svelte')) out.push(p);
	}
	return out;
}

/* ── Rule: no-raw-spacing ───────────────────────────────────────────────────
   Raw gap / space / margin / padding utilities must be a spacing role instead.
   - gap-N / space-[xy]-N                → a gap tier (gap-tight/field/group/section) or stack-*
   - m*-N                               → banned outright; a parent owns the gap, children ship margin-free
   - p*-N (box padding)                 → pad-box(-x/-y); or pad-control-x / pad-chrome-y if fixed
   Auto-exempt: an explicit reset (…-0), and padding on an element that carries its own control
   height on the same line (h-control / h-control-sm / h-bar) — that's a control's own box. */
const SPACING_UTIL =
	/^(gap(?:-[xy])?|space-[xy]|[mp][xytblrse]?)-(\d[\d.]*)$/;

// Ledger of deliberate fixed exceptions — intrinsic component geometry, not layout air.
// Each entry exempts one utility in one file. { file, util, reason }. A new raw value that
// isn't a role and isn't here fails the lint, forcing a conscious choice: role or exception.
const SPACING_ALLOWLIST = [
	// primitives — chrome and nested-tree geometry
	{ file: 'src/lib/components/primitives/Panel.svelte', util: 'gap-2', reason: 'header title↔trailing-action chrome gap (8px), no role match' },
	{ file: 'src/lib/components/primitives/Pane.svelte', util: 'gap-1.5', reason: 'icon↔label gap inside a tab button (intrinsic)' },
	{ file: 'src/lib/components/primitives/Pane.svelte', util: 'gap-1', reason: 'gap between right-pinned tab actions (4px, not sibling panels)' },
	{ file: 'src/lib/components/primitives/Pane.svelte', util: 'px-1', reason: 'tab actions container padding, not a bordered control box' },
	{ file: 'src/lib/components/primitives/CollapsibleSection.svelte', util: 'gap-1', reason: 'chevron↔title icon↔label gap in nested twirl-down header' },
	{ file: 'src/lib/components/primitives/CollapsibleSection.svelte', util: 'ml-1', reason: 'nested indent-guide margin (tree depth)' },
	{ file: 'src/lib/components/primitives/CollapsibleSection.svelte', util: 'pl-2', reason: 'nested indent-guide inset (8px, structural depth)' },
	{ file: 'src/lib/components/primitives/AppBar.svelte', util: 'gap-8', reason: 'app-bar chrome: brand↔actions spacer (32px)' },
	{ file: 'src/lib/components/primitives/AppBar.svelte', util: 'pl-2', reason: 'app-bar chrome: fixed left padding (8px)' },
	{ file: 'src/lib/components/primitives/AppBar.svelte', util: 'gap-1.5', reason: 'app-bar chrome: brand-cluster gap (title↔divider↔context)' },
	{ file: 'src/lib/components/primitives/AppBar.svelte', util: 'gap-2', reason: 'app-bar chrome: right-side actions gap (8px)' },

	// feedback
	{ file: 'src/lib/components/feedback/Note.svelte', util: 'gap-1.25', reason: 'status icon↔label gap (intrinsic/tuned)' },
	{ file: 'src/lib/components/feedback/Statistic.svelte', util: 'gap-x-1', reason: 'inline value↔fun-fact baseline gap (intrinsic)' },
	{ file: 'src/lib/components/feedback/Tooltip.svelte', util: 'gap-2', reason: 'tooltip wrapper gap (8px), transient float — not page-density air' },
	{ file: 'src/lib/components/feedback/Tooltip.svelte', util: 'p-2', reason: 'tooltip body inset 8px ≠ pad-box (4px); transient float, fixed' },
	{ file: 'src/lib/components/feedback/Tooltip.svelte', util: 'mr-2', reason: 'icon positioning margin' },
	{ file: 'src/lib/components/feedback/Tooltip.svelte', util: 'mt-0.5', reason: 'icon positioning margin' },

	// buttons — tuned icon spacing (do not flatten; see AGENTS.md button notes)
	{ file: 'src/lib/components/buttons/Button.svelte', util: 'gap-1', reason: 'button icon↔label spacing, tuned per size' },
	{ file: 'src/lib/components/buttons/Button.svelte', util: 'gap-1.25', reason: 'button icon↔label spacing, tuned per size' },
	{ file: 'src/lib/components/buttons/Button.svelte', util: 'pl-0.75', reason: 'button leading-icon optical inset, tuned' },
	{ file: 'src/lib/components/buttons/Button.svelte', util: 'pl-1.25', reason: 'button leading-icon optical inset, tuned' },
	{ file: 'src/lib/components/buttons/SegmentedControl.svelte', util: 'gap-2', reason: 'gap between segmented cluster and reset satellite (8px)' },
	{ file: 'src/lib/components/buttons/SegmentedControl.svelte', util: 'gap-1.5', reason: 'segment icon↔label spacing, tuned' },

	// data-viz — internal geometry
	{ file: 'src/lib/components/data/ProgressBar.svelte', util: 'gap-2', reason: 'label↔value readout row (8px)' },
	{ file: 'src/lib/components/data/CapacityBar.svelte', util: 'gap-x-2', reason: 'legend wrap column spacing' },
	{ file: 'src/lib/components/data/CapacityBar.svelte', util: 'gap-y-1', reason: 'legend wrap row spacing' },
	{ file: 'src/lib/components/data/CapacityBar.svelte', util: 'gap-1', reason: 'swatch↔label gap in a legend item' },
	{ file: 'src/lib/components/data/TimeBrush.svelte', util: 'px-0.5', reason: 'histogram bars inset (2px)' },
	{ file: 'src/lib/components/data/TimeBrush.svelte', util: 'py-0.5', reason: 'histogram bars inset (2px)' },

	// controls — collapsed-border composite geometry, satellite gaps, tuned glyph gaps.
	// The field↔reset-satellite gap (gap-1.5 = 6px) is FIXED, not air: a reset button belongs
	// to its field and must stay glued to it as the form breathes (same reason gap-tight is fixed).
	// (Note a pre-existing 6px/8px inconsistency: Checkbox/Radio use gap-2 for the same relation —
	// a candidate to unify under one gap-satellite role later.)
	{ file: 'src/lib/components/controls/TextInput.svelte', util: 'gap-1.5', reason: 'field↔reset satellite gap (fixed binding)' },
	{ file: 'src/lib/components/controls/SelectInput.svelte', util: 'gap-1.5', reason: 'field↔reset satellite gap (fixed binding)' },
	{ file: 'src/lib/components/controls/ScrubInput.svelte', util: 'gap-1.5', reason: 'field↔reset satellite gap (fixed binding)' },
	{ file: 'src/lib/components/controls/AngleField.svelte', util: 'gap-1.5', reason: 'angle-ring↔input gap, parts of one control (fixed)' },
	{ file: 'src/lib/components/controls/RadioGroupInput.svelte', util: 'gap-1.5', reason: 'horizontal radio-option cluster gap (fixed; sibling to the vertical gap-1)' },
	{ file: 'src/lib/components/controls/TextInput.svelte', util: 'px-1.5', reason: 'affix ghost-button/label-span padding inside [&>…] variant, not the main box' },
	{ file: 'src/lib/components/controls/TextInput.svelte', util: 'px-1', reason: 'borderless input cell padding (wrapper owns the border)' },
	{ file: 'src/lib/components/controls/SelectInput.svelte', util: 'px-1', reason: 'chevron indicator / listbox cell padding, not a control box' },
	{ file: 'src/lib/components/controls/SelectInput.svelte', util: 'py-0.5', reason: 'dropdown group-label cell vertical padding' },
	{ file: 'src/lib/components/controls/SelectInput.svelte', util: 'py-1', reason: 'dropdown option row vertical padding' },
	{ file: 'src/lib/components/controls/ScrubInput.svelte', util: 'px-3', reason: 'unit affix span padding (12px), no role match' },
	{ file: 'src/lib/components/controls/CheckboxInput.svelte', util: 'gap-x-1.25', reason: 'checkbox glyph↔label column gap, tuned' },
	{ file: 'src/lib/components/controls/CheckboxInput.svelte', util: 'gap-2', reason: 'label↔reset satellite gap (8px)' },
	{ file: 'src/lib/components/controls/RadioInput.svelte', util: 'gap-x-1.25', reason: 'radio glyph↔label column gap, tuned' },
	{ file: 'src/lib/components/controls/RadioInput.svelte', util: 'gap-2', reason: 'label↔reset satellite gap (8px)' },
	{ file: 'src/lib/components/controls/RadioGroupInput.svelte', util: 'gap-2', reason: 'radiogroup↔reset satellite row gap (8px)' },
	{ file: 'src/lib/components/controls/RadioGroupInput.svelte', util: 'gap-1', reason: 'vertical gap between radio options (4px, tight cluster)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'gap-x-3', reason: 'slider area↔number-input cluster gap (12px)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'mb-1', reason: 'slider block bottom margin' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'gap-2', reason: 'slider value/track internal geometry (8px)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'gap-0.5', reason: 'slider value-column geometry (2px)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'px-0.5', reason: 'slider value/track/number-input geometry (2px)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'py-1', reason: 'slider track vertical padding' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'pt-1', reason: 'slider endpoint-label top padding' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'mx-0.5', reason: 'slider endpoint-row negative margin' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'gap-1.5', reason: 'slider number-input↔reset satellite gap (fixed)' },
	{ file: 'src/lib/components/controls/Slider.svelte', util: 'px-1', reason: 'slider value↔unit suffix chip padding' },
	{ file: 'src/lib/components/controls/TimecodeField.svelte', util: 'gap-1.5', reason: 'field↔reset satellite gap (fixed)' },
	{ file: 'src/lib/components/controls/TimecodeField.svelte', util: 'px-0.5', reason: 'segmented field cell/separator padding' },
	{ file: 'src/lib/components/controls/BitField.svelte', util: 'gap-1', reason: 'HEX/DEC readout sub-field grid gap (4px)' },
	{ file: 'src/lib/components/controls/BaseField.svelte', util: 'px-1', reason: 'inner label-cell padding (border-r column)' },
	{ file: 'src/lib/components/controls/ToleranceField.svelte', util: 'px-1.5', reason: 'inner border-0 segment; the outer box owns the border' },
	{ file: 'src/lib/components/controls/ToleranceField.svelte', util: 'px-2', reason: '±/unit chip padding (8px), no role match' },
	{ file: 'src/lib/components/controls/ThresholdMarker.svelte', util: 'gap-2', reason: 'track↔input row gap (8px)' },
	{ file: 'src/lib/components/controls/ThresholdMarker.svelte', util: 'px-1.5', reason: 'value↔unit suffix chip (border-l-0 appendage), not the field box' },

	// navigation — list/tree/nav row geometry
	{ file: 'src/lib/components/navigation/Menu.svelte', util: 'gap-1', reason: 'trigger label↔chevron gap' },
	{ file: 'src/lib/components/navigation/Menu.svelte', util: 'my-0.5', reason: 'separator vertical margin' },
	{ file: 'src/lib/components/navigation/Menu.svelte', util: 'py-1', reason: 'menu row vertical padding (list-row geometry)' },
	{ file: 'src/lib/components/navigation/Menu.svelte', util: 'gap-1.5', reason: 'menuitem icon/label/shortcut column gap' },
	{ file: 'src/lib/components/navigation/Menu.svelte', util: 'px-1', reason: 'kbd shortcut badge inner padding' },
	{ file: 'src/lib/components/navigation/Breadcrumb.svelte', util: 'gap-1', reason: 'breadcrumb item cluster gap' },
	{ file: 'src/lib/components/navigation/Breadcrumb.svelte', util: 'px-0.5', reason: 'ellipsis button padding' },
	{ file: 'src/lib/components/navigation/Tree.svelte', util: 'gap-1', reason: 'tree row icon↔label gap' },
	{ file: 'src/lib/components/navigation/Tree.svelte', util: 'py-0.5', reason: 'tree row vertical padding (list-row geometry)' },
	{ file: 'src/lib/components/navigation/Tree.svelte', util: 'pr-1.5', reason: 'asymmetric right padding (row affordance)' },
	{ file: 'src/lib/components/navigation/Pagination.svelte', util: 'gap-1', reason: 'pagination item cluster gap' },

	// optional — footnotes layout (niche feature)
	{ file: 'src/lib/components/optional/Footnote.svelte', util: 'ml-0.5', reason: 'footnote superscript margin' },
	{ file: 'src/lib/components/optional/FootnotesProvider.svelte', util: 'mt-6', reason: 'footnotes section top margin' },
	{ file: 'src/lib/components/optional/FootnotesProvider.svelte', util: 'space-y-1', reason: 'footnotes ordered-list spacing (block flow)' },
	{ file: 'src/lib/components/optional/FootnotesProvider.svelte', util: 'gap-x-3', reason: 'footnotes grid column gap' },
	{ file: 'src/lib/components/optional/FootnotesProvider.svelte', util: 'ml-1', reason: 'footnotes back-reference link margin' },

	// theme
	{ file: 'src/lib/components/theme/ThemeToggle.svelte', util: 'gap-1', reason: 'icon↔label gap inside each toggle segment' },
	{ file: 'src/lib/components/theme/ThemeToggle.svelte', util: 'px-1.25', reason: 'toggle segment inner padding (5px), tuned to the thin bar; no role match' }
];

function tokenize(line) {
	// class tokens live among whitespace/quotes/braces/parens; a token may carry variant
	// prefixes (sm:, hover:, [&_svg]:) and a negative sign — strip to the bare utility.
	return line
		.split(/[\s"'`{}()=<>]+/)
		.map((t) => t.slice(t.lastIndexOf(':') + 1).replace(/^-/, ''))
		.filter(Boolean);
}

function noRawSpacing(file, text) {
	const rel = relative(ROOT, file);
	const violations = [];
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const controlBox = /\bh-control\b|\bh-control-sm\b|\bh-bar\b/.test(line);
		for (const tok of tokenize(line)) {
			const m = tok.match(SPACING_UTIL);
			if (!m) continue;
			const util = m[0];
			const value = parseFloat(m[2]);
			if (value === 0) continue; // reset, not spacing
			const isPadding = /^p[xytblrse]?$/.test(util.split('-')[0]);
			if (isPadding && controlBox) continue; // control's own inner padding
			if (SPACING_ALLOWLIST.some((a) => a.file === rel && a.util === util)) continue;
			violations.push({ rule: 'no-raw-spacing', file: rel, line: i + 1, util });
		}
	}
	return violations;
}

const RULES = [{ name: 'no-raw-spacing', scan: noRawSpacing }];

// ── Run ──────────────────────────────────────────────────────────────────────
const files = walk(COMPONENTS);
const all = [];
for (const f of files) {
	const text = readFileSync(f, 'utf8');
	for (const rule of RULES) all.push(...rule.scan(f, text));
}

if (all.length === 0) {
	console.log(`design-lint: OK — ${files.length} components, 0 raw-value violations`);
	process.exit(0);
}

// group by file for a readable report
const byFile = new Map();
for (const v of all) {
	if (!byFile.has(v.file)) byFile.set(v.file, []);
	byFile.get(v.file).push(v);
}
console.error(`design-lint: ${all.length} violation(s) in ${byFile.size} file(s)\n`);
for (const [file, vs] of [...byFile].sort()) {
	console.error(`  ${file}`);
	for (const v of vs.sort((a, b) => a.line - b.line)) {
		console.error(`    ${String(v.line).padStart(4)}  ${v.rule}: raw "${v.util}" — use a spacing role`);
	}
	console.error('');
}
console.error(
	'Fix: replace with a role (stack-*/gap-* tier, pad-box(-x/-y), pad-control-x, pad-chrome-y),\n' +
		'or, if it is genuinely a control’s own fixed geometry, add it to SPACING_ALLOWLIST with a reason.'
);
process.exit(1);
