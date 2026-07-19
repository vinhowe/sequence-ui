/**
 * Control-height invariant audit (seed of the optical audit suite).
 *
 * THE invariant: every single-line boxed control is EXACTLY 22px (`h-control`)
 * or 18px (`h-control-sm`) tall. Padding-derived heights drift by a pixel across
 * components and break composed rows; fixed named heights make alignment free.
 *
 * How to run today: paste/eval `auditControlHeights()` in the browser console
 * (or via an automation eval) on any rendered page — the gallery and /examples
 * routes are the intended targets, in BOTH themes. CI-ification (Playwright)
 * lands with the full optical suite.
 *
 * Blessed exemptions (not boxed single-line controls):
 *   - app-bar chrome (its own --bar-height domain)
 *   - inline glyph controls: checkbox/radio glyphs
 *   - multi-line/areas, list rows (menu items, tree rows, select options)
 *   - data-viz surfaces (progress/capacity tracks, TimeBrush) and slider thumbs
 */
function auditControlHeights() {
	// Density-aware: read the actual control heights from the tokens rather than
	// hardcoding 22/18, so the invariant ("all controls == h-control") holds at any
	// --density. Probe an element to resolve the computed px value.
	const probe = document.createElement('div');
	probe.style.cssText = 'position:absolute;visibility:hidden;height:var(--spacing-control)';
	document.body.appendChild(probe);
	const CONTROL_H = Math.round(probe.getBoundingClientRect().height) || 22;
	probe.style.height = 'var(--spacing-control-sm)';
	const CONTROL_H_SM = Math.round(probe.getBoundingClientRect().height) || 18;
	probe.remove();
	const OK = new Set([CONTROL_H, CONTROL_H_SM]);

	const isExempt = (el) => {
		if (
			el.closest('header') || // app bar domain
			el.closest('[role="menu"], [role="listbox"], [role="tree"], ul') || // list rows
			el.matches('textarea, [type="checkbox"], [type="radio"], [type="range"]') ||
			el.closest('label') || // checkbox/radio composites
			el.matches('[role="slider"]') // thumbs/markers
		) {
			return true;
		}
		const cs = getComputedStyle(el);
		if (cs.position === 'absolute') return true; // drag handles/markers
		// Borderless innards of a compliant composite (the wrapper carries the height):
		if (parseFloat(cs.borderTopWidth) === 0 && el.closest('.h-control, .h-control-sm') !== el && el.closest('.h-control, .h-control-sm')) {
			return true;
		}
		// Borderless glyph-only buttons (e.g. reset ↺) are inline glyph controls:
		if (
			el.matches('button') &&
			parseFloat(cs.borderTopWidth) === 0 &&
			!el.classList.contains('h-control') &&
			!el.classList.contains('h-control-sm') &&
			(el.textContent || '').trim() === ''
		) {
			return true;
		}
		return false;
	};

	const candidates = [
		// Everything that claims the invariant must honor it exactly:
		...document.querySelectorAll('.h-control, .h-control-sm'),
		// And every boxed control should be claiming it:
		...document.querySelectorAll('button, input, select')
	];

	const seen = new Set();
	const failures = [];
	for (const el of candidates) {
		if (seen.has(el) || seen.add(el), isExempt(el)) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 && r.height === 0) continue; // hidden
		const h = Math.round(r.height);
		const claims = el.classList.contains('h-control')
			? CONTROL_H
			: el.classList.contains('h-control-sm')
				? CONTROL_H_SM
				: null;
		const pass = claims !== null ? h === claims : OK.has(h);
		if (!pass) {
			failures.push({
				height: h,
				claims,
				tag: el.tagName.toLowerCase(),
				cls: el.className.toString().slice(0, 80),
				text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)
			});
		}
	}
	return { checked: seen.size, failures, cursorFailures: auditCursorPolicy() };
}

/**
 * Cursor-policy invariant (desktop convention): the pointing hand means
 * NAVIGATION — only real links (`<a href>`) may show `cursor: pointer`.
 * Controls (buttons, inputs, selects, role=button/tab/radio rows) show the
 * arrow; drag mechanics show their mechanic cursor (ew-resize, grab), which
 * this check permits. `not-allowed` is banned everywhere (disabled = opacity).
 */
function auditCursorPolicy() {
	const failures = [];
	const controls = document.querySelectorAll(
		'button, input, select, [role="button"], [role="tab"], [role="radio"], [role="menuitem"], [role="option"], [role="treeitem"]'
	);
	for (const el of controls) {
		const cur = getComputedStyle(el).cursor;
		if (cur === 'pointer' || cur === 'not-allowed') {
			failures.push({
				cursor: cur,
				tag: el.tagName.toLowerCase(),
				cls: el.className.toString().slice(0, 60),
				text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 25)
			});
		}
	}
	// Links must keep the pointer (don't let a reset strip it):
	for (const a of document.querySelectorAll('a[href]')) {
		if (getComputedStyle(a).cursor !== 'pointer') {
			failures.push({ cursor: getComputedStyle(a).cursor, tag: 'a', text: (a.textContent || '').trim().slice(0, 25), expected: 'pointer' });
		}
	}
	return failures;
}
