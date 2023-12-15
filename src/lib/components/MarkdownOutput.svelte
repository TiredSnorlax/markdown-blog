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
		font-size: 18px;
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

	:global(blockquote) {
		background: #f9f9f9;
		border-left: 10px solid #c0c0c0;
		margin: 1.5em 10px;
		padding: 1em 10px 0.1em;
		quotes: '\201C''\201D''\2018''\2019';
	}

	:global(table) {
		/* border: 1px solid lightgrey; */
		width: 100%;
		margin-block: 1rem;
		border-collapse: collapse;
	}

	:global(table td, table th) {
		text-align: start;
		border: 1px solid lightgrey;
		padding: 1rem;
	}
</style>
