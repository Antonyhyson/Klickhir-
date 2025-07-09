<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { isClient, isLoggedIn, user } from '$lib/stores/authStore';
    import { get } from 'svelte/store';

    import Button from '$components/ui/Button.svelte';
    import Card from '$components/ui/Card.svelte';
    import CardHeader from '$components/ui/CardHeader.svelte';
    import CardTitle from '$components/ui/CardTitle.svelte';
    import CardDescription from '$components/ui/CardDescription.svelte';
    import CardContent from '$components/ui/CardContent.svelte';
    import Avatar from '$components/ui/Avatar.svelte';
    import AvatarImage from '$components/ui/AvatarImage.svelte';
    import AvatarFallback from '$components/ui/AvatarFallback.svelte';
    import Badge from '$components/ui/Badge.svelte';

    import MapPin from '$components/icons/MapPin.svelte';
    import CheckCircle from '$components/icons/CheckCircle.svelte';
    import StarIcon from '$components/icons/StarIcon.svelte';
    import MessageCircle from '$components/icons/MessageCircle.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import AppImage from '$components/app/Image.svelte';

    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Photographer } from '$lib/data/mockData';

    let photographerId: string;
    let photographer: Photographer | null = null;
    let loading = true;
    let errorMessage: string | null = null;
    let currentUserRole: 'client' | 'photographer' | null = null;

    onMount(async () => {
        currentUserRole = get(isClient()) ? 'client' : null;

        if (!get(isLoggedIn())) {
            goto('/login');
            return;
        }

        photographerId = $page.params.id;
        if (!photographerId) {
            errorMessage = "Photographer ID is missing.";
            loading = false;
            return;
        }

        await new Promise<void>(resolve => setTimeout(() => {
            photographer = MOCK_PHOTOGRAPHERS.find(p => p.id === photographerId) || null;
            loading = false;
            if (!photographer) {
                errorMessage = "Photographer not found.";
            }
            resolve();
        }, 500));
    });
</script>

<div class="p-6">
    <Button variant="ghost" on:click={() => goto('/client/dashboard')} class="mb-6 text-white hover:text-primary-blue">
        &larr; Back to Dashboard
    </Button>

    {#if loading}
        <div class="flex justify-center items-center h-48">
            <Loader2 class="animate-spin w-8 h-8 text-primary-blue" />
            <p class="ml-3 text-lg text-primary-blue">Loading photographer details...</p>
        </div>
    {:else if errorMessage}
        <p class="text-red-500 text-center">{errorMessage}</p>
    {:else if photographer}
        <Card class="bg-white border-gray-200 mb-8">
            <CardHeader class="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar class="h-24 w-24">
                    <AvatarImage src={photographer.profilePicture} alt={photographer.name} class="object-cover" />
                    <AvatarFallback class="text-4xl">{photographer.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <CardTitle class="text-gray-900">{photographer.name}</CardTitle>
                        {#if photographer.verified}
                            <CheckCircle class="w-5 h-5 text-green-500" />
                            <Badge variant="secondary" class="bg-green-100 text-green-600 border-green-200">
                                Verified
                            </Badge>
                        {/if}
                    </div>
                    <CardDescription class="text-gray-600 flex items-center gap-1">
                        <MapPin class="w-4 h-4" /> {photographer.location}
                    </CardDescription>
                    <div class="flex items-center gap-1 mt-2">
                        {#each Array(5) as _, i}
                            <StarIcon
                                class="h-5 w-5 {i < Math.floor(photographer.rating) ? 'text-yellow-400' : (i < photographer.rating ? 'text-yellow-400/50' : 'text-gray-300')}"
                            />
                        {/each}
                        <span class="text-md text-gray-700 ml-1">
                            {photographer.rating.toFixed(1)} ({photographer.reviews.length} reviews)
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p class="text-gray-800 mb-4">{photographer.bio}</p>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Services Offered:</h4>
                <div class="flex flex-wrap gap-2 mb-6">
                    {#each photographer.services as service}
                        <Badge variant="default">{service}</Badge>
                    {/each}
                </div>

                <h4 class="text-lg font-semibold text-gray-800 mb-2">Camera Kit:</h4>
                <p class="text-gray-700 mb-6">{photographer.cameraKit || 'Not specified.'}</p>

                <h4 class="text-lg font-semibold text-gray-800 mb-2">Portfolio:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {#each photographer.portfolio as item}
                        <div class="group relative overflow-hidden rounded-lg shadow-md">
                            <AppImage src={item.url} alt={item.caption} class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p class="text-white text-sm font-medium">{item.caption}</p>
                            </div>
                        </div>
                    {/each}
                </div>

                <h4 class="text-lg font-semibold text-gray-800 mb-2">Reviews:</h4>
                {#if photographer.reviews.length > 0}
                    <div class="space-y-4">
                        {#each photographer.reviews as review}
                            <div class="border-b pb-4 last:border-b-0">
                                <div class="flex items-center gap-1 mb-1">
                                    {#each Array(5) as _, i}
                                        <StarIcon
                                            class="h-4 w-4 {i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"
                                        />
                                    {/each}
                                    <span class="text-sm font-semibold text-gray-800 ml-2">{review.author}</span>
                                </div>
                                <p class="text-gray-700 text-sm mb-1">{review.comment}</p>
                                <p class="text-gray-500 text-xs">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="text-gray-600">No reviews yet.</p>
                {/if}
            </CardContent>
        </Card>

        {#if currentUserRole === 'client'}
            <Button class="w-full bg-primary-blue hover:bg-primary-blue-hover text-white shadow-lg" on:click={() => { console.log('Message from client to photographer:', photographer.id); goto('/messages'); }}>
                <MessageCircle class="w-5 h-5 mr-2" /> Message {photographer.name}
            </Button>
        {/if}
    {/if}
</div>