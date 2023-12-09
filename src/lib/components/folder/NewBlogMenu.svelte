<script lang="ts">
	import type { IBlog } from '$lib/types';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

	export let newBlogMenuOpen: boolean;
	export let currentId: string;

	let user = userStore(auth);

	let newTitle = '';

	const createNewBlog = async () => {
		if (!$user) return;
		let newBlog: IBlog = {
			parentId: currentId,
			ownerId: $user.uid,
			title: newTitle,
			content: 'Edit me',
			createdAt: serverTimestamp()
		};
		console.log(newBlog);

		const docRef = await addDoc(collection(db, 'blogs'), newBlog);
		console.log('Document written with ID: ', docRef.id);

		goto(window.location.origin + '/blog/' + docRef.id + '/edit');
	};
</script>

{#if newBlogMenuOpen}
	<button class="background" on:click|self={() => (newBlogMenuOpen = false)}>
		<div class="menu" transition:slide>
			<input class="titleInput" bind:value={newTitle} placeholder="Title of New Blog" />

			<div class="btnContainer">
				<button on:click={() => (newBlogMenuOpen = false)}>Cancel</button>
				<button on:click={createNewBlog}>Create</button>
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
