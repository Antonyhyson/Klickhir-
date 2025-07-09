<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { isLoggedIn, user } from '$lib/stores/authStore';
    import { get } from 'svelte/store';

    import Button from '$components/ui/Button.svelte';
    import Card from '$components/ui/Card.svelte';
    import CardHeader from '$components/ui/CardHeader.svelte';
    import CardTitle from '$components/ui/CardTitle.svelte';
    import CardDescription from '$components/ui/CardDescription.svelte';
    import CardContent from '$components/ui/CardContent.svelte';
    import Input from '$components/ui/Input.svelte';
    import SectionTitle from '$components/app/SectionTitle.svelte';
    import MessageBubble from '$components/app/MessageBubble.svelte';

    import { MOCK_PHOTOGRAPHERS } from '$lib/data/mockData.ts';
    import type { Message } from '$lib/data/mockData';

    let messages: Message[] = [];
    let newMessageText = '';

    onMount(() => {
        if (!get(isLoggedIn())) {
            goto('/login');
            return;
        }
        messages = [...MOCK_MESSAGES];
    });

    function handleSendMessage() {
        if (newMessageText.trim() === '') return;

        const senderId = get(user)?.id || 'mock_user_id';
        const senderName = get(user)?.name || 'You';

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: senderId,
            senderName: senderName,
            text: newMessageText,
            timestamp: Date.now(),
        };

        messages = [...messages, newMessage];
        newMessageText = '';
        console.log('Sending message:', newMessage);
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    }
</script>

<div class="p-6">
    <Button variant="ghost" on:click={() => goto('/')} class="mb-6 text-white hover:text-primary-blue">
        &larr; Back to Home
    </Button>
    <SectionTitle title="Messages" subtitle="Your conversations with clients and photographers" />
    <Card class="bg-white border-gray-200 h-[60vh] flex flex-col">
        <CardHeader class="flex-none pb-4">
            <CardTitle>Chat with Alice Smith</CardTitle>
            <CardDescription>Active now</CardDescription>
        </CardHeader>
        <CardContent class="flex-grow overflow-y-auto flex flex-col-reverse p-4 pt-0">
            <div class="flex flex-col">
                {#each [...messages].reverse() as message (message.id)}
                    <MessageBubble {message} />
                {/each}
            </div>
        </CardContent>
        <div class="flex-none p-4 border-t border-gray-200">
            <div class="flex gap-2">
                <Input
                    placeholder="Type your message..."
                    class="flex-grow"
                    bind:value={newMessageText}
                    on:keydown={handleKeyDown}
                />
                <Button on:click={handleSendMessage}>Send</Button>
            </div>
        </div>
    </Card>
</div>