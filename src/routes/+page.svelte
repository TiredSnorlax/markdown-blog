<script lang="ts">
	import NewBlogDialog from '$lib/components/home/NewBlogDialog.svelte';

	let dialogOpen = false;
</script>

<main>
	<h1>Dashboard</h1>

	<h2>My Blogs</h2>
	<button on:click={() => (dialogOpen = true)}>Create</button>

	<NewBlogDialog bind:dialogOpen />
</main>

<style>
</style>
