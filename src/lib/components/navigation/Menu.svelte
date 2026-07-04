<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Component, Snippet } from 'svelte';

	import ChevronIcon from '../icons/ChevronIcon.svelte';
	import Portal from '../optional/Portal.svelte';

	type MenuActionItem = {
		label: string;
		icon?: Component;
		shortcut?: string;
		onSelect?: () => void;
		disabled?: boolean;
		destructive?: boolean;
	};
	type MenuSeparatorItem = { separator: true };
	type MenuHeadingItem = { heading: string };

	export type MenuItem = MenuActionItem | MenuSeparatorItem | MenuHeadingItem;

	type $$Props = {
		items: MenuItem[];
		class?: string;
		trigger: Snippet<[open: boolean]>;
	};

	let { items, class: wrapperClass = '', trigger }: $$Props = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let wrapperEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let menuEl = $state<HTMLUListElement | null>(null);
	let placement = $state<'bottom' | 'top'>('bottom');
	let menuStyle = $state('');

	function isActionItem(item: MenuItem): item is MenuActionItem {
		return 'label' in item;
	}

	function isEnabledAction(index: number): boolean {
		const item = items[index];
		return Boolean(item && isActionItem(item) && !item.disabled);
	}

	function firstEnabledIndex(): number {
		for (let i = 0; i < items.length; i++) {
			if (isEnabledAction(i)) return i;
		}
		return -1;
	}

	function nextEnabledIndex(fromIndex: number, direction: 1 | -1): number {
		let i = fromIndex;
		while (true) {
			i += direction;
			if (i < 0 || i >= items.length) return fromIndex;
			if (isEnabledAction(i)) return i;
		}
	}

	function openMenu() {
		if (!isOpen) {
			isOpen = true;
			highlightedIndex = firstEnabledIndex();
			queueMicrotask(() => reposition());
		}
	}

	function closeMenu() {
		if (isOpen) {
			isOpen = false;
			highlightedIndex = -1;
		}
	}

	function toggleMenu() {
		if (isOpen) {
			closeMenu();
		} else {
			openMenu();
		}
	}

	function reposition() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		const desiredWidth = Math.max(rect.width, 160);
		const spaceBelow = viewportHeight - rect.bottom;
		const spaceAbove = rect.top;
		const measured = menuEl?.getBoundingClientRect().height;
		const estimatedMenuHeight = measured && measured > 0 ? measured : 240;
		placement = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

		const menuHeight = measured && measured > 0 ? measured : estimatedMenuHeight;
		const top = placement === 'bottom' ? rect.bottom : rect.top - menuHeight;
		const left = Math.min(Math.max(0, rect.left), Math.max(0, viewportWidth - desiredWidth - 4));
		menuStyle = `left:0;top:0;transform:translate(${left}px,${Math.max(0, top)}px);min-width:${desiredWidth}px;`;
	}

	function selectIndex(index: number) {
		const item = items[index];
		if (!item || !isActionItem(item) || item.disabled) return;
		item.onSelect?.();
		closeMenu();
		queueMicrotask(() => triggerEl?.focus());
	}

	function onTriggerKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) openMenu();
				else highlightedIndex = highlightedIndex < 0 ? firstEnabledIndex() : nextEnabledIndex(highlightedIndex, 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!isOpen) openMenu();
				else highlightedIndex = highlightedIndex < 0 ? firstEnabledIndex() : nextEnabledIndex(highlightedIndex, -1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (!isOpen) openMenu();
				else if (highlightedIndex >= 0) selectIndex(highlightedIndex);
				break;
			case 'Escape':
				if (isOpen) {
					e.preventDefault();
					closeMenu();
				}
				break;
		}
	}

	function onMenuKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = highlightedIndex < 0 ? firstEnabledIndex() : nextEnabledIndex(highlightedIndex, 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = highlightedIndex < 0 ? firstEnabledIndex() : nextEnabledIndex(highlightedIndex, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0) selectIndex(highlightedIndex);
				break;
			case 'Escape':
				e.preventDefault();
				closeMenu();
				queueMicrotask(() => triggerEl?.focus());
				break;
		}
	}

	$effect(() => {
		if (!isOpen) return;
		const onDocPointerDown = (ev: PointerEvent) => {
			const target = ev.target as Node;
			if (!wrapperEl?.contains(target) && !(menuEl && menuEl.contains(target))) {
				closeMenu();
			}
		};
		const onResize = () => reposition();
		const onScroll = () => reposition();
		document.addEventListener('pointerdown', onDocPointerDown, true);
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll, true);
		reposition();
		return () => {
			document.removeEventListener('pointerdown', onDocPointerDown, true);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll, true);
		};
	});
</script>

<div class={twMerge('inline-block', wrapperClass)} bind:this={wrapperEl}>
	<button
		bind:this={triggerEl}
		type="button"
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-controls="sequence-menu"
		onclick={toggleMenu}
		onkeydown={onTriggerKeydown}
		class="inline-flex h-6 items-center gap-1 border border-border bg-panel px-1.5 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-button"
	>
		{@render trigger(isOpen)}
		<ChevronIcon direction={isOpen ? 'down' : 'right'} class="text-subtle-foreground" />
	</button>

	{#if isOpen}
		<Portal target="body">
			<ul
				bind:this={menuEl}
				id="sequence-menu"
				role="menu"
				aria-activedescendant={highlightedIndex >= 0 ? `sequence-menu-item-${highlightedIndex}` : undefined}
				tabindex="-1"
				onkeydown={onMenuKeydown}
				class="fixed z-[9999] max-h-120 overflow-auto rounded-none border border-border bg-popover text-popover-foreground"
				style={menuStyle}
			>
				{#each items as item, i}
					{#if 'separator' in item}
						<li role="separator" class="my-0.5 border-t border-border"></li>
					{:else if 'heading' in item}
						<li
							role="presentation"
							class="px-1.5 py-1 font-sans text-xs font-medium text-muted-foreground select-none"
						>
							{item.heading}
						</li>
					{:else}
						{@const Icon = item.icon}
						<li
							id={`sequence-menu-item-${i}`}
							role="none"
							class:bg-muted={i === highlightedIndex && !item.disabled}
							onpointerenter={() => (!item.disabled ? (highlightedIndex = i) : undefined)}
						>
							<button
								type="button"
								role="menuitem"
								disabled={item.disabled}
								class={twMerge(
									'grid w-full grid-cols-[auto_1fr_auto] items-center gap-1.5 px-1.5 py-1 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body',
									item.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
									item.destructive ? 'text-destructive' : 'text-popover-foreground'
								)}
								onclick={() => selectIndex(i)}
							>
								{#if Icon}
									<Icon class="h-[13px] w-[13px]" strokeWidth={2.25} aria-hidden="true" />
								{:else}
									<span class="h-[13px] w-[13px]"></span>
								{/if}
								<span>{item.label}</span>
								{#if item.shortcut}
									<kbd class="border border-border bg-muted px-1 text-muted-foreground type-label">
										{item.shortcut}
									</kbd>
								{/if}
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		</Portal>
	{/if}
</div>
