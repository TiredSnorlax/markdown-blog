<script lang="ts">
	import TextEditor from '$lib/editor/TextEditor.svelte';
	import ToolBar from '$lib/editor/toolbar/ToolBar.svelte';

	import { page } from '$app/stores';

	let markdownOutput: HTMLDivElement;

	console.log('id: ', $page.params.id);

	const updateOutput = (html: string) => {
		markdownOutput.innerHTML = html;
	};
</script>

<div class="container">
	<ToolBar />
	<main>
		<section class="left">
			<TextEditor {updateOutput} />
		</section>
		<section class="right">
			<div class="output" bind:this={markdownOutput} />
		</section>
	</main>
</div>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}
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
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.right {
		width: 50%;
		padding: 0.5rem;
	}

	:global(.right pre) {
		background: #eee;
		border-radius: 0.5rem;
		padding: 1rem;
		font-size: 16px;
	}
</style>
