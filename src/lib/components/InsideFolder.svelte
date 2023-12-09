<script lang="ts">
	import NewBlogMenu from '$lib/components/folder/NewBlogMenu.svelte';
	import type { User } from 'firebase/auth';
	import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
	import { db, auth } from '$lib/db/setup';
	import { userStore } from '$lib/stores';
	import type { IBlog, IFolder } from '$lib/types';
	import BlogItem from '$lib/components/folder/BlogItem.svelte';
	import { slide } from 'svelte/transition';
	import NewFolderMenu from './folder/NewFolderMenu.svelte';
	import FolderItem from './folder/FolderItem.svelte';
	import { goto } from '$app/navigation';

	export let folderId: string;

	let newBlogMenuOpen = false;
	let newFolderMenuOpen = false;

	let addOptionsOpen = false;

	let user = userStore(auth);
	// let userProfile: IProfile | null = null;

	let currentFolder: IFolder | null;
	let childBlogs: IBlog[] = [];
	let childFolders: IFolder[] = [];

	const getBlogs = async (user: User | null) => {
		if (!user) return;
		const blogsRef = collection(db, 'blogs');
		const q = query(blogsRef, where('parentId', '==', folderId), where('ownerId', '==', user.uid));

		const snapshot = await getDocs(q);

		childBlogs = [];
		snapshot.forEach((doc) => {
			let data = doc.data() as IBlog;
			childBlogs.push({ ...data, id: doc.id });
		});

		console.log(childBlogs);
	};

	const getFolders = async (user: User | null) => {
		if (!user) return;
		const foldersRef = collection(db, 'folders');
		let q = query(foldersRef, where('parentId', '==', folderId), where('ownerId', '==', user.uid));

		const snapshot = await getDocs(q);

		childFolders = [];
		snapshot.forEach((doc) => {
			let data = doc.data() as IFolder;
			childFolders.push({ ...data, id: doc.id });
		});

		console.log(childFolders);
	};

	const getCurrentFolder = async (user: User | null) => {
		if (folderId === 'root' || !user) return;
		const foldersRef = collection(db, 'folders');
		const q = query(
			foldersRef,
			where('ownerId', '==', user.uid),
			where(documentId(), '==', folderId)
		);

		const snapshot = await getDocs(q);

		const firstDoc = snapshot.docs[0];
		if (firstDoc.exists()) {
			currentFolder = firstDoc.data() as IFolder;
			console.log(currentFolder);
		}
	};

	const openNewBlogMenu = () => {
		newBlogMenuOpen = true;
		addOptionsOpen = false;
	};

	const openNewFolderMenu = () => {
		newFolderMenuOpen = true;
		addOptionsOpen = false;
	};

	const backPressed = () => {
		if (currentFolder?.path === '/') {
			goto(window.location.origin);
		} else if (currentFolder?.path !== 'root') {
			goto(window.location.origin + '/folder/' + currentFolder?.parentId);
		}
	};

	const updateRemovedFolder = (id: string) => {
		childFolders = [...childFolders.filter((folder) => folder.id !== id)];
	};

	$: if ($user && folderId) {
		getCurrentFolder($user);
		getBlogs($user);
		getFolders($user);
	}
</script>

<div>
	<div class="path">
		{#if currentFolder && folderId !== 'root'}
			<button on:click={backPressed}
				><span class="material-icons-outlined"> arrow_back_ios </span></button
			>
			<h1>{currentFolder.path}</h1>
		{:else if folderId === 'root'}
			<h1>Welcome, {$user?.displayName}</h1>
		{:else}
			<h1>Loading</h1>
		{/if}
	</div>
	<div class="content">
		<div>
			<h2>Folders</h2>
			<div class="foldersContainer">
				{#each childFolders as folder}
					<FolderItem
						{folder}
						parentPath={currentFolder ? currentFolder.path : ''}
						{updateRemovedFolder}
					/>
				{/each}
			</div>
		</div>
		<div>
			<h2>Files</h2>
			<div class="blogsContainer">
				{#each childBlogs as blog}
					<BlogItem {blog} />
				{/each}
			</div>
		</div>
	</div>

	<NewBlogMenu bind:newBlogMenuOpen currentId={folderId} />
	<NewFolderMenu
		bind:newFolderMenuOpen
		currentId={folderId}
		currentPath={currentFolder ? currentFolder?.path : ''}
	/>

	<button class="addBtn" on:click={() => (addOptionsOpen = true)}> Add </button>
	{#if addOptionsOpen}
		<button class="popupBg" on:click|self={() => (addOptionsOpen = false)}>
			<div class="popup" transition:slide>
				<button on:click={openNewFolderMenu}>
					<span class="material-icons-outlined"> create_new_folder </span>
					<p>Folder</p>
				</button>
				<button on:click={openNewBlogMenu}>
					<span class="material-icons-outlined"> create</span>
					<p>Blog</p>
				</button>
			</div>
		</button>
	{/if}
</div>

<style>
	.content {
		width: 100%;
		padding-inline: 5rem;
	}

	.path {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 1rem;
		margin-left: 5rem;
	}

	.path button {
		background: none;
		outline: none;
		border: none;
		cursor: pointer;
	}

	.blogsContainer,
	.foldersContainer {
		display: flex;
		flex-wrap: wrap;
		width: 100%;

		gap: 1rem;
	}

	.addBtn {
		position: fixed;
		bottom: 1rem;
		right: 1rem;

		background: lightblue;
		color: white;
		font-size: 1.2rem;
		padding: 0.5rem;
		padding-inline: 1rem;
		border: 2px outset lightgrey;
		outline: none;
		border-radius: 0.5rem;

		z-index: 50;

		cursor: pointer;
	}

	.popupBg {
		z-index: 100;
		background: none;
		outline: none;
		border: none;

		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.popup {
		position: absolute;
		bottom: 1rem;
		right: 1rem;

		border-radius: 0.5rem;
		box-shadow: 0 1px 2px 0 grey;

		padding-block: 1rem;

		background: white;
		color: black;

		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.popup p {
		margin: 0;
	}

	.popup > button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 200px;
		gap: 2rem;
		background: none;
		outline: none;
		border: none;
		font-size: 1.2rem;

		padding-inline: 1rem;
		padding-block: 0.5rem;
	}

	.popup > button:hover {
		background: rgba(0, 0, 0, 0.3);
	}
</style>
