<script lang="ts">
  import KatexBlock from "../optional/KatexBlock.svelte";
  import ResetValueButton from "./ResetValueButton.svelte";
  import RadioIcon from "../icons/RadioIcon.svelte";
  import { twMerge } from "tailwind-merge";

  type $$Props = {
    label?: string;
    group: string | number;
    value?: string | number;
    name?: string;
    id: string;
    class?: string;
    labelClass?: string;
    hasDefaultValue?: boolean;
    onReset?: () => void;
    disabled?: boolean;
  };

  let {
    label,
    group = $bindable(""),
    value = undefined,
    name = undefined,
    id,
    class: wrapperClass = "",
    labelClass = "type-body",
    hasDefaultValue = false,
    onReset = undefined,
    disabled = false,
  }: $$Props = $props();
</script>

<label
  for={id}
  class={twMerge(
    `cursor-pointer select-none text-foreground grid grid-cols-[min-content_1fr] gap-x-1.25 shrink-0`,
    wrapperClass,
  )}
>
  <div class="relative inline-flex items-center self-center justify-self-start">
    <input {id} type="radio" bind:group {name} {value} class="sr-only peer" {disabled} />
    <RadioIcon checked={group === value} />
  </div>

  <div class="flex items-center justify-between gap-2 min-w-0">
    {#if label}
      <span class={labelClass}>
        <KatexBlock text={label} />
      </span>
    {/if}
    {#if onReset}
      <ResetValueButton {hasDefaultValue} {onReset} />
    {/if}
  </div>
</label>
