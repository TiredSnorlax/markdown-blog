<script lang="ts">
	import type { IBlog, IFolder } from '$lib/types';
	import MenuWrapper from '../MenuWrapper.svelte';

	export let blog: IBlog | null;
	export let folder: IFolder | null;
	export let detailsMenuOpen: boolean;
</script>

<MenuWrapper bind:open={detailsMenuOpen}>
	{#if blog}
		<div>
			<p>Type:</p>
			<p>Blog</p>
		</div>
		<div>
			<p>Title:</p>
			<p>{blog.title}</p>
		</div>
		<div>
			<p>Owner:</p>
			<p>{blog.ownerId}</p>
		</div>
		<div>
			<p>Created At:</p>
			<p>{blog.createdAt}</p>
		</div>
		<div>
			<p>Last Edited:</p>
			<p>{blog.lastEdited}</p>
		</div>
	{:else if folder}
		<div>
			<p>Type:</p>
			<p>folder</p>
		</div>
		<div>
			<p>Title:</p>
			<p>{folder.name}</p>
		</div>
		<div>
			<p>Owner:</p>
			<p>{folder.ownerId}</p>
		</div>
		<div>
			<p>Created At:</p>
			<p>{folder.createdAt}</p>
		</div>
		<div>
			<p>Last Edited:</p>
			<p>{folder.lastEdited}</p>
		</div>
	{/if}
</MenuWrapper>

<style>
	div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	div > p:first-child {
		font-weight: bold;
	}
</style>
