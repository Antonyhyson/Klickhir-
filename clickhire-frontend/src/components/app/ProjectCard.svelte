<script lang="ts">
    import { fade } from 'svelte/transition';
    import { quartOut } from 'svelte/easing';

    import Card from '$components/ui/Card.svelte';
    import CardHeader from '$components/ui/CardHeader.svelte';
    import CardTitle from '$components/ui/CardTitle.svelte';
    import CardDescription from '$components/ui/CardDescription.svelte';
    import CardContent from '$components/ui/CardContent.svelte';
    import Badge from '$components/ui/Badge.svelte';
    import Button from '$components/ui/Button.svelte';

    import MapPin from '$components/icons/MapPin.svelte';
    import MessageCircle from '$components/icons/MessageCircle.svelte';
    import Briefcase from '$components/icons/Briefcase.svelte';

    import type { Project } from '$lib/data/mockData';

    export let project: Project;
    export let onSelect: (id: string) => void;
    export let currentUserRole: 'client' | 'photographer' | null = null;

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
</script>

<div
    class="cursor-pointer"
    on:click={() => onSelect(project.id)}
    transition:fade={{ duration: 150, easing: quartOut }}
>
    <Card class="bg-white border-gray-200 hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle class="text-gray-900">{project.title}</CardTitle>
            <CardDescription class="text-gray-600 flex items-center gap-1">
                <MapPin class="w-4 h-4" />
                {project.location}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p class="text-gray-700 line-clamp-3">{project.description}</p>
            <div class="mt-4">
                <p class="text-sm text-gray-600">
                    Budget: <span class="text-gray-900 font-semibold">{formatCurrency(project.budget, project.currency)}</span>
                </p>
                <p class="text-sm text-gray-600">
                    Deadline: <span class="text-gray-900 font-semibold">{project.deadline}</span>
                </p>
                <Badge
                    variant="outline"
                    class="mt-2 w-fit {project.status === 'open' ? 'bg-green-100 text-green-700 border-green-300' : project.status === 'in progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-gray-100 text-gray-500 border-gray-300'}"
                >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
            </div>
        </CardContent>
        {#if currentUserRole === 'photographer'}
            <div class="p-6 pt-0 flex gap-2">
                <Button on:click|stopPropagation={() => { console.log('Message Client:', project.clientId); }} class="flex-grow bg-primary-blue hover:bg-primary-blue-hover">
                    <MessageCircle class="w-4 h-4 mr-2" /> Message Client
                </Button>
                <Button on:click|stopPropagation={() => { console.log('Make Offer for project:', project.id); }} class="flex-grow bg-accent-green hover:bg-accent-green-hover">
                    <Briefcase class="w-4 h-4 mr-2" /> Make Offer
                </Button>
            </div>
        {/if}
    </Card>
</div>