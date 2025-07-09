<script lang="ts">
    import { fade } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';

    import Card from '$components/ui/Card.svelte';
    import CardHeader from '$components/ui/CardHeader.svelte';
    import CardTitle from '$components/ui/CardTitle.svelte';
    import CardDescription from '$components/ui/CardDescription.svelte';
    import CardContent from '$components/ui/CardContent.svelte';
    import Avatar from '$components/ui/Avatar.svelte';
    import AvatarImage from '$components/ui/AvatarImage.svelte';
    import AvatarFallback from '$components/ui/AvatarFallback.svelte';
    import Badge from '$components/ui/Badge.svelte';
    import Button from '$components/ui/Button.svelte';

    import MapPin from '$components/icons/MapPin.svelte';
    import CheckCircle from '$components/icons/CheckCircle.svelte';
    import StarIcon from '$components/icons/StarIcon.svelte';
    import MessageCircle from '$components/icons/MessageCircle.svelte';

    import type { Photographer } from '$lib/data/mockData';

    export let photographer: Photographer;
    export let onSelect: (id: string) => void;
    export let currentUserRole: 'client' | 'photographer' | null = null;
</script>

<div
    class="cursor-pointer"
    on:click={() => onSelect(photographer.id)}
    transition:fade={{ duration: 150, easing: quartOut }}
>
    <Card class="bg-white border-gray-200 hover:shadow-lg transition-shadow">
        <CardHeader class="flex flex-row items-center gap-4">
            <Avatar>
                <AvatarImage src={photographer.profilePicture} alt={photographer.name} />
                <AvatarFallback>{photographer.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle class="text-gray-900">{photographer.name}</CardTitle>
                <div class="flex items-center gap-1">
                    <MapPin class="w-4 h-4 text-gray-600" />
                    <CardDescription class="text-gray-600">{photographer.location}</CardDescription>
                </div>
                {#if photographer.verified}
                    <div class="flex items-center gap-1">
                        <CheckCircle class="w-4 h-4 text-green-500" />
                        <Badge variant="secondary" class="bg-green-100 text-green-600 border-green-200">
                            Verified
                        </Badge>
                    </div>
                {/if}
            </div>
        </CardHeader>
        <CardContent>
            <p class="text-gray-700 line-clamp-2">{photographer.bio}</p>
            <div class="mt-4">
                <h4 class="text-sm font-semibold text-gray-700">Services:</h4>
                <div class="flex flex-wrap gap-2 mt-1">
                    {#each photographer.services as service}
                        <Badge variant="outline" class="bg-blue-50 text-blue-700 border-blue-200">
                            {service}
                        </Badge>
                    {/each}
                </div>
            </div>
            <div class="mt-4">
                <h4 class="text-sm font-semibold text-gray-700">Rating:</h4>
                <div class="flex items-center gap-1">
                    {#each Array(5) as _, i}
                        <StarIcon
                            class="h-4 w-4 {i < Math.floor(photographer.rating) ? 'text-yellow-400' : (i < photographer.rating ? 'text-yellow-400/50' : 'text-gray-300')}"
                        />
                    {/each}
                    <span class="text-sm text-gray-600 ml-1">({photographer.reviews.length} reviews)</span>
                </div>
            </CardContent>
            {#if currentUserRole === 'client'}
                <div class="p-6 pt-0">
                    <Button on:click|stopPropagation={() => { console.log('Message Photographer:', photographer.id); }} class="w-full bg-primary-blue hover:bg-primary-blue-hover">
                        <MessageCircle class="w-4 h-4 mr-2" /> Message Photographer
                    </Button>
                </div>
            {/if}
        </Card>
    </div>