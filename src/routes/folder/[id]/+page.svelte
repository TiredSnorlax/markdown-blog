<script lang="ts">
	import InsideFolder from '$lib/components/InsideFolder.svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
</script>

<main>
	{#key $page.params.id}
		<InsideFolder folderId={$page.params.id} />
	{/key}
</main>

<style>
</style>
