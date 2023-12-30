<script lang="ts">
	import NewBlogMenu from '$lib/components/folder/NewBlogMenu.svelte';
	import type { User } from 'firebase/auth';
	import {
		collection,
		getDocs,
		query,
		where,
		documentId,
		doc,
		updateDoc,
		serverTimestamp,
		CollectionReference,
		type DocumentData,
		type Query
	} from 'firebase/firestore';
	import { db, auth } from '$lib/db/setup';
	import { userStore } from '$lib/stores';
	import type { IBlog, IFolder } from '$lib/types';
	import BlogItem from '$lib/components/folder/BlogItem.svelte';
	import { slide } from 'svelte/transition';
	import NewFolderMenu from './folder/NewFolderMenu.svelte';
	import FolderItem from './folder/FolderItem.svelte';
	import { goto } from '$app/navigation';
	import ShareFolderMenu from './folder/ShareFolderMenu.svelte';

	export let folderId: string;

	let user = userStore(auth);

	let isOwner = false;
	let isAllowed = false;

	let currentFolder: IFolder | null;
	let childBlogs: IBlog[] = [];
	let childFolders: IFolder[] = [];

	let newBlogMenuOpen = false;
	let newFolderMenuOpen = false;
	let shareFolderMenuOpen = false;

	let addOptionsOpen = false;

	const getBlogs = async (user: User | null) => {
		if (!isAllowed || !folderId) return;
		const blogsRef = collection(db, 'blogs');
		let q: Query<DocumentData>;

		if (user && isOwner)
			q = query(blogsRef, where('parentId', '==', folderId), where('ownerId', '==', user.uid));
		else if ((!user && folderId !== 'root') || (user && !isOwner))
			q = query(blogsRef, where('parentId', '==', folderId), where('isPublic', '==', true));
		else return;

		const snapshot = await getDocs(q);

		childBlogs = [];
		snapshot.forEach((doc) => {
			let data = doc.data() as IBlog;
			childBlogs = [...childBlogs, { ...data, id: doc.id }];
		});
	};

	const getFolders = async (user: User | null) => {
		if (!isAllowed || !folderId) return;
		const foldersRef = collection(db, 'folders');
		let q: Query<DocumentData>;

		if (user && isOwner)
			q = query(foldersRef, where('parentId', '==', folderId), where('ownerId', '==', user.uid));
		else if ((!user && folderId !== 'root') || (user && !isOwner))
			q = query(foldersRef, where('parentId', '==', folderId), where('isPublic', '==', true));
		else return;

		const snapshot = await getDocs(q);

		childFolders = [];
		snapshot.forEach((doc) => {
			let data = doc.data() as IFolder;
			childFolders = [...childFolders, { ...data, id: doc.id }];
		});
	};

	const getCurrentFolder = async (user: User | null, folderId: string) => {
		if (!folderId) return;
		console.info('getfolder', user?.displayName);
		const foldersRef = collection(db, 'folders');
		if (folderId === 'root' && user) {
			// root folder of any user
			isOwner = true;
			currentFolder = null;
			isAllowed = true;
			await getBlogs(user);
			await getFolders(user);
			return;
		} else if (folderId !== 'root' && !user) {
			// visiting non-root folder anonymously
			isAllowed = true;
			currentFolder = await getCurrentFolderNotOwner(foldersRef);
			await getBlogs(user);
			await getFolders(user);
			return;
		} else if (folderId === 'root' && !user) {
			// trying to go to root without a user
			isAllowed = false;
			// if (browser) goto('/not-allowed');
			return;
		} else if (folderId !== 'root' && user) {
			// visiting non-root folder either as owner or guest
			const q = query(
				foldersRef,
				where('ownerId', '==', user.uid),
				where(documentId(), '==', folderId)
			);

			const snapshot = await getDocs(q);

			const firstDoc = snapshot.docs[0];
			if (firstDoc && firstDoc.exists()) {
				// if the user is the owner
				isAllowed = true;
				currentFolder = firstDoc.data() as IFolder;
				currentFolder.id = folderId;
				isOwner = true;
			} else {
				// user that is not owner visits
				isAllowed = true;
				currentFolder = await getCurrentFolderNotOwner(foldersRef);
				isOwner = false;
			}
		}

		await getBlogs(user);
		await getFolders(user);
	};

	const getCurrentFolderNotOwner = async (foldersRef: CollectionReference<DocumentData>) => {
		if (!folderId) return null;
		const q = query(foldersRef, where('isPublic', '==', true), where(documentId(), '==', folderId));
		const snapshot = await getDocs(q);
		const firstDoc = snapshot.docs[0];

		let folder = null;
		if (firstDoc && firstDoc.exists()) {
			folder = firstDoc.data() as IFolder;
			folder.id = folderId;
			isOwner = false;
		} else {
			// the folder is not public
			isAllowed = false;
			// if (browser) goto('/not-allowed');
		}

		return folder;
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

	const updateFolderLastEdit = async () => {
		if (folderId === 'root') return;
		const docRef = doc(db, 'folders', folderId);
		await updateDoc(docRef, { lastEdited: serverTimestamp() });
	};

	$: getCurrentFolder($user, folderId);
</script>

{#if isAllowed}
	<div transition:slide>
		<div class="path">
			{#if currentFolder && folderId !== 'root'}
				{#if isOwner}
					<button on:click={backPressed}
						><span class="material-icons-outlined"> arrow_back_ios </span></button
					>
					<h1>{currentFolder.path}</h1>
					<ShareFolderMenu bind:shareMenuOpen={shareFolderMenuOpen} folder={currentFolder} />
					<button class="shareBtn" on:click={() => (shareFolderMenuOpen = true)}>
						<span class="material-icons-outlined"> share </span>
						Share</button
					>
				{:else}
					{#if currentFolder.parentId !== 'root'}
						<button on:click={backPressed}
							><span class="material-icons-outlined"> arrow_back_ios </span></button
						>
					{/if}
					<h1>{currentFolder.name}</h1>
				{/if}
			{:else if folderId === 'root'}
				<h1>Welcome, {$user?.displayName || 'Guest'}</h1>
			{/if}
		</div>
		{#if $user || (!$user && folderId !== 'root')}
			<div class="content">
				<div>
					<h2>Folders</h2>
					<div class="foldersContainer">
						{#each childFolders as folder}
							<FolderItem
								{folder}
								parentPath={currentFolder ? currentFolder.path : ''}
								{updateRemovedFolder}
								{updateFolderLastEdit}
								{isOwner}
							/>
						{/each}
					</div>
				</div>
				<div>
					<h2>Files</h2>
					<div class="blogsContainer">
						{#each childBlogs as blog}
							<BlogItem {blog} {updateRemovedFolder} {updateFolderLastEdit} {isOwner} />
						{/each}
					</div>
				</div>
			</div>
		{:else if !$user && folderId === 'root'}
			<p style="text-align: center;">Please login to access this</p>
		{/if}

		<NewBlogMenu bind:newBlogMenuOpen currentId={folderId} {updateFolderLastEdit} />
		<NewFolderMenu
			bind:newFolderMenuOpen
			currentId={folderId}
			currentPath={currentFolder ? currentFolder?.path : ''}
			{updateFolderLastEdit}
		/>

		{#if isOwner}
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
		{/if}
	</div>
{:else}
	<div transition:slide>
		<h1 class="path">You are not allowed to view that page</h1>
	</div>
{/if}

<style>
	.path {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 1rem;
		margin-inline: 5rem;
	}

	.path button {
		background: none;
		outline: none;
		border: none;
		cursor: pointer;
	}

	.path > .shareBtn {
		margin-left: auto;
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
		background: blue;

		color: white;
		font-size: 1rem;
	}

	.content {
		width: 100%;
		padding-inline: 5rem;
	}

	.content h2 {
		margin-top: 2rem;
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

	@media (max-width: 650px) {
		.path {
			margin-inline: 1rem;
		}

		.content {
			padding-inline: 1rem;
		}
	}
</style>
