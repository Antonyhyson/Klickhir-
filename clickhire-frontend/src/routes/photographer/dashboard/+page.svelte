<script lang="ts">
    import { onMount } from 'svelte';
    import { isPhotographer, isLoggedIn } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    import SectionTitle from '$components/app/SectionTitle.svelte';
    import ProjectCard from '$components/app/ProjectCard.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Project } from '$lib/data/mockData';


    let nearbyProjects: Project[] = [];
    let collaborativeProjects: Project[] = [];
    let loadingNearby = true;
    let loadingCollaborative = true;
    let photographerLocation: { lat: number; lon: number } | null = null;
    let currentUserRole: 'client' | 'photographer' | null = null;

    onMount(async () => {
        currentUserRole = get(isPhotographer()) ? 'photographer' : null;

        if (!get(isLoggedIn()) || !get(isPhotographer())) {
            goto('/login');
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    photographerLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    await fetchProjects();
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    fetchProjects();
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            await fetchProjects();
        }
    });

    async function fetchProjects() {
        loadingNearby = true;
        loadingCollaborative = true;
        try {
            const allProjects = [...MOCK_PROJECTS];

            if (photographerLocation) {
                const londonProjects = allProjects.filter(p => p.location.includes('London'));
                const manchesterProjects = allProjects.filter(p => p.location.includes('Manchester'));
                const edinburghProjects = allProjects.filter(p => p.location.includes('Edinburgh'));

                nearbyProjects = [
                    ...londonProjects.filter(p => p.status === 'open'),
                    ...manchesterProjects.filter(p => p.status === 'open'),
                    ...edinburghProjects.filter(p => p.status === 'open')
                ];
            } else {
                nearbyProjects = allProjects.filter(p => p.status === 'open');
            }

            collaborativeProjects = allProjects.filter(p => p.collaborative && p.status === 'open');

        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            loadingNearby = false;
            loadingCollaborative = false;
        }
    }

    function handleProjectSelect(id: string) {
        goto(`/photographer/project/${id}`);
    }
</script>

<div class="p-6">
    <SectionTitle title="Nearby Opportunities" subtitle="Discover projects posted by clients in your area." />

    {#if loadingNearby}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading nearby projects...</p>
        </div>
    {:else if nearbyProjects.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {#each nearbyProjects as project (project.id)}
                <ProjectCard {project} onSelect={handleProjectSelect} {currentUserRole} />
            {/each}
        </div>
    {:else}
        <p class="text-white text-center">No nearby projects found at the moment.</p>
    {/if}

    <SectionTitle title="Collaborative Highlights" subtitle="Projects where you can team up with other photographers." />

    {#if loadingCollaborative}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading collaborative projects...</p>
        </div>
    {:else if collaborativeProjects.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each collaborativeProjects as project (project.id)}
                <ProjectCard {project} onSelect={handleProjectSelect} {currentUserRole} />
            {/each}
        </div>
    {:else}
        <p class="text-white text-center">No collaborative projects highlighted at the moment.</p>
    {/if}
</div>