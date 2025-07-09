<script lang="ts">
    export let className: string = '';
</script>

<div class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full {className}" {...$$restProps}>
    <slot />
</div>