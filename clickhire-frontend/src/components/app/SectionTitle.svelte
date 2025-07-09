<script lang="ts">
    export let title: string;
    export let subtitle: string | undefined = undefined;
</script>

<div class="mb-4">
    <h2 class="text-2xl font-semibold text-white">{title}</h2>
    {#if subtitle}
        <p class="text-white opacity-80">{subtitle}</p>
    {/if}
</div>