<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isPhotographer, isLoggedIn } from '$lib/stores/authStore';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Input from '$components/ui/Input.svelte';
    import Button from '$components/ui/Button.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';
    import ImageIcon from '$components/icons/ImageIcon.svelte';
    import { get } from 'svelte/store';

    let projectTitle = '';
    let description = '';
    let location = '';
    let dateTaken = '';
    let photoFile: File | null = null;

    let isLoading = false;
    let errorMessage: string | null = null;
    let successMessage: string | null = null;
    let previewImage: string | ArrayBuffer | null = null;

    onMount(() => {
        if (!get(isLoggedIn()) || !get(isPhotographer())) {
            goto('/login');
            return;
        }
    });

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files ? target.files[0] : null;
        if (file && file.type.startsWith('image/')) {
            photoFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage = e.target?.result || null;
            };
            reader.readAsDataURL(file);
        } else {
            photoFile = null;
            previewImage = null;
            errorMessage = "Please select a valid image file (JPEG, PNG, GIF).";
        }
    }

    async function handleSubmit() {
        errorMessage = null;
        successMessage = null;
        isLoading = true;

        if (!photoFile || !projectTitle || !location || !dateTaken) {
            errorMessage = "Please fill in all required fields and select a photo.";
            isLoading = false;
            return;
        }

        try {
            const mockBackendResponse = await new Promise<Response>(resolve => setTimeout(() => {
                console.log('Mock Upload Data:', { projectTitle, description, location, dateTaken, fileName: photoFile?.name });
                resolve(new Response(JSON.stringify({ message: 'Work uploaded successfully!', imageUrl: 'https://placehold.co/400x300/CCCCCC/FFFFFF?text=Uploaded+Image' }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
            }, 1500));

            const data = await mockBackendResponse.json();

            if (!mockBackendResponse.ok) {
                errorMessage = data.message || 'Failed to upload work. Please try again.';
                return;
            }

            successMessage = 'Work uploaded successfully!';
            projectTitle = '';
            description = '';
            location = '';
            dateTaken = '';
            photoFile = null;
            previewImage = null;

            setTimeout(() => goto('/photographer/portfolio'), 2000);

        } catch (error: any) {
            console.error('Error uploading work:', error);
            errorMessage = 'Network error or server unavailable: ' + error.message;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Upload Your Work" subtitle="Showcase your best photography projects to potential clients." />

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div>
            <label for="photoFile" class="block text-sm font-medium mb-1">Upload Photo</label>
            <input
                type="file"
                id="photoFile"
                accept="image/*"
                on:change={handleFileChange}
                class="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary-blue file:text-white
                       hover:file:bg-primary-blue-hover
                       cursor-pointer"
                required
            />
            {#if previewImage}
                <div class="mt-4 border border-gray-700 rounded-lg overflow-hidden">
                    <img src={previewImage as string} alt="Preview" class="w-full h-auto max-h-64 object-contain" />
                </div>
            {:else}
                <div class="mt-4 h-32 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg text-gray-500">
                    <ImageIcon class="w-10 h-10 mr-2" /> Select an image to preview
                </div>
            {/if}
        </div>

        <div>
            <label for="projectTitle" class="block text-sm font-medium mb-1">Project Name / Photo Title</label>
            <Input id="projectTitle" bind:value={projectTitle} placeholder="e.g., 'Sunset Wedding at Big Ben'" required />
        </div>

        <div>
            <label for="description" class="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
                id="description"
                bind:value={description}
                class="flex h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                placeholder="Briefly describe the project or photo context."
            ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label for="location" class="block text-sm font-medium mb-1">Location of Photo</label>
                <Input id="location" bind:value={location} placeholder="e.g., Westminster Abbey, London" required />
            </div>
            <div>
                <label for="dateTaken" class="block text-sm font-medium mb-1">Date Taken</label>
                <Input id="dateTaken" type="date" bind:value={dateTaken} required />
            </div>
        </div>

        <ErrorMessage message={errorMessage} />
        {#if successMessage}
            <p class="text-green-500 text-sm mt-2">{successMessage}</p>
        {/if}

        <Button type="submit" disabled={isLoading} class="w-full bg-primary-blue hover:bg-primary-blue-hover">
            {#if isLoading}
                Uploading...
            {:else}
                Upload Work
            {/if}
        </Button>
    </form>
</div>