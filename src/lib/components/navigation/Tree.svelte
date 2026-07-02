<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Component } from 'svelte';

	import ChevronIcon from '../icons/ChevronIcon.svelte';

	export type TreeNode = {
		id: string;
		label: string;
		icon?: Component;
		children?: TreeNode[];
	};

	type TreeRow = {
		node: TreeNode;
		depth: number;
		parentId?: string;
	};
	type $$Props = {
		items: TreeNode[];
		selected: string;
		expanded?: string[];
		class?: string;
	};

	let {
		items,
		selected = $bindable(''),
		expanded = $bindable(undefined),
		class: wrapperClass = ''
	}: $$Props = $props();

	let internalExpanded = $state<string[]>([]);
	let activeId = $state('');
	let rootEl = $state<HTMLDivElement | null>(null);

	const openIds = $derived(expanded ?? internalExpanded);

	function hasChildren(node: TreeNode): boolean {
		return Boolean(node.children && node.children.length > 0);
	}

	function isOpen(id: string): boolean {
		return openIds.includes(id);
	}

	function setOpenIds(next: string[]) {
		if (expanded === undefined) {
			internalExpanded = next;
		} else {
			expanded = next;
		}
	}

	function toggleNode(id: string) {
		setOpenIds(isOpen(id) ? openIds.filter((openId) => openId !== id) : [...openIds, id]);
	}

	function expandNode(id: string) {
		if (!isOpen(id)) setOpenIds([...openIds, id]);
	}

	function collapseNode(id: string) {
		if (isOpen(id)) setOpenIds(openIds.filter((openId) => openId !== id));
	}

	function flatten(nodes: TreeNode[], depth = 0, parentId?: string): TreeRow[] {
		const rows: TreeRow[] = [];
		for (const node of nodes) {
			rows.push({ node, depth, parentId });
			if (hasChildren(node) && isOpen(node.id)) {
				rows.push(...flatten(node.children as TreeNode[], depth + 1, node.id));
			}
		}
		return rows;
	}

	const visibleRows = $derived(flatten(items));

	function rowIndex(id: string): number {
		return visibleRows.findIndex((row) => row.node.id === id);
	}

	function focusIndex(index: number) {
		const row = visibleRows[index];
		if (!row) return;
		activeId = row.node.id;
		queueMicrotask(() => {
			rootEl?.querySelector<HTMLButtonElement>(`[data-row-index="${index}"]`)?.focus();
		});
	}

	function selectRow(row: TreeRow) {
		selected = row.node.id;
		activeId = row.node.id;
		if (hasChildren(row.node)) toggleNode(row.node.id);
	}

	function onRowKeydown(e: KeyboardEvent, row: TreeRow) {
		const index = rowIndex(row.node.id);
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusIndex(Math.min(visibleRows.length - 1, index + 1));
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusIndex(Math.max(0, index - 1));
				break;
			case 'ArrowRight':
				if (hasChildren(row.node)) {
					e.preventDefault();
					if (!isOpen(row.node.id)) {
						expandNode(row.node.id);
					} else {
						focusIndex(Math.min(visibleRows.length - 1, index + 1));
					}
				}
				break;
			case 'ArrowLeft':
				e.preventDefault();
				if (hasChildren(row.node) && isOpen(row.node.id)) {
					collapseNode(row.node.id);
				} else if (row.parentId) {
					const parentIndex = rowIndex(row.parentId);
					if (parentIndex >= 0) focusIndex(parentIndex);
				}
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				selected = row.node.id;
				activeId = row.node.id;
				break;
		}
	}

	$effect(() => {
		if (selected && visibleRows.some((row) => row.node.id === selected)) {
			activeId = selected;
		} else if (!visibleRows.some((row) => row.node.id === activeId)) {
			activeId = visibleRows[0]?.node.id ?? '';
		}
	});
</script>

<div class={twMerge('stack-tight', wrapperClass)} role="tree" bind:this={rootEl}>
	{#each visibleRows as row, i (row.node.id)}
		{@const branch = hasChildren(row.node)}
		{@const open = isOpen(row.node.id)}
		{@const Icon = row.node.icon}
		<button
			type="button"
			role="treeitem"
			aria-level={row.depth + 1}
			aria-selected={selected === row.node.id}
			aria-expanded={branch ? open : undefined}
			tabindex={activeId === row.node.id ? 0 : -1}
			data-row-index={i}
			class={twMerge(
				'flex min-h-7.5 w-full items-center gap-1 py-1 pr-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-body',
				selected === row.node.id ? 'bg-primary/12 text-foreground' : 'text-foreground hover:bg-muted'
			)}
			style={`padding-left: ${0.4 + row.depth * 1.2}rem;`}
			onclick={() => selectRow(row)}
			onfocus={() => (activeId = row.node.id)}
			onkeydown={(e) => onRowKeydown(e, row)}
		>
			<span class="flex h-4 w-4 shrink-0 items-center justify-center text-subtle-foreground">
				{#if branch}
					<ChevronIcon direction={open ? 'down' : 'right'} class="h-3.5 w-3.5" />
				{/if}
			</span>
			{#if Icon}
				<Icon class="h-[13px] w-[13px] shrink-0 text-subtle-foreground" strokeWidth={2.25} aria-hidden="true" />
			{/if}
			<span class="min-w-0 truncate">{row.node.label}</span>
		</button>
	{/each}
</div>
