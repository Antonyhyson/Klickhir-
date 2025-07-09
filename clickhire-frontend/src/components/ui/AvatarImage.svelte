<script lang="ts">
    export let src: string;
    export let alt: string;
    export let className: string = '';
    function handleError(e: Event) {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "https://placehold.co/100x100/CCCCCC/FFFFFF?text=ERR";
    }
</script>

<img {src} {alt} class="aspect-square h-full w-full {className}" loading="lazy" on:error={handleError} {...$$restProps}/>