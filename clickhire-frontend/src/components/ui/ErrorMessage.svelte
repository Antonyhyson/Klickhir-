<script lang="ts">
    export let message: string | null = null;
</script>

{#if message}
    <p class="text-red-500 text-sm mt-2">{message}</p>
{/if}