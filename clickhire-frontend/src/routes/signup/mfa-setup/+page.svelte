<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import Input from '$components/ui/Input.svelte';
    import Button from '$components/ui/Button.svelte';
    import ErrorMessage from '$components/ui/ErrorMessage.svelte';
    import Loader2 from '$components/icons/Loader2.svelte';
    import { user } from '$lib/stores/authStore';

    import QRCode from 'svelte-qrcode'; // Correct import for svelte-qrcode

    let userId = '';
    let mfaType = '';
    let mfaSecret = '';
    let userEmail = '';
    let setupComplete = false;
    let mfaCode = '';

    let isLoading = false;
    let errorMessage: string | null = null;

    onMount(() => {
        userId = $page.url.searchParams.get('userId') || '';
        mfaType = $page.url.searchParams.get('mfaType') || '';
        mfaSecret = $page.url.searchParams.get('secret') || '';
        userEmail = $page.url.searchParams.get('email') || '';

        if (!userId || !mfaType) {
            errorMessage = "Invalid MFA setup request.";
        }
    });

    async function verifyMfa() {
        errorMessage = null;
        isLoading = true;
        try {
            const mockBackendResponse = await new Promise<Response>(resolve => setTimeout(() => {
                if (mfaCode === '123456') {
                    resolve(new Response(JSON.stringify({ message: 'MFA verified and enabled successfully.', token: 'mock-jwt-token-after-mfa' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                } else {
                    resolve(new Response(JSON.stringify({ message: 'Invalid MFA code.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
                }
            }, 1000));

            const data = await mockBackendResponse.json();

            if (!mockBackendResponse.ok) {
                errorMessage = data.message || 'MFA verification failed. Please try again.';
                return;
            }

            setupComplete = true;

            user.update(current => {
                if (current) {
                    return { ...current, token: data.token };
                }
                return null;
            });

            const currentUser = $user;
            if (currentUser && currentUser.role === 'client') {
                goto('/client/dashboard');
            } else if (currentUser && currentUser.role === 'photographer') {
                goto('/photographer/dashboard');
            } else {
                goto('/login?mfa_setup_success=true');
            }


        } catch (error: any) {
            console.error('Error during MFA verification:', error);
            errorMessage = 'Network error or server unavailable: ' + error.message;
        } finally {
            isLoading = false;
        }
    }

    function generateOtpAuthUri(): string {
        if (!mfaSecret || !userEmail) return '';
        const issuer = 'ClickHire';
        const accountName = userEmail;
        return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${mfaSecret}&issuer=${encodeURIComponent(issuer)}`;
    }
</script>

<div class="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white mt-10">
    <SectionTitle title="Set Up Multi-Factor Authentication (MFA)" subtitle="For enhanced account security." />

    {#if errorMessage && !setupComplete}
        <ErrorMessage message={errorMessage} />
    {:else if setupComplete}
        <div class="text-center text-green-400">
            <p class="text-xl font-semibold mb-4">MFA Setup Complete!</p>
            <p>Your account is now secured with MFA. Redirecting you to your dashboard...</p>
            <Button on:click={() => {
                const currentUser = $user;
                if (currentUser && currentUser.role === 'client') {
                    goto('/client/dashboard');
                } else if (currentUser && currentUser.role === 'photographer') {
                    goto('/photographer/dashboard');
                } else {
                    goto('/login');
                }
            }} class="mt-6">Go to Dashboard</Button>
        </div>
    {:else if mfaType === 'authenticator'}
        <p class="mb-4">
            Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy) or manually enter the secret key.
        </p>
        <div class="flex justify-center mb-6">
            {#if mfaSecret}
                <QRCode value={generateOtpAuthUri()} size={200} level="H" renderAs="svg" fgColor="#fff" bgColor="#1f2937" />
            {:else}
                <p>Loading QR code...</p>
            {/if}
        </div>
        <p class="text-center text-sm font-semibold mb-4">Secret Key: <span class="font-mono bg-gray-700 p-1 rounded">{mfaSecret}</span></p>

        <form on:submit|preventDefault={verifyMfa} class="space-y-4">
            <div>
                <label for="mfaCode" class="block text-sm font-medium mb-1">Enter Authenticator Code</label>
                <Input id="mfaCode" type="text" bind:value={mfaCode} required placeholder="6-digit code" maxlength="6" />
            </div>
            <Button type="submit" disabled={isLoading} class="w-full">
                {#if isLoading}
                    Verifying...
                {:else}
                    Verify and Complete Setup
                {/if}
            </Button>
        </form>
    {:else if mfaType === 'passwordless'}
        <p class="mb-4">
            A passwordless login notification has been sent to your registered phone number/device.
            Please approve the login request to complete your registration.
        </p>
        <div class="text-center">
            <Loader2 class="animate-spin w-10 h-10 text-primary-blue mx-auto" />
            <p class="mt-4">Waiting for your approval...</p>
            <p class="text-sm text-gray-400 mt-2">
                (In a real application, this page would poll the backend for status update or use WebSockets.)
            </p>
            <Button on:click={() => goto('/login')} class="mt-6" variant="outline">Back to Login (Try again)</Button>
        </div>
    {:else}
        <p class="text-center text-red-500">Unknown MFA type or invalid setup.</p>
    {/if}
</div>