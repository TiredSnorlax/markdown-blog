<script lang="ts">
	import type { IFolder } from '$lib/types';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import MenuWrapper from '../MenuWrapper.svelte';

	export let newFolderMenuOpen: boolean;
	export let currentPath: string | undefined;
	export let currentId: string;
	export let updateFolderLastEdit: () => Promise<void>;

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
			lastEdited: serverTimestamp(),
			isPublic: false
		};

		const docRef = await addDoc(collection(db, 'folders'), newFolder);
		await updateFolderLastEdit();

		newFolderMenuOpen = false;

		goto(window.location.origin + '/folder/' + docRef.id);
	};
</script>

<MenuWrapper bind:open={newFolderMenuOpen}>
	<input class="titleInput" bind:value={newName} placeholder="Title of Folder" />

	<div class="btnContainer">
		<button on:click={() => (newFolderMenuOpen = false)}>Cancel</button>
		<button on:click={createNewFolder}>Create</button>
	</div>
</MenuWrapper>

<style>
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
