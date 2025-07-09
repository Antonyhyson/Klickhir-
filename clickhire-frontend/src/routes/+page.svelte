<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isLoggedIn, isClient, isPhotographer } from '$lib/stores/authStore';

    onMount(() => {
        if (isLoggedIn()) {
            if (isClient()) {
                goto('/client/dashboard');
            } else if (isPhotographer()) {
                goto('/photographer/dashboard');
            } else {
                // Fallback if role is not recognized or not yet set
                goto('/login');
            }
        } else {
            goto('/login'); // Redirect to login if not authenticated
        }
    });
</script>

<div class="flex justify-center items-center h-[calc(100vh-120px)] text-white">
    <p>Redirecting...</p>
</div>