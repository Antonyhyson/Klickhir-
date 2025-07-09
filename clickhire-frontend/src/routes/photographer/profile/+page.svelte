<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isPhotographer, isLoggedIn } from '$lib/stores/authStore';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Button from '$components/ui/Button.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';
    import Input from '$components/ui/Input.svelte';
    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData';
    import type { Photographer } from '$lib/data/mockData';
    import { get } from 'svelte/store';

    let currentPhotographer: Photographer | null = null;
    let isAvailable = true;
    let unavailableDates: string[] = [];
    let newUnavailableDate = '';

    let isLoading = false;
    let errorMessage: string | null = null;
    let successMessage: string | null = null;

    onMount(async () => {
        if (!get(isLoggedIn()) || !get(isPhotographer())) {
            goto('/login');
            return;
        }
        isLoading = true;
        await new Promise<void>(resolve => setTimeout(() => {
            currentPhotographer = MOCK_PHOTOGRAPHERS.find(p => p.id === '1') || null;
            isAvailable = true;
            unavailableDates = [];
            isLoading = false;
            resolve();
        }, 500));
    });

    async function saveAvailability() {
        errorMessage = null;
        successMessage = null;
        isLoading = true;
        try {
            const mockBackendResponse = await new Promise<Response>(resolve => setTimeout(() => {
                console.log('Saving Availability:', { isAvailable, unavailableDates });
                resolve(new Response(JSON.stringify({ message: 'Availability updated successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
            }, 1000));

            const data = await mockBackendResponse.json();
            if (mockBackendResponse.ok) {
                successMessage = data.message;
            } else {
                errorMessage = data.message || 'Failed to update availability.';
            }
        } catch (error: any) {
            console.error('Error saving availability:', error);
            errorMessage = 'Network error saving availability: ' + error.message;
        } finally {
            isLoading = false;
        }
    }

    function addUnavailableDate() {
        if (newUnavailableDate && !unavailableDates.includes(newUnavailableDate)) {
            unavailableDates = [...unavailableDates, newUnavailableDate].sort();
            newUnavailableDate = '';
        }
    }

    function removeUnavailableDate(dateToRemove: string) {
        unavailableDates = unavailableDates.filter(date => date !== dateToRemove);
    }
</script>

<div class="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Your Profile & Availability" subtitle="Manage your public profile and set your availability for clients." />

    {#if currentPhotographer}
        <div class="mb-8 p-4 border border-gray-700 rounded-lg">
            <h3 class="text-xl font-semibold text-white mb-2">Basic Profile Info</h3>
            <p class="text-gray-300"><strong>Name:</strong> {currentPhotographer.name}</p>
            <p class="text-gray-300"><strong>Email:</strong> {currentPhotographer.email}</p>
            <p class="text-gray-300"><strong>Location:</strong> {currentPhotographer.location}</p>
            <p class="text-gray-300"><strong>Camera Kit:</strong> {currentPhotographer.cameraKit || 'N/A'}</p>
        </div>
    {/if}

    <div class="space-y-6">
        <h3 class="text-xl font-semibold text-white mb-3">Set Your Availability</h3>
        <div class="flex items-center space-x-2">
            <input
                type="checkbox"
                id="overallAvailability"
                bind:checked={isAvailable}
                class="form-checkbox h-5 w-5 text-primary-blue rounded border-gray-300 focus:ring-primary-blue bg-gray-700"
            />
            <label for="overallAvailability" class="text-lg font-medium text-gray-300">
                I am generally available for new projects
            </label>
        </div>

        <div class="border-t border-gray-700 pt-6">
            <h3 class="text-xl font-semibold mb-3">Specific Unavailable Dates</h3>
            <p class="text-gray-400 mb-4">Add dates when you are fully booked or unavailable.</p>

            <div class="flex gap-2 mb-4">
                <Input type="date" bind:value={newUnavailableDate} class="flex-grow" />
                <Button on:click={addUnavailableDate} disabled={!newUnavailableDate}>Add Date</Button>
            </div>

            {#if unavailableDates.length > 0}
                <div class="flex flex-wrap gap-2">
                    {#each unavailableDates as date}
                        <span class="inline-flex items-center rounded-full bg-red-100 text-red-800 px-3 py-1 text-sm font-medium">
                            {date}
                            <button on:click={() => removeUnavailableDate(date)} class="ml-2 text-red-600 hover:text-red-800 focus:outline-none">
                                &times;
                            </button>
                        </span>
                    {/each}
                </div>
            {:else}
                <p class="text-gray-500">No specific unavailable dates added yet.</p>
            {/if}
        </div>

        <ErrorMessage message={errorMessage} />
        {#if successMessage}
            <p class="text-green-500 text-sm mt-2">{successMessage}</p>
        {/if}

        <Button on:click={saveAvailability} disabled={isLoading} class="w-full bg-primary-blue hover:bg-primary-blue-hover">
            {#if isLoading}
                Saving...
            {:else}
                Save Availability
            {/if}
        </Button>
    </div>
</div>