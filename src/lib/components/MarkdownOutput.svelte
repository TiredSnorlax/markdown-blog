<script lang="ts">
	import { tokenise, groupTokens, convertToHtml } from '$lib/parser';

	export let markdownContent: string | null;

	let markdownOutput: HTMLDivElement;

	const render = (content: string | null, _div: HTMLDivElement) => {
		console.log('render');
		if (!content || !markdownOutput) return;

		let tokens = tokenise(content);
		if (!tokens) return;
		let blocks = groupTokens(tokens);
		let html = convertToHtml(blocks);

		markdownOutput.innerHTML = html;
	};

	$: render(markdownContent, markdownOutput);
</script>

<div class="output" bind:this={markdownOutput} />

<style>
	* {
		font-size: 20px;
		font-family: 'Roboto Condensed', sans-serif;
	}

	.output {
		width: 100%;
	}

	:global(p) {
		margin: 0;
	}

	:global(pre) {
		background: #eee;
		padding: 1rem;
		border-radius: 10px;
	}

	:global(img) {
		width: 100%;
	}
</style>
