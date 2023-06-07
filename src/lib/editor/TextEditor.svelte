<script lang="ts">
	import { convertToHtml, groupTokens, tokenise } from '$lib/parser';
	import { insertString } from '$lib/markdown/helper';
	import { enterPressed, pasteText } from '$lib/editor/helper';

	export const doc: string = '';
	export let updateOutput: (html: string) => void;

	let inputTextArea: HTMLDivElement;

	const pressRender = () => {
		let doc = inputTextArea.innerText;
		console.log(doc);
		let tokens = tokenise(doc);
		if (!tokens) return;
		let blocks = groupTokens(tokens);
		let html = convertToHtml(blocks);

		console.log(html);
		updateOutput(html);
	};

	const onTextareaKey = (e: KeyboardEvent) => {
		if (e.key === 'Tab') {
			console.log('tab');
			e.preventDefault();
			insertString('\t');
		} else if (e.key === 'Enter') {
			e.preventDefault();
			enterPressed(inputTextArea);
		} else if (e.key === 'Shift') {
		}
	};

	const onPaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain');
		if (!text) return;
		pasteText(text, inputTextArea);
	};
</script>

<button on:click={pressRender}>Render</button>
<div
	class="editor"
	contenteditable="true"
	on:paste={onPaste}
	on:keydown={onTextareaKey}
	bind:this={inputTextArea}
>
	<div>Edit me</div>
</div>

<style>
	.editor {
		flex: 1 1 auto;
		width: 100%;
		padding: 1rem;

		display: inline-block;

		background: #eee;

		border: none;
		outline: none;
	}

	:global(.editor > div) {
		white-space: pre-wrap;
	}

	:global(.editor > div:focus-within) {
		background: grey;
	}
</style>
