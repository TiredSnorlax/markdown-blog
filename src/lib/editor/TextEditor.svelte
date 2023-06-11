<script lang="ts">
	import { convertToHtml, groupTokens, tokenise } from '$lib/parser';
	import { enterPressed, pasteText, insertString, insertOnNewLine } from '$lib/editor/helper';
	import type { IBlog } from '$lib/types';

	export let blog: IBlog | null;
	export let updateOutput: (html: string) => void;
	export let updateDb: (editorString: string) => void;

	let inputTextArea: HTMLDivElement;

	const renderInitialBlog = (blog: IBlog | null, inputTextArea: HTMLDivElement) => {
		if (!blog || !inputTextArea) return;
		let blogContent = blog?.content;
		if (!blogContent) return console.error('no blog content');
		// let content = decodeURI(blogContent);

		let content = blogContent.split('\n');

		for (const line of content) {
			const div = document.createElement('div');
			const inner = document.createTextNode(line);
			div.appendChild(inner);
			inputTextArea.appendChild(div);
		}
	};

	const pressRender = () => {
		let sanitised = '';
		for (const child of inputTextArea.children) {
			if (child.textContent) {
				sanitised += child.textContent + '\n';
			} else {
				sanitised += '\n';
			}
		}
		updateDb(sanitised);
		let tokens = tokenise(sanitised);
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

	$: renderInitialBlog(blog, inputTextArea);
</script>

<button on:click={pressRender}>Render</button>
<div
	class="editor"
	id="editor"
	contenteditable="true"
	on:paste={onPaste}
	on:keydown={onTextareaKey}
	bind:this={inputTextArea}
	data-iseditor="true"
/>

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
