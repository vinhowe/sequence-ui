<script lang="ts">
	import FormLabel from './FormLabel.svelte';

	type RadixKey = 'dec' | 'hex' | 'bin' | 'oct';
	type RadixRow = {
		key: RadixKey;
		label: string;
		base: number;
		pattern: RegExp;
	};

	type $$Props = {
		value: number;
		id: string;
		label?: string;
		class?: string;
	};

	let {
		value = $bindable(0),
		id,
		label,
		class: wrapperClass = ''
	}: $$Props = $props();

	const rows: RadixRow[] = [
		{ key: 'dec', label: 'DEC', base: 10, pattern: /^[0-9]+$/ },
		{ key: 'hex', label: 'HEX', base: 16, pattern: /^[0-9a-fA-F]+$/ },
		{ key: 'bin', label: 'BIN', base: 2, pattern: /^[01]+$/ },
		{ key: 'oct', label: 'OCT', base: 8, pattern: /^[0-7]+$/ }
	];

	let focusedKey = $state<RadixKey | null>(null);
	let entries = $state<Record<RadixKey, string>>({
		dec: '0',
		hex: '0',
		bin: '0',
		oct: '0'
	});
	let invalid = $state<Record<RadixKey, boolean>>({
		dec: false,
		hex: false,
		bin: false,
		oct: false
	});

	const normalizedValue = $derived(Math.max(0, Math.trunc(value || 0)));

	function syncEntries() {
		entries = {
			dec: normalizedValue.toString(10),
			hex: normalizedValue.toString(16).toUpperCase(),
			bin: normalizedValue.toString(2),
			oct: normalizedValue.toString(8)
		};
		invalid = { dec: false, hex: false, bin: false, oct: false };
	}

	$effect(() => {
		if (value !== normalizedValue) value = normalizedValue;
		if (focusedKey === null) syncEntries();
	});

	function updateEntry(row: RadixRow, next: string) {
		entries = { ...entries, [row.key]: next };
		if (!row.pattern.test(next)) {
			invalid = { ...invalid, [row.key]: true };
			return;
		}

		const parsed = Number.parseInt(next, row.base);
		if (Number.isNaN(parsed)) {
			invalid = { ...invalid, [row.key]: true };
			return;
		}

		invalid = { ...invalid, [row.key]: false };
		value = parsed;
	}
</script>

<div class={`stack-tight ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel value={label} />
	{/if}
	<div class="border border-border bg-card">
		{#each rows as row, index}
			<div class={`grid grid-cols-[3rem_1fr] items-stretch ${index > 0 ? 'border-t border-border' : ''}`}>
				<label
					for={`${id}-${row.key}`}
					class="flex items-center border-r border-border bg-muted px-1 text-muted-foreground type-label"
				>
					{row.label}
				</label>
				<input
					id={`${id}-${row.key}`}
					type="text"
					inputmode={row.key === 'hex' ? 'text' : 'numeric'}
					value={entries[row.key]}
					class={`h-6 border-0 bg-card px-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-code ${
						invalid[row.key] ? 'border border-destructive' : ''
					}`}
					onfocus={() => focusedKey = row.key}
					onblur={() => {
						focusedKey = null;
						syncEntries();
					}}
					oninput={(event) => updateEntry(row, (event.currentTarget as HTMLInputElement).value)}
				/>
			</div>
		{/each}
	</div>
</div>
