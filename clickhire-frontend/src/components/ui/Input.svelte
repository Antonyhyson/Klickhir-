<script lang="ts">
    export let className: string = '';
    export let type: string = 'text';
    export let placeholder: string = '';
    export let value: string = '';
</script>

<input
    {type}
    class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 {className}"
    {placeholder}
    bind:value
    on:keydown
    on:input
    {...$$restProps}
/>