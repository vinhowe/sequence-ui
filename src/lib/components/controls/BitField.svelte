<script lang="ts">
	import FormLabel from './FormLabel.svelte';

	type $$Props = {
		value: number;
		bits?: 8 | 16 | 32;
		id: string;
		label?: string;
		class?: string;
	};

	let {
		value = $bindable(0),
		bits = 8,
		id,
		label,
		class: wrapperClass = ''
	}: $$Props = $props();

	const cellRefs: HTMLButtonElement[] = [];

	let focusedReadout = $state<'hex' | 'dec' | null>(null);
	let hexText = $state('0x00');
	let decText = $state('0');

	const safeBits = $derived(bits === 16 || bits === 32 ? bits : 8);
	const maxValue = $derived(Math.pow(2, safeBits) - 1);
	const indices = $derived(Array.from({ length: safeBits }, (_, i) => safeBits - 1 - i));
	const hexDigits = $derived(Math.ceil(safeBits / 4));
	const normalizedValue = $derived(Math.max(0, Math.min(maxValue, Math.trunc(value || 0))));

	$effect(() => {
		if (value !== normalizedValue) value = normalizedValue;
		if (focusedReadout !== 'hex') {
			hexText = `0x${normalizedValue.toString(16).toUpperCase().padStart(hexDigits, '0')}`;
		}
		if (focusedReadout !== 'dec') {
			decText = String(normalizedValue);
		}
	});

	function bitOn(bitIndex: number): boolean {
		return Math.floor(normalizedValue / Math.pow(2, bitIndex)) % 2 === 1;
	}

	function toggleBit(bitIndex: number) {
		const weight = Math.pow(2, bitIndex);
		value = bitOn(bitIndex) ? normalizedValue - weight : normalizedValue + weight;
	}

	function focusCell(index: number) {
		cellRefs[index]?.focus();
	}

	function onCellKeydown(event: KeyboardEvent, index: number, bitIndex: number) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				focusCell(Math.max(0, index - 1));
				break;
			case 'ArrowRight':
				event.preventDefault();
				focusCell(Math.min(indices.length - 1, index + 1));
				break;
			case ' ':
			case 'Enter':
				event.preventDefault();
				toggleBit(bitIndex);
				break;
		}
	}

	function commitHex(next: string) {
		hexText = next;
		const trimmed = next.replace(/^0x/i, '');
		if (!/^[0-9a-fA-F]+$/.test(trimmed)) return;
		const parsed = Number.parseInt(trimmed, 16);
		if (parsed >= 0 && parsed <= maxValue) value = parsed;
	}

	function commitDec(next: string) {
		decText = next;
		if (!/^\d+$/.test(next)) return;
		const parsed = Number.parseInt(next, 10);
		if (parsed >= 0 && parsed <= maxValue) value = parsed;
	}
</script>

<div class={`stack-tight ${wrapperClass}`.trim()}>
	{#if label}
		<FormLabel value={label} />
	{/if}
	<div class="stack-field">
		<div class="inline-flex h-control w-fit items-stretch border border-border bg-card">
			{#each indices as bitIndex, index}
				{#if index > 0}
					<div class={index % 4 === 0 ? 'w-1 border-l border-r border-border bg-muted' : 'w-px bg-border'}></div>
				{/if}
				<button
					type="button"
					bind:this={cellRefs[index]}
					aria-label={`Bit ${bitIndex}`}
					aria-pressed={bitOn(bitIndex)}
					class={`w-5 border-0 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value ${
						bitOn(bitIndex) ? 'bg-foreground text-background' : 'bg-card text-muted-foreground'
					}`}
					onclick={() => toggleBit(bitIndex)}
					onkeydown={(event) => onCellKeydown(event, index, bitIndex)}
				>
					{bitOn(bitIndex) ? '1' : '0'}
				</button>
			{/each}
		</div>

		<div class="grid gap-1 sm:grid-cols-2">
			<div class="stack-tight">
				<label for={`${id}-hex`} class="text-muted-foreground type-tag">HEX</label>
				<input
					id={`${id}-hex`}
					type="text"
					inputmode="text"
					value={hexText}
					class="h-control border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
					onfocus={() => focusedReadout = 'hex'}
					onblur={() => focusedReadout = null}
					oninput={(event) => commitHex((event.currentTarget as HTMLInputElement).value)}
				/>
			</div>
			<div class="stack-tight">
				<label for={`${id}-dec`} class="text-muted-foreground type-tag">DEC</label>
				<input
					id={`${id}-dec`}
					type="text"
					inputmode="numeric"
					value={decText}
					class="h-control border border-border bg-card px-1.5 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring type-value"
					onfocus={() => focusedReadout = 'dec'}
					onblur={() => focusedReadout = null}
					oninput={(event) => commitDec((event.currentTarget as HTMLInputElement).value)}
				/>
			</div>
		</div>
	</div>
</div>
