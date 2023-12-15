<script lang="ts">
	import type { IBlog } from '$lib/types';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import MenuWrapper from '../MenuWrapper.svelte';

	export let newBlogMenuOpen: boolean;
	export let currentId: string;
	export let updateFolderLastEdit: () => Promise<void>;

	let user = userStore(auth);

	let newTitle = '';

	const createNewBlog = async () => {
		if (!$user) return;
		let newBlog: IBlog = {
			parentId: currentId,
			ownerId: $user.uid,
			title: newTitle,
			content: 'Edit me',
			createdAt: serverTimestamp(),
			lastEdited: serverTimestamp()
		};

		const docRef = await addDoc(collection(db, 'blogs'), newBlog);
		await updateFolderLastEdit();

		goto(window.location.origin + '/blog/' + docRef.id + '/edit');
	};
</script>

<MenuWrapper bind:open={newBlogMenuOpen}>
	<input class="titleInput" bind:value={newTitle} placeholder="Title of New Blog" />

	<div class="btnContainer">
		<button on:click={() => (newBlogMenuOpen = false)}>Cancel</button>
		<button on:click={createNewBlog}>Create</button>
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
