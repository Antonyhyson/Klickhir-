<script lang="ts">
    import Button from '$components/ui/Button.svelte';
    import SectionTitle from '$components/app/SectionTitle.svelte';
</script>

<div class="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white text-center mt-10">
    <SectionTitle title="Join ClickHire" subtitle="Choose your role to get started!" />

    <div class="flex flex-col sm:flex-row justify-center gap-6 mt-8">
        <div class="flex-1 p-6 border border-gray-700 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <h3 class="text-xl font-semibold mb-3">I am a Client</h3>
            <p class="text-gray-300 mb-6">Find and hire amazing photographers for your projects.</p>
            <Button href="/signup/client" class="w-full bg-primary-blue hover:bg-primary-blue-hover">Register as Client</Button>
        </div>
        <div class="flex-1 p-6 border border-gray-700 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <h3 class="text-xl font-semibold mb-3">I am a Photographer</h3>
            <p class="text-gray-300 mb-6">Discover exciting projects and grow your photography business.</p>
            <Button href="/signup/photographer" class="w-full bg-accent-green hover:bg-accent-green-hover">Register as Photographer</Button>
        </div>
    </div>

    <p class="text-center text-sm text-gray-400 mt-4">
        Already have an account? <a href="/login" class="text-primary-blue hover:underline">Login here</a>
    </p>
</div>