<script lang="ts">
	import type { IFolder } from '$lib/types';
	import { slide } from 'svelte/transition';
	import RenameFolderMenu from './RenameFolderMenu.svelte';
	import { userStore } from '$lib/stores';
	import { auth, db } from '$lib/db/setup';
	import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
	import DeleteItemMenu from './DeleteItemMenu.svelte';

	export let parentPath: string;
	export let folder: IFolder;
	export let updateRemovedFolder: (id: string) => void;

	let moreBtnEle: HTMLSpanElement;

	let optionsOpen = false;

	let renameMenuOpen = false;
	let deleteMenuOpen = false;

	let newName = '';

	let user = userStore(auth);

	const toggleOptions = () => {
		optionsOpen = !optionsOpen;
	};

	const renameFolder = async () => {
		if (!$user || !folder.id) return;
		const docRef = doc(db, 'folders', folder.id);
		await updateDoc(docRef, {
			name: newName,
			path: parentPath + '/' + newName
		});

		renameMenuOpen = false;
		folder.name = newName;
		newName = '';
		optionsOpen = false;
	};

	const deleteFolder = async () => {
		if (!folder.id) return;
		const docRef = doc(db, 'folders', folder.id);
		await deleteDoc(docRef);
		updateRemovedFolder(folder.id);
	};
</script>

<div class="item">
	<span class="material-icons-outlined"> folder </span>
	<a href={window.location.origin + '/folder/' + folder.id}> {folder.name} </a>
	<button on:click={toggleOptions} class="optionsBtn"
		><span bind:this={moreBtnEle} class="material-icons-outlined"> more_vert </span></button
	>
	{#if optionsOpen}
		<div class="options" transition:slide>
			<button
				on:click={() => {
					renameMenuOpen = true;
					optionsOpen = false;
				}}>Rename</button
			>
			<button
				on:click={() => {
					deleteMenuOpen = true;
					optionsOpen = false;
				}}>Delete</button
			>
			<button>Details</button>
		</div>
	{/if}
	<RenameFolderMenu bind:renameMenuOpen bind:newName {renameFolder} />
	<DeleteItemMenu
		fileType={'Folder'}
		fileName={folder.name}
		deleteFunction={deleteFolder}
		bind:deleteMenuOpen
	/>
</div>

<style>
	.item {
		border: 2px solid lightgrey;
		outline: none;
		background: lightgrey;

		padding: 0.5rem;
		border-radius: 0.5rem;

		display: flex;
		justify-content: space-between;
		gap: 1.5rem;
		align-items: center;

		flex: 1 1 250px;
		max-width: 350px;
		min-width: 250px;

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
		cursor: pointer;
		padding: 0;
	}

	.item button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.item span {
		display: flex;
		border-radius: 100%;
		padding: 2px;
	}

	.options {
		padding-block: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		position: absolute;
		left: 100%;
		top: 1rem;

		background: white;
		border-radius: 0.5rem;

		box-shadow: 0 1px 2px 0 grey;

		z-index: 50;
	}

	.options button {
		border-radius: 0;
		padding: 0.5rem;
		width: 100%;
		font-size: 1rem;
	}
</style>
