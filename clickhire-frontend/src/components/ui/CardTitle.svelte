<script lang="ts">
    export let className: string = '';
</script>

<h3 class="text-2xl font-semibold leading-none tracking-tight {className}" {...$$restProps}>
    <slot />
</h3>