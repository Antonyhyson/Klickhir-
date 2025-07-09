<script lang="ts">
    import { onMount } from 'svelte';
    import { isClient, isLoggedIn } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    import SectionTitle from '$components/app/SectionTitle.svelte';
    import PhotographerCard from '$components/app/PhotographerCard.svelte';
    import ProjectCard from '$components/app/ProjectCard.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Photographer, Project } from '$lib/data/mockData';

    let photographers: Photographer[] = [];
    let clientProjects: Project[] = [];
    let loadingPhotographers = true;
    let loadingProjects = true;
    let clientLocation: { lat: number; lon: number } | null = null;
    let currentUserRole: 'client' | 'photographer' | null = null;

    onMount(async () => {
        currentUserRole = get(isClient()) ? 'client' : null;

        if (!get(isLoggedIn()) || !get(isClient())) {
            goto('/login');
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    clientLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    await fetchPhotographers();
                    await fetchClientProjects();
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    fetchPhotographers();
                    fetchClientProjects();
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            await fetchPhotographers();
            await fetchClientProjects();
        }
    });

    async function fetchPhotographers() {
        loadingPhotographers = true;
        try {
            let fetchedPhotographers = [...MOCK_PHOTOGRAPHERS];
            fetchedPhotographers.sort((a, b) => b.rating - a.rating);

            if (clientLocation) {
                const londonPhotographers = fetchedPhotographers.filter(p => p.location.includes('London'));
                const otherPhotographers = fetchedPhotographers.filter(p => !p.location.includes('London'));
                photographers = [...londonPhotographers, ...otherPhotographers];
            } else {
                photographers = fetchedPhotographers;
            }
            photographers = photographers.slice(0, 6);

        } catch (error) {
            console.error("Failed to fetch photographers:", error);
        } finally {
            loadingPhotographers = false;
        }
    }

    async function fetchClientProjects() {
        loadingProjects = true;
        try {
            clientProjects = MOCK_PROJECTS.filter(p => p.clientId === 'c1');
        } catch (error) {
            console.error("Failed to fetch client projects:", error);
        } finally {
            loadingProjects = false;
        }
    }

    function handlePhotographerSelect(id: string) {
        goto(`/client/photographer/${id}`);
    }

    function handleProjectSelect(id: string) {
        goto(`/client/project/${id}`);
    }
</script>

<div class="p-6">
    <SectionTitle title="Find Your Perfect Photographer" subtitle="Explore top-rated professionals based on your needs and location." />

    {#if loadingPhotographers}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading photographers...</p>
        </div>
    {:else if photographers.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {#each photographers as photographer (photographer.id)}
                <PhotographerCard {photographer} onSelect={handlePhotographerSelect} {currentUserRole} />
            {/each}
        </div>
    {:else}
        <p class="text-white text-center">No photographers found at the moment. Try adjusting your search criteria.</p>
    {/if}

    <SectionTitle title="Your Posted Projects" subtitle="View and manage your photography projects." />
    {#if loadingProjects}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading your projects...</p>
        </div>
    {:else if clientProjects.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each clientProjects as project (project.id)}
                <ProjectCard {project} onSelect={handleProjectSelect} currentUserRole="client" />
            {/each}
        </div>
    {:else}
        <p class="text-white text-center">You haven't posted any projects yet. <a href="/client/post-project" class="text-primary-blue hover:underline">Post your first project!</a></p>
    {/if}
</div>