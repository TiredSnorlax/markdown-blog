<script lang="ts">
	import TextEditor from '$lib/editor/TextEditor.svelte';
	import ToolBar from '$lib/editor/toolbar/ToolBar.svelte';

	let markdownOutput: HTMLDivElement;

	const updateOutput = (html: string) => {
		markdownOutput.innerHTML = html;
	};
</script>

<ToolBar />
<div class="container">
	<section class="left">
		<TextEditor {updateOutput} />
	</section>
	<section class="right">
		<div class="output" bind:this={markdownOutput} />
	</section>
</div>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}
	.container {
		padding-top: 1rem;
		height: 100svh;
		width: 100%;

		display: flex;
		font-family: 'Roboto Condensed', sans-serif;
		font-size: 18px;
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
