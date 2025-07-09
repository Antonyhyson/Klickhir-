<script lang="ts">
    import type { Message } from '$lib/data/mockData';
    export let message: Message;
</script>

<div
    class="mb-2 p-2 rounded-lg max-w-[70%] {message.senderId === 'c1' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}"
>
    <p class="text-sm">{message.text}</p>
    <p class="text-xs text-gray-200 mt-1 text-right">
        {new Date(message.timestamp).toLocaleTimeString()}
    </p>
</div>