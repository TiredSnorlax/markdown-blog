<script lang="ts">
	import type { IBlog } from '$lib/types';
	import { onMount } from 'svelte';

	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { serverTimestamp, collection, addDoc } from 'firebase/firestore';

	export let dialogOpen: boolean;

	let user = userStore(auth);

	let dialogEle: HTMLDialogElement;

	let newTitle = '';
	let newDescription = '';

	const openDialog = (dialogOpen: boolean) => {
		if (!dialogEle) return;
		if (dialogOpen) {
			dialogEle.show();
		}
	};

	$: openDialog(dialogOpen);

	const createNewBlog = async () => {
		if (!$user) return;
		let newBlog: IBlog = {
			ownerId: $user.uid,
			title: newTitle,
			description: newDescription,
			content: 'Edit me',
			createdAt: serverTimestamp()
		};
		console.log(newBlog);

		const docRef = await addDoc(collection(db, 'blogs'), newBlog);
		console.log('Document written with ID: ', docRef.id);
	};

	onMount(() => {
		dialogEle.onclose = () => {
			dialogOpen = false;
		};
	});
</script>

<dialog bind:this={dialogEle}>
	<h3>New Blog</h3>
	<input class="titleInput" bind:value={newTitle} placeholder="Title" />
	<input class="descriptionInput" bind:value={newDescription} placeholder="Description" />

	<div>
		<button on:click={createNewBlog}>Create</button>
		<form method="dialog">
			<button>Cancel</button>
		</form>
	</div>
</dialog>

<style>
	dialog {
		inset: 0;
	}
</style>
