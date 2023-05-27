<script lang="ts">
	import { rules } from '$lib/markdown/rules';
	import { tokenise } from '$lib/parser';

	let inputTextArea: HTMLTextAreaElement;
	let markdownOutput: HTMLDivElement;

	// const pressRender = () => {
	// 	let html = inputTextArea.value;
	// 	console.log(html);
	//
	// 	rules.forEach(([rule, template]) => {
	// 		if (!html) return;
	// 		html = html.replace(rule, template as string);
	// 	});
	//
	// 	html = html.replace(/^\s*(\n)?(.+)/gm, function (m) {
	// 		return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
	// 	});
	//
	// 	if (html) markdownOutput.innerHTML = html;
	// 	console.log(html);
	// };
	//

	const pressRender = () => {
		let doc = inputTextArea.value;
		tokenise(doc);
	};

	const onTextareaKey = (e: KeyboardEvent) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			console.log('Tab pressed');
			let ele = e.target as HTMLTextAreaElement;
			let start = ele.selectionStart;
			let end = ele.selectionEnd;

			ele.value = ele.value.substring(0, start) + '\t' + ele.value.substring(end);

			ele.selectionEnd = start + 1;
		}
	};
</script>

<div class="container">
	<section class="left">
		<button on:click={pressRender}>Render</button>
		<textarea on:keydown={onTextareaKey} bind:this={inputTextArea} />
	</section>
	<section class="right">
		<div class="output" bind:this={markdownOutput} />
	</section>
</div>

<style>
	.container {
		height: 100svh;
		width: 100vw;

		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.left {
		padding: 1rem;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.left textarea {
		flex: 1 1 auto;
		width: 100%;
		padding: 1rem;

		font-family: Arial, Helvetica, sans-serif;
	}
</style>
