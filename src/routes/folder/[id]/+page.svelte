<script lang="ts">
	import InsideFolder from '$lib/components/InsideFolder.svelte';
	import { page } from '$app/stores';
</script>

<main>
	<InsideFolder folderId={$page.params.id} />
</main>

<style>
</style>
