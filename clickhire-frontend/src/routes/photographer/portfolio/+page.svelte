<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isPhotographer, isLoggedIn } from '$lib/stores/authStore';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Button from '$components/ui/Button.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import AppImage from '$components/app/Image.svelte';
    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Photographer } from '$lib/data/mockData';
    import { get } from 'svelte/store';

    let photographerPortfolio: { id: string; url: string; caption: string; location?: string; date?: string; }[] = [];
    let loading = true;
    let currentPhotographer: Photographer | null = null;

    onMount(async () => {
        if (!get(isLoggedIn()) || !get(isPhotographer())) {
            goto('/login');
            return;
        }

        loading = true;
        await new Promise<void>(resolve => setTimeout(() => {
            currentPhotographer = MOCK_PHOTOGRAPHERS.find(p => p.id === '1') || null;
            if (currentPhotographer) {
                photographerPortfolio = currentPhotographer.portfolio;
            }
            loading = false;
            resolve();
        }, 500));
    });

    function handleShare(item: { id: string; url: string; caption: string }) {
        console.log('Share portfolio item:', item);
        alert(`Sharing photo: "${item.caption}" from ${item.url}`);
    }

    function handleContactClient(item: { id: string; url: string; caption: string }) {
        console.log('Contact client for portfolio item:', item);
        alert(`Contacting client related to work: "${item.caption}". This feature would typically lead to a new message thread.`);
    }
</script>

<div class="p-6">
    <SectionTitle title="Your Portfolio" subtitle="Showcase your best work here." />

    <div class="flex justify-end mb-6">
        <Button href="/photographer/portfolio/upload" class="bg-primary-blue hover:bg-primary-blue-hover">Upload New Work</Button>
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading your portfolio...</p>
        </div>
    {:else if photographerPortfolio.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each photographerPortfolio as item (item.id)}
                <div class="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                    <AppImage src={item.url} alt={item.caption} class="w-full h-64 object-cover" />
                    <div class="p-4">
                        <h3 class="text-xl font-semibold text-white mb-2">{item.caption}</h3>
                        <p class="text-gray-400 text-sm mb-4">Location: {item.location || 'Not specified'}, Date: {item.date || 'Not specified'}</p>
                        <div class="flex justify-between items-center">
                            <Button variant="secondary" on:click={() => handleShare(item)} class="text-gray-800 hover:bg-gray-200">
                                Share
                            </Button>
                            <Button variant="default" on:click={() => handleContactClient(item)} class="bg-primary-blue hover:bg-primary-blue-hover">
                                Contact Client
                            </Button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-white text-center">You haven't uploaded any work yet. Click "Upload New Work" to get started!</p>
    {/if}

    <div class="mt-8">
        <SectionTitle title="Your Availability" subtitle="Manage when you are available for bookings." />
        <Button href="/photographer/profile" class="bg-purple-600 hover:bg-purple-700">Set Availability</Button>
        <p class="text-gray-400 mt-2">Current status: {currentPhotographer?.isAvailable ? 'Available' : 'Not Available'}</p>
    </div>
</div>