<script lang="ts">
	import type { IFolder } from '$lib/types';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	export let newFolderMenuOpen: boolean;
	export let currentPath: string | undefined;
	export let currentId: string;

	let user = userStore(auth);

	let newName = '';

	const createNewFolder = async () => {
		if (!$user) return;
		if (!currentPath) currentPath = '';
		let newFolder: IFolder = {
			ownerId: $user.uid,
			parentId: currentId,
			path: currentPath.concat('/' + newName),
			children: [],
			name: newName,
			createdAt: serverTimestamp(),
			isPublic: false
		};

		const docRef = await addDoc(collection(db, 'folders'), newFolder);

		newFolderMenuOpen = false;

		goto(window.location.origin + '/folder/' + docRef.id);
	};
</script>

{#if newFolderMenuOpen}
	<button class="background" on:click|self={() => (newFolderMenuOpen = false)}>
		<div class="menu" transition:slide>
			<input class="titleInput" bind:value={newName} placeholder="Title of Folder" />

			<div class="btnContainer">
				<button on:click={() => (newFolderMenuOpen = false)}>Cancel</button>
				<button on:click={createNewFolder}>Create</button>
			</div>
		</div>
	</button>
{/if}

<style>
	.background {
		position: fixed;
		inset: 0;
		width: 100%;

		border: none;
		outline: none;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}
	.menu {
		padding: 1rem;
		background: white;

		border-radius: 0.5rem;
	}

	.titleInput {
		font-size: 1.5rem;
		border: 1px solid grey;
		border-radius: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 2rem;
	}

	.btnContainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.btnContainer button {
		font-size: 1.2rem;
		border-radius: 0.5rem;
		padding-inline: 1rem;
		padding-block: 0.5rem;

		border: none;
		outline: none;
		background: lightskyblue;
		color: white;

		cursor: pointer;
	}

	.btnContainer button:first-child {
		background: lightgrey;
	}
</style>
