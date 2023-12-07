<script lang="ts">
	import type { IBlog } from '$lib/types';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { db } from '$lib/db/setup';
	import { doc, getDoc } from 'firebase/firestore';
	import MarkdownOutput from '$lib/components/MarkdownOutput.svelte';

	let blog: IBlog | null;

	let markdownContent: string | null = null;

	const getBlog = async () => {
		console.log('id: ', $page.params.id);

		const docRef = doc(db, 'blogs', $page.params.id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			blog = docSnap.data() as IBlog;
			markdownContent = blog.content;
		}
	};

	onMount(() => {
		getBlog();
	});
</script>

<main>
	<div class="info">
		<h1>{blog?.title}</h1>
		<div class="writerInfo">
			<img src="/default-profile.jpg" alt="" />
			<div>
				<p>TiredSnorlax</p>
				<span>22 March 2023</span>
			</div>
		</div>
	</div>

	<div class="outputContainer">
		<MarkdownOutput {markdownContent} />
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	main > div {
		width: 100%;
		max-width: 700px;
	}

	.info {
		margin-top: 3rem;
		display: flex;
		flex-direction: column;
		padding: 1rem;
	}

	.info {
		border-bottom: 1px solid grey;
	}

	.info h1 {
		font-size: 3rem;
	}

	.writerInfo {
		display: flex;
		width: 100%;
	}

	.writerInfo img {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		margin-right: 1rem;
	}

	.writerInfo > div {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}

	.writerInfo p {
		margin: 0;
		font-size: 18px;
	}

	.writerInfo span {
		color: grey;
		font-size: 14px;
	}
	.outputContainer {
		padding-top: 2rem;
	}
</style>
