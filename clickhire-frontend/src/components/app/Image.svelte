<script lang="ts">
    export let src: string;
    export let alt: string;
    export let className: string = '';
    function handleError(e: Event) {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "https://placehold.co/400x300/CCCCCC/FFFFFF?text=IMG";
    }
</script>

<img {src} {alt} class="rounded-lg object-cover {className}" loading="lazy" on:error={handleError} />