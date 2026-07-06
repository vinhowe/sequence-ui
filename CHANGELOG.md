# Changelog

Sequence UI is **copy-in** (shadcn-style) — there are no version numbers. Entries are
dated and flag anything a consumer must do after re-pulling. Your "version" is the
`main` commit SHA you last pulled from — record it in `.sequence-ui.json` and diff via
`github.com/vinhowe/sequence-ui/compare/<your-sha>...main` (see the skill's *Staying up
to date*). Newest first.

## 2026-07-05 — initial changelog

Seeds the log with recent notable and breaking changes. If you copied components before
this date, apply the **Breaking** items below.

### Breaking — type roles (renames)

- **`type-label` is now the SANS field/readout/metric label.** The old **mono uppercase**
  role moved to **`type-tag`**. Action: repoint mono tags (units, HEX/DEC, token names) to
  `type-tag`. Text that used `type-label` for an actual label becomes sans automatically —
  which was almost always what you wanted.
- **`type-caption` → `type-fine`** (fine print only: footnotes, source references, dense
  annotations). Action: rename `type-caption` → `type-fine`. For general *secondary* text,
  switch to muted `type-body` — **don't shrink to de-emphasize** (size = density, color +
  weight = emphasis).

### Breaking — color

- **Accent tokens now resolve to Tailwind palette rungs** behind the semantic names
  (`--primary: var(--color-purple-700)`, etc.); light appearance is unchanged. New
  `--primary-accent` / `--destructive-accent` (a lighter rung in dark) drive the colored
  buttons. Action: **purple is only the default** — pick your own brand hue from
  <https://tailwindcss.com/docs/colors> and swap the `purple` rungs (see `AGENTS.md`).

### Changed — sizing & spacing

- Buttons are shorter: md `h-5.5` (22px) / sm `h-4.5` (18px); horizontal padding tightened
  to `px-1.5` / `px-1`; sm label weight `550`, sm icon stroke `3`.
- Text/value inputs standardized to a padding-based ~23px height; precision fields and
  nav (Pagination page buttons, Tree rows) normalized off ad-hoc fixed heights.
- `--spacing` base is `0.25rem` (4px = 1U).

### Added

- **`AppBar`** primitive + **`--bar-height`** token — fixed integer-px top chrome; never
  use `py-*` for its height.
- **`prose`** utility — running text (panel/section descriptions) that owns its own vertical
  rhythm; use instead of bare `type-body` for paragraphs.
- **`pad-box`** utility — the single content-box inset.
- **`Button`**, **`SegmentedControl`**, **`ProgressBar`** components.

### Design rules

- **No state-transition animations** — a global rule kills every CSS `transition`; never add
  `transition-*` (spinners/indeterminate bars use `@keyframes`).
- **Fixed-px icons** (10 / 11 / 13), decoupled from `--spacing`.
