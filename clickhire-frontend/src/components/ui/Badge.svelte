<script lang="ts">
    export let variant: 'default' | 'secondary' | 'outline' = 'default';
    export let className: string = '';
    let baseStyles: string = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"; // Adjusted focus-visible
    let variantStyles: string = "";

    $: {
        switch (variant) {
            case 'default':
                variantStyles = "border-transparent bg-primary-blue text-white hover:bg-primary-blue-hover";
                break;
            case 'secondary':
                variantStyles = "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200";
                break;
            case 'outline':
                variantStyles = "text-gray-900 border-gray-300"; // Changed text-foreground to text-gray-900
                break;
            default:
                variantStyles = "border-transparent bg-primary-blue text-white hover:bg-primary-blue-hover";
        }
    }
</script>

<div class="{baseStyles} {variantStyles} {className}" {...$$restProps}>
    <slot />
</div>