<script lang="ts">
	import type { IFolder } from '$lib/types';
	import MenuWrapper from '$lib/components/MenuWrapper.svelte';
	import { db } from '$lib/db/setup';
	import { doc, updateDoc } from 'firebase/firestore';

	export let shareMenuOpen: boolean;
	export let folder: IFolder | null;

	let copied = false;

	const copyLink = () => {
		if (!folder || !folder.id) return;
		navigator.clipboard.writeText(window.location.origin + '/folder/' + folder.id);
		copied = true;
	};

	const changeAccess = async (newIsPublic: boolean) => {
		console.log(folder);
		if (!folder || !folder.id || newIsPublic === folder.isPublic) return;
		const docRef = doc(db, 'folders', folder.id);
		await updateDoc(docRef, { isPublic: newIsPublic });
		folder.isPublic = newIsPublic;
	};

	$: copied = !shareMenuOpen;
</script>

<MenuWrapper bind:open={shareMenuOpen}>
	{#if folder}
		<h2>Share "{folder.name}"</h2>
		<h3>Access:</h3>
		<div class="accessOptions">
			<button class:selected={folder && !folder.isPublic} on:click={() => changeAccess(false)}>
				<span class="material-icons-outlined"> lock </span>
				<div>
					<p>Private</p>
					<p>Only you can access this folder</p>
				</div>
			</button>
			<button class:selected={folder && folder.isPublic} on:click={() => changeAccess(true)}>
				<span class="material-icons-outlined"> lock_open </span>
				<div>
					<p>Public</p>
					<p>People can view all public content in the folder</p>
				</div>
			</button>
		</div>
		<div class="buttonContainer">
			<button on:click={copyLink}>
				<span class="material-icons-outlined"> link </span>
				<p>{copied ? 'Copied' : 'Copy link'}</p>
			</button>
			<button on:click={() => (shareMenuOpen = false)}>Done</button>
		</div>
	{/if}
</MenuWrapper>

<style>
	p {
		margin: 0;
	}

	h3 {
		text-align: start;
		font-size: 1.2rem;
	}

	.accessOptions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;

		margin-bottom: 1rem;
	}

	.accessOptions > button {
		display: flex;
		gap: 0.5rem;

		align-items: flex-start;

		background: none;
		outline: none;
		border: 2px solid lightgrey;
		padding: 0.5rem;
		border-radius: 0.5rem;

		width: 250px;

		cursor: pointer;
	}

	.accessOptions > .selected {
		border-color: blue;
	}

	.accessOptions > button > span {
		padding: 5px;
		border-radius: 100%;
		display: flex;
		background: lightgrey;
	}

	.accessOptions > button > div {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		text-align: start;

		color: grey;
	}

	.accessOptions > button > div > p:first-child {
		font-size: 1rem;
		font-weight: bold;

		color: initial;
	}

	.buttonContainer {
		display: flex;
		justify-content: space-between;
		align-items: stretch;

		margin-top: 2rem;
	}

	.buttonContainer button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;

		border: none;
		outline: none;
		padding: 0.5rem;
		padding-inline: 1rem;
		border-radius: 0.5rem;

		cursor: pointer;

		color: white;
		font-size: 1rem;
	}

	.buttonContainer button:first-child {
		background: blue;
	}
</style>
