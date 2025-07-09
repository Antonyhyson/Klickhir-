<script lang="ts">
    import Input from '$components/ui/Input.svelte';
    import Button from '$components/ui/Button.svelte';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores/authStore';
    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { User } from '$lib/stores/authStore';

    let firstName = '';
    let lastName = '';
    let email = '';
    let phoneNumber = '';
    let location = '';
    let password = '';
    let confirmPassword = '';
    let cameraKit = '';

    let isLoading = false;
    let errorMessage: string | null = null;

    async function handleSubmit() {
        errorMessage = null;
        if (password !== confirmPassword) {
            errorMessage = "Passwords do not match.";
            return;
        }

        isLoading = true;
        try {
            const mockBackendResponse = await new Promise<Response>(resolve => setTimeout(() => {
                if (MOCK_PHOTOGRAPHERS.some(p => p.email === email)) {
                    resolve(new Response(JSON.stringify({ message: 'Email already registered.' }), { status: 409, headers: { 'Content-Type': 'application/json' } }));
                    return;
                }
                resolve(new Response(JSON.stringify({
                    message: 'Photographer registered successfully. Please set up MFA.',
                    userId: 'mock_photog_' + Date.now(),
                    mfaSecret: 'JBSWY3DPEHPK3PXP',
                    mfaType: 'authenticator',
                    email: email
                }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
            }, 1000));

            const data = await mockBackendResponse.json();

            if (!mockBackendResponse.ok) {
                errorMessage = data.message || 'Registration failed. Please try again.';
                return;
            }

            console.log('Photographer Registration successful:', data);
            user.set({
                id: data.userId,
                name: `${firstName} ${lastName}`,
                role: 'photographer',
                token: null,
                email: data.email
            } as User);

            goto(`/signup/mfa-setup?userId=${data.userId}&mfaType=${data.mfaType}&secret=${data.mfaSecret}&email=${data.email}`);

        } catch (error: any) {
            console.error('Error during photographer registration:', error);
            errorMessage = 'Network error or server unavailable: ' + error.message;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Photographer Registration" subtitle="Create your account to find projects." />

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
            <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
            <Input id="firstName" bind:value={firstName} required />
        </div>
        <div>
            <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
            <Input id="lastName" bind:value={lastName} required />
        </div>
        <div>
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <Input id="email" type="email" bind:value={email} required />
        </div>
        <div>
            <label for="phoneNumber" class="block text-sm font-medium mb-1">Phone Number</label>
            <Input id="phoneNumber" type="tel" bind:value={phoneNumber} placeholder="+44 7911 123456" />
        </div>
        <div>
            <label for="location" class="block text-sm font-medium mb-1">Location</label>
            <Input id="location" bind:value={location} placeholder="e.g., London, UK" required />
        </div>
        <div>
            <label for="cameraKit" class="block text-sm font-medium mb-1">Camera Kit (e.g., "Canon R5, Sony A7III")</label>
            <Input id="cameraKit" bind:value={cameraKit} placeholder="List your primary camera gear" />
        </div>
        <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <Input id="password" type="password" bind:value={password} required minlength="8" />
            <p class="text-xs text-gray-400 mt-1">Minimum 8 characters.</p>
        </div>
        <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-1">Confirm Password</label>
            <Input id="confirmPassword" type="password" bind:value={confirmPassword} required />
        </div>

        <ErrorMessage message={errorMessage} />

        <Button type="submit" disabled={isLoading} class="w-full">
            {#if isLoading}
                Registering...
            {:else}
                Register
            {/if}
        </Button>
    </form>

    <p class="text-center text-sm text-gray-400 mt-4">
        Already have an account? <a href="/login" class="text-primary-blue hover:underline">Login here</a>
    </p>
</div>