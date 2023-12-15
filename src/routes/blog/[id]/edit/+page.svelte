<script lang="ts">
	import TextEditor from '$lib/editor/TextEditor.svelte';
	import ToolBar from '$lib/editor/toolbar/ToolBar.svelte';
	import type { IBlog } from '$lib/types';

	import { page } from '$app/stores';
	import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
	import { db, auth } from '$lib/db/setup';
	import { onMount } from 'svelte';
	import { userStore } from '$lib/stores';
	import MarkdownOutput from '$lib/components/MarkdownOutput.svelte';

	const user = userStore(auth);
	const docRef = doc(db, 'blogs', $page.params.id);

	let isAllowed = true;

	let blog: IBlog | null;
	let markdownContent: string | null = null;

	let newTitle: string | null = null;

	const getBlog = async () => {
		console.log('id: ', $page.params.id);
		// TODO: Add Owner verificaiton

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

	onMount(() => {
		getBlog();
	});
</script>

{#if isAllowed}
	<div class="container">
		<ToolBar bind:newTitle {blog} />
		<main>
			<section class="left">
				<TextEditor {updateOutput} {updateDb} {blog} />
			</section>
			<section class="right">
				<MarkdownOutput {markdownContent} />
			</section>
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
		font-size: 18px;
	}

	main {
		flex: 1;
		display: flex;
	}

	.left {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.right {
		width: 50%;
		padding: 0.5rem;
	}
</style>
