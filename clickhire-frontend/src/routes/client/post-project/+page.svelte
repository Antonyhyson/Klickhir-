<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isClient, isLoggedIn } from '$lib/stores/authStore';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Input from '$components/ui/Input.svelte';
    import Button from '$components/ui/Button.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';

    let title = '';
    let description = '';
    let photographyType = '';
    let hours = 0;
    let budget = 0;
    let currency = 'GBP';
    let projectDate = '';
    let projectTime = '';
    let location = '';
    let includeTransportationFee = false;

    let isLoading = false;
    let errorMessage: string | null = null;
    let successMessage: string | null = null;

    const currencies = ['USD', 'GBP', 'EUR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
    const photographyTypes = [
        'Wedding Photography', 'Portrait Photography', 'Event Photography',
        'Product Photography', 'Real Estate Photography', 'Landscape Photography',
        'Fashion Photography', 'Food Photography', 'Commercial Photography',
        'Sports Photography', 'Wildlife Photography', 'Documentary Photography'
    ];

    onMount(() => {
        if (!get(isLoggedIn()) || !get(isClient())) {
            goto('/login');
            return;
        }
    });

    async function handleSubmit() {
        errorMessage = null;
        successMessage = null;
        isLoading = true;

        if (!title || !description || !photographyType || hours <= 0 || budget <= 0 || !projectDate || !projectTime || !location) {
            errorMessage = "Please fill in all required fields and ensure numeric values are greater than zero.";
            isLoading = false;
            return;
        }

        try {
            const mockBackendResponse = await new Promise<Response>(resolve => setTimeout(() => {
                console.log('Mock Project Data:', { title, description, photographyType, hours, budget, currency, projectDate, projectTime, location, includeTransportationFee });
                resolve(new Response(JSON.stringify({ message: 'Project posted successfully!', projectId: 'mock_proj_' + Date.now() }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
            }, 1500));

            const data = await mockBackendResponse.json();

            if (!mockBackendResponse.ok) {
                errorMessage = data.message || 'Failed to post project. Please try again.';
                return;
            }

            successMessage = 'Project posted successfully!';
            title = '';
            description = '';
            photographyType = '';
            hours = 0;
            budget = 0;
            projectDate = '';
            projectTime = '';
            location = '';
            includeTransportationFee = false;

            setTimeout(() => goto('/client/dashboard'), 2000);

        } catch (error: any) {
            console.error('Error posting project:', error);
            errorMessage = 'Network error or server unavailable: ' + error.message;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Post a New Project" subtitle="Describe your photography needs and find the right professional." />

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div>
            <label for="title" class="block text-sm font-medium mb-1">Project Title</label>
            <Input id="title" bind:value={title} placeholder="e.g., Engagement Shoot at Hyde Park" required />
        </div>

        <div>
            <label for="description" class="block text-sm font-medium mb-1">Project Description</label>
            <textarea
                id="description"
                bind:value={description}
                class="flex h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                placeholder="Provide details about what you need photographed, style preferences, etc."
                required
            ></textarea>
        </div>

        <div>
            <label for="photographyType" class="block text-sm font-medium mb-1">Type of Photography Needed</label>
            <select
                id="photographyType"
                bind:value={photographyType}
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                required
            >
                <option value="" disabled selected>Select a type</option>
                {#each photographyTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label for="hours" class="block text-sm font-medium mb-1">Estimated Hours</label>
                <Input id="hours" type="number" bind:value={hours} min="1" required />
            </div>
            <div>
                <label for="budget" class="block text-sm font-medium mb-1">Budget</label>
                <div class="flex">
                    <select
                        bind:value={currency}
                        class="h-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-200 text-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue"
                    >
                        {#each currencies as c}
                            <option value={c}>{c}</option>
                        {/each}
                    </select>
                    <Input id="budget" type="number" bind:value={budget} min="1" class="rounded-l-none" required />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label for="date" class="block text-sm font-medium mb-1">Date of Project</label>
                <Input id="date" type="date" bind:value={projectDate} required />
            </div>
            <div>
                <label for="time" class="block text-sm font-medium mb-1">Time of Project</label>
                <Input id="time" type="time" bind:value={projectTime} required />
            </div>
        </div>

        <div>
            <label for="location" class="block text-sm font-medium mb-1">Project Location</label>
            <Input id="location" bind:value={location} placeholder="e.g., Hyde Park, London" required />
            <p class="text-xs text-gray-400 mt-1">Be as specific as possible for better matches.</p>
        </div>

        <div class="flex items-center space-x-2">
            <input
                type="checkbox"
                id="transportationFee"
                bind:checked={includeTransportationFee}
                class="form-checkbox h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue bg-gray-700"
            />
            <label for="transportationFee" class="text-sm font-medium text-gray-300">
                Include separate transportation fee? (Photographers can quote this)
            </label>
        </div>

        <ErrorMessage message={errorMessage} />
        {#if successMessage}
            <p class="text-green-500 text-sm mt-2">{successMessage}</p>
        {/if}

        <Button type="submit" disabled={isLoading} class="w-full bg-primary-blue hover:bg-primary-blue-hover">
            {#if isLoading}
                Posting...
            {:else}
                Post Project
            {/if}
        </Button>
    </form>
</div>