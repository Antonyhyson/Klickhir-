<script lang="ts">
    import '../app.css'; // Import your global CSS
    import { user, isClient, isPhotographer, logout } from '$lib/stores/authStore';
    import Button from '$components/ui/Button.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    function handleLogout() {
        logout();
        goto('/login'); // Redirect to login page after logout
    }

    let glitterParticles: {
        id: number;
        size: string;
        top: string;
        initialTranslateX: string;
        movementDuration: string;
        twinkleDelay: string;
        twinkleDuration: string;
    }[] = [];

    const NUM_GLITTERS = 50;
    const MIN_SIZE = 2;
    const MAX_SIZE = 6;
    const MIN_MOVEMENT_DURATION = 15;
    const MAX_MOVEMENT_DURATION = 25;
    const MIN_TWINKLE_DURATION = 1;
    const MAX_TWINKLE_DURATION = 3;


    onMount(() => {
        for (let i = 0; i < NUM_GLITTERS; i++) {
            const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
            glitterParticles = [...glitterParticles, {
                id: i,
                size: `${size}px`,
                top: `${Math.random() * 100}%`,
                initialTranslateX: `${-100 * Math.random()}%`,
                movementDuration: `${MIN_MOVEMENT_DURATION + Math.random() * (MAX_MOVEMENT_DURATION - MIN_MOVEMENT_DURATION)}s`,
                twinkleDelay: `${Math.random() * MAX_TWINKLE_DURATION}s`,
                twinkleDuration: `${MIN_TWINKLE_DURATION + Math.random() * (MAX_TWINKLE_DURATION - MIN_TWINKLE_DURATION)}s`,
            }];
        }
    });
</script>

<div class="min-h-screen relative overflow-hidden">
    <div class="glitter-container">
        {#each glitterParticles as particle (particle.id)}
            <div
                class="glitter-particle"
                style="
                    width: {particle.size};
                    height: {particle.size};
                    top: {particle.top};
                    --movement-duration: {particle.movementDuration};
                    --twinkle-duration: {particle.twinkleDuration};
                    transform: translateX({particle.initialTranslateX});
                    --initial-delay: {particle.twinkleDelay};
                "
            ></div>
        {/each}
    </div>

    <header class="bg-gray-800 p-4 shadow-lg sticky top-0 z-10">
        <div class="container flex justify-between items-center">
            <h1 class="text-3xl font-bold text-white">ClickHire</h1>
            <nav>
                <ul class="flex space-x-6 items-center">
                    {#if $user}
                        <li><Button variant="ghost" href="/" class="text-white hover:text-blue-200">Home</Button></li>
                        {#if $isClient()}
                            <li><Button variant="ghost" href="/client/dashboard" class="text-white hover:text-blue-200">My Projects</Button></li>
                            <li><Button variant="default" href="/client/post-project" class="bg-primary-blue hover:bg-primary-blue-hover">Post Project</Button></li>
                        {:else if $isPhotographer()}
                            <li><Button variant="ghost" href="/photographer/dashboard" class="text-white hover:text-blue-200">My Gigs</Button></li>
                            <li><Button variant="ghost" href="/photographer/portfolio" class="text-white hover:text-blue-200">Portfolio</Button></li>
                        {/if}
                        <li><Button variant="ghost" href="/messages" class="text-white hover:text-blue-200">Messages</Button></li>
                        <li><Button on:click={handleLogout} variant="outline" class="text-white border-white hover:bg-white hover:text-gray-800">Logout</Button></li>
                    {:else}
                        <li><Button variant="ghost" href="/login" class="text-white hover:text-blue-200">Login</Button></li>
                        <li><Button variant="default" href="/signup" class="bg-primary-blue hover:bg-primary-blue-hover">Sign Up</Button></li>
                    {/if}
                </ul>
            </nav>
        </div>
    </header>

    <main class="container py-8 z-0 relative">
        <slot />
    </main>
</div>