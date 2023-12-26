<script lang="ts">
	import type { IBlog } from '$lib/types';
	import { slide } from 'svelte/transition';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
	import RenameFolderMenu from './RenameFolderMenu.svelte';
	import DeleteItemMenu from './DeleteItemMenu.svelte';
	import DetailsMenu from './DetailsMenu.svelte';
	import ItemOptionsList from './ItemOptionsList.svelte';

	export let blog: IBlog;
	export let updateRemovedFolder: (id: string) => void;
	export let updateFolderLastEdit: () => Promise<void>;
	export let isOwner: boolean;

	let moreBtnEle: HTMLSpanElement;

	let optionsOpen = false;

	let renameMenuOpen = false;
	let deleteMenuOpen = false;
	let detailsMenuOpen = false;

	let newTitle = '';

	let user = userStore(auth);

	const toggleOptions = () => {
		optionsOpen = !optionsOpen;
	};

	const renameBlog = async () => {
		if (!$user || !blog.id) return;
		const docRef = doc(db, 'blogs', blog.id);
		await updateDoc(docRef, {
			title: newTitle
		});

		await updateFolderLastEdit();

		renameMenuOpen = false;
		blog.title = newTitle;
		newTitle = '';
		optionsOpen = false;
	};

	const deleteBlog = async () => {
		if (!blog.id) return;
		const docRef = doc(db, 'blogs', blog.id);
		await deleteDoc(docRef);
		await updateFolderLastEdit();
		updateRemovedFolder(blog.id);
	};
</script>

<div class="item">
	<span class="material-icons-outlined"> article </span>
	<a href={window.location.origin + '/blog/' + blog.id + '/edit'}>{blog.title}</a>
	<button on:click={toggleOptions} class="optionsBtn"
		><span bind:this={moreBtnEle} class="material-icons-outlined"> more_vert </span></button
	>
	<ItemOptionsList
		{isOwner}
		bind:detailsMenuOpen
		bind:deleteMenuOpen
		bind:renameMenuOpen
		bind:optionsOpen
	/>
	<RenameFolderMenu
		fileType={'Blog'}
		bind:renameMenuOpen
		bind:newName={newTitle}
		renameFunction={renameBlog}
	/>
	<DeleteItemMenu
		fileType={'Folder'}
		fileName={blog.title}
		deleteFunction={deleteBlog}
		bind:deleteMenuOpen
	/>
	<DetailsMenu {blog} folder={null} bind:detailsMenuOpen />
</div>

<style>
	.item {
		flex: 1 1 250px;
		min-width: 250px;
		max-width: 350px;

		border-radius: 0.5rem;

		background: none;
		outline: none;
		border: 2px solid lightgrey;

		padding: 0.5rem;

		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;

		position: relative;
	}

	.item a {
		margin: 0;
		font-size: 1.1rem;
		flex: 1 1 auto;
		text-align: left;
		text-decoration: none;
		color: initial;

		font-family: inherit;
	}

	.item a:hover {
		text-decoration: underline;
	}

	.item button {
		background: none;
		outline: none;
		border: none;
		border-radius: 100%;
		padding: 2px;
	}

	.item button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.item button span {
		display: flex;
	}
</style>
