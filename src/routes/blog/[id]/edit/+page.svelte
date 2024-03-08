<script lang="ts">
	import TextEditor from '$lib/components/editor/TextEditor.svelte';
	import ToolBar from '$lib/components/editor/toolbar/ToolBar.svelte';
	import type { IBlog } from '$lib/types';

	import { page } from '$app/stores';
	import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
	import { db, auth } from '$lib/db/setup';
	import { onMount } from 'svelte';
	import { userStore } from '$lib/stores';
	import MarkdownOutput from '$lib/components/MarkdownOutput.svelte';
	import { fly } from 'svelte/transition';

	const user = userStore(auth);
	const docRef = doc(db, 'blogs', $page.params.id);

	let isAllowed = true;

	let blog: IBlog | null;
	let markdownContent: string | null = null;

	let newTitle: string | null = null;

	let editorOpen = true;
	let outputOpen = true;

	let resizeClosed: 'editor' | 'output' | null = null;

	const getBlog = async () => {
		console.log('id: ', $page.params.id);

		const docSnap = await getDoc(docRef);

		if (docSnap.exists() && $user) {
			let data = docSnap.data() as IBlog;
			if (data.ownerId === $user.uid) {
				console.log(docSnap.data());
				blog = docSnap.data() as IBlog;
				blog.id = docSnap.id;
				markdownContent = blog.content;
				newTitle = blog.title;
			} else {
				isAllowed = false;
			}
		}
	};

	const updateDb = async (content: string) => {
		console.log('updating db');
		await updateDoc(docRef, { content, title: newTitle, lastEdited: serverTimestamp() }).then(() =>
			console.log('Update done')
		);
	};

	const updateOutput = (content: string) => {
		markdownContent = content;
	};

	const resizeThreshold = 650;
	const onResize = () => {
		if (window.innerWidth <= resizeThreshold && editorOpen === outputOpen && editorOpen === true) {
			outputOpen = false;
			resizeClosed = null;
		} else if (window.innerWidth > resizeThreshold) {
			if (resizeClosed === null) {
				outputOpen = true;
				editorOpen = true;
			}
		}
	};

	onMount(() => {
		getBlog();
	});
</script>

<svelte:window on:resize={onResize} />
{#if isAllowed}
	<div class="container">
		<ToolBar bind:newTitle {blog} bind:editorOpen bind:outputOpen bind:resizeClosed />
		<main>
			{#if editorOpen}
				<section class="left" transition:fly={{ x: '-50vw' }}>
					<TextEditor {updateOutput} {updateDb} {blog} />
				</section>
			{/if}
			{#if outputOpen}
				<section class="right" transition:fly={{ x: '50vw' }}>
					<MarkdownOutput {markdownContent} />
				</section>
			{/if}
		</main>
	</div>
{:else}
	<h2>You do not have access to this page</h2>
	<p>Click <a href="./../../">here</a> to go back to your dashboard</p>
{/if}

<style>
	.container {
		height: 100svh;
		width: 100%;

		display: flex;
		flex-direction: column;
		font-family: 'Roboto Condensed', sans-serif;
		font-size: 16px;
	}

	main {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		height: calc(100svh - 3rem);
	}

	.left {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;

		overflow-y: auto;
	}

	.right {
		overflow-y: auto;
	}
</style>
