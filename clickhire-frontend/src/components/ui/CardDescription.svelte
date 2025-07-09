<script lang="ts">
    export let className: string = '';
</script>

<p class="text-sm text-text-muted-foreground {className}" {...$$restProps}>
    <slot />
</p>