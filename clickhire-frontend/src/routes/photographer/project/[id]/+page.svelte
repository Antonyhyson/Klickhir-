<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { isPhotographer, isLoggedIn, user } from '$lib/stores/authStore';
    import { get } from 'svelte/store';

    import Button from '$components/ui/Button.svelte';
    import Card from '$components/ui/Card.svelte';
    import CardHeader from '$components/ui/CardHeader.svelte';
    import CardTitle from '$components/ui/CardTitle.svelte';
    import CardDescription from '$components/ui/CardDescription.svelte';
    import CardContent from '$components/ui/CardContent.svelte';
    import Badge from '$components/ui/Badge.svelte';

    import MapPin from '$components/icons/MapPin.svelte';
    import Briefcase from '$components/icons/Briefcase.svelte';
    import MessageCircle from '$components/icons/MessageCircle.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import AppImage from '$components/app/Image.svelte';

    import { MOCK_PROJECTS, MOCK_OFFERS, MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Project, Offer, Photographer } from '$lib/data/mockData';

    let projectId: string;
    let project: Project | null = null;
    let projectOffers: Offer[] = [];
    let loading = true;
    let errorMessage: string | null = null;
    let currentUserRole: 'client' | 'photographer' | null = null;

    onMount(async () => {
        currentUserRole = get(isPhotographer()) ? 'photographer' : null;

        if (!get(isLoggedIn())) {
            goto('/login');
            return;
        }

        projectId = $page.params.id;
        if (!projectId) {
            errorMessage = "Project ID is missing.";
            loading = false;
            return;
        }

        await new Promise<void>(resolve => setTimeout(() => {
            project = MOCK_PROJECTS.find(p => p.id === projectId) || null;
            projectOffers = MOCK_OFFERS.filter(o => o.projectId === projectId);
            loading = false;
            if (!project) {
                errorMessage = "Project not found.";
            }
            resolve();
        }, 500));
    });

    function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
        try {
            return new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        } catch (e) {
            console.warn(`Could not format currency for ${currencyCode}:`, e);
            return `${currencyCode} ${amount.toLocaleString()}`;
        }
    }

    function handleMakeOffer() {
        console.log('Initiating offer for project:', project?.id);
        alert('Make Offer feature to be implemented!');
    }

    function handleMessageClient() {
        console.log('Messaging client for project:', project?.clientId);
        alert('Message Client feature to be implemented!');
        goto('/messages');
    }
</script>

<div class="p-6">
    <Button variant="ghost" on:click={() => goto('/photographer/dashboard')} class="mb-6 text-white hover:text-primary-blue">
        &larr; Back to Dashboard
    </Button>

    {#if loading}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading project details...</p>
        </div>
    {:else if errorMessage}
        <p class="text-red-500 text-center">{errorMessage}</p>
    {:else if project}
        <Card class="bg-white border-gray-200 mb-8">
            <CardHeader>
                <CardTitle class="text-gray-900">{project.title}</CardTitle>
                <CardDescription class="text-gray-600 flex items-center gap-1">
                    <MapPin class="w-4 h-4" /> {project.location}
                </CardDescription>
                <Badge
                    variant="outline"
                    class="mt-2 w-fit {project.status === 'open' ? 'bg-green-100 text-green-700 border-green-300' : project.status === 'in progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-gray-100 text-gray-500 border-gray-300'}"
                >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
            </CardHeader>
            <CardContent>
                <p class="text-gray-800 mb-4">{project.description}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 mb-4">
                    <p><strong>Client:</strong> {project.clientName}</p>
                    <p><strong>Photography Type:</strong> {project.photographyType}</p>
                    <p><strong>Estimated Hours:</strong> {project.hours}</p>
                    <p><strong>Budget:</strong> {formatCurrency(project.budget, project.currency)}</p>
                    <p><strong>Deadline:</strong> {project.deadline}</p>
                    <p><strong>Date:</strong> {project.projectDate} at {project.projectTime}</p>
                    <p><strong>Transportation Fee:</strong> {project.includeTransportationFee ? 'Included' : 'Not included'}</p>
                    <p><strong>Collaboration:</strong> {project.collaborative ? 'Yes' : 'No'}</p>
                </div>

                {#if project.referenceImages && project.referenceImages.length > 0}
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">Reference Images:</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                        {#each project.referenceImages as imageUrl}
                            <div class="overflow-hidden rounded-lg shadow-sm">
                                <AppImage src={imageUrl} alt="Reference Image" class="w-full h-32 object-cover" />
                            </div>
                        {/each}
                    </div>
                {/if}

                <h4 class="text-lg font-semibold text-gray-800 mb-2">Offers for this Project:</h4>
                {#if projectOffers.length > 0}
                    <div class="space-y-4">
                        {#each projectOffers as offer}
                            <div class="border-b pb-4 last:border-b-0">
                                <div class="flex items-center justify-between mb-1">
                                    <p class="font-semibold text-gray-800">
                                        Offer from {MOCK_PHOTOGRAPHERS.find(p => p.id === offer.photographerId)?.name || 'Unknown Photographer'}
                                    </p>
                                    <Badge
                                        variant="secondary"
                                        class="{offer.status === 'pending' ? 'bg-blue-100 text-blue-700 border-blue-300' : offer.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}"
                                    >
                                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                    </Badge>
                                </div>
                                <p class="text-gray-700 text-sm mb-1">Price: <span class="font-bold">{formatCurrency(offer.price, project.currency)}</span></p>
                                <p class="text-gray-600 text-sm">{offer.notes}</p>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="text-gray-600">No offers yet for this project.</p>
                {/if}
            </CardContent>
        </Card>

        {#if currentUserRole === 'photographer'}
            <div class="flex gap-2 mt-6">
                <Button on:click={handleMessageClient} class="flex-grow bg-primary-blue hover:bg-primary-blue-hover text-white shadow-lg">
                    <MessageCircle class="w-5 h-5 mr-2" /> Message Client
                </Button>
                <Button on:click={handleMakeOffer} class="flex-grow bg-accent-green hover:bg-accent-green-hover text-white shadow-lg">
                    <Briefcase class="w-5 h-5 mr-2" /> Make an Offer
                </Button>
            </div>
        {/if}
    {/if}
</div>