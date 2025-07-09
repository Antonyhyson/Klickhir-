<script lang="ts">
    export let className: string = '';
</script>

<div class="flex h-full w-full items-center justify-center rounded-full bg-gray-200 {className}" {...$$restProps}>
    <slot />
</div>