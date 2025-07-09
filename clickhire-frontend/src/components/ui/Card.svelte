<script lang="ts">
    export let className: string = '';
</script>

<div class="rounded-lg border bg-card-bg text-text-dark shadow-sm {className}" {...$$restProps}>
    <slot />
</div>