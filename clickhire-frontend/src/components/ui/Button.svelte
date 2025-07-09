<script lang="ts">
    export let variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
    export let className: string = '';
    export let disabled: boolean = false;
    export let href: string | null = null;

    let baseStyles: string = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
    let variantStyles: string = "";

    $: {
        switch (variant) {
            case 'default':
                variantStyles = "bg-primary-blue text-white hover:bg-primary-blue-hover shadow-md";
                break;
            case 'outline':
                variantStyles = "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm";
                break;
            case 'secondary':
                variantStyles = "bg-gray-100 text-gray-800 hover:bg-gray-200";
                break;
            case 'ghost':
                variantStyles = "hover:bg-gray-100 hover:text-gray-900";
                break;
            case 'link':
                variantStyles = "text-primary-blue underline-offset-4 hover:underline";
                break;
            default:
                variantStyles = "bg-primary-blue text-white hover:bg-primary-blue-hover shadow-md";
        }
    }
</script>

{#if href}
    <a {href} class="{baseStyles} {variantStyles} {className}" {disabled} {...$$restProps}>
        <slot />
    </a>
{:else}
    <button class="{baseStyles} {variantStyles} {className}" {disabled} {...$$restProps}>
        <slot />
    </button>
{/if}