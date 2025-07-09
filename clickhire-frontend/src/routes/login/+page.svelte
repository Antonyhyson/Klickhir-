<script lang="ts">
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores/authStore';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Input from '$components/ui/Input.svelte';
    import Button from '$components/ui/Button.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';
    import type { User } from '$lib/stores/authStore';

    let email = '';
    let password = '';
    let isLoading = false;
    let errorMessage: string | null = null;

    async function handleSubmit() {
        errorMessage = null;
        isLoading = true;

        try {
            // In a real app, this would be an API call to your backend
            const response = await new Promise<Response>(resolve => setTimeout(() => {
                if (email === 'client@example.com' && password === 'password') {
                    resolve(new Response(JSON.stringify({
                        message: 'Login successful.',
                        token: 'mock-client-token',
                        user: { id: 'c1', name: 'Emily Brown', role: 'client', email: 'client@example.com' } as User
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                } else if (email === 'photog@example.com' && password === 'password') {
                    resolve(new Response(JSON.stringify({
                        message: 'Login successful.',
                        token: 'mock-photog-token',
                        user: { id: 'p1', name: 'Alice Smith', role: 'photographer', email: 'photog@example.com' } as User
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                } else {
                    resolve(new Response(JSON.stringify({ message: 'Invalid credentials.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
                }
            }, 1000));

            const data = await response.json();

            if (response.ok) {
                user.set(data.user);
                if (data.user.role === 'client') {
                    goto('/client/dashboard');
                } else {
                    goto('/photographer/dashboard');
                }
            } else {
                errorMessage = data.message;
            }
        } catch (error: any) {
            console.error('Login error:', error);
            errorMessage = 'An unexpected error occurred: ' + error.message;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Login to ClickHire" subtitle="Access your client or photographer account." />

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <Input id="email" type="email" bind:value={email} required />
        </div>
        <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <Input id="password" type="password" bind:value={password} required />
        </div>

        <ErrorMessage message={errorMessage} />

        <Button type="submit" disabled={isLoading} class="w-full">
            {#if isLoading}
                Logging in...
            {:else}
                Login
            {/if}
        </Button>
    </form>

    <p class="text-center text-sm text-gray-400 mt-4">
        Don't have an account? <a href="/signup" class="text-primary-blue hover:underline">Register here</a>
    </p>
</div>