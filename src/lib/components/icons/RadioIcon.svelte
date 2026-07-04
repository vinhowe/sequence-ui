<script lang="ts">
  let { checked }: { checked: boolean } = $props();
</script>

<span
  class="relative h-[13px] w-[13px] shrink-0 rounded-full peer-focus-visible:ring-1 peer-focus-visible:ring-ring"
>
  <svg viewBox="0 0 16 16" class="block h-[13px] w-[13px]" aria-hidden="true">
    <!-- Outer ring -->
    <circle
      cx="8"
      cy="8"
      r="7"
      stroke-width="1"
      class=""
      class:fill-foreground={checked}
      class:fill-muted={!checked}
      class:stroke-foreground={checked}
      class:stroke-border-strong={!checked}
    />
    <!-- Inner dot -->
    <circle
      cx="8"
      cy="8"
      r="4"
      class="fill-background"
      class:opacity-100={checked}
      class:opacity-0={!checked}
    />
  </svg>
</span>
