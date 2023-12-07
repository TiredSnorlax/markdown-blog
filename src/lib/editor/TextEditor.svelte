<script lang="ts">
	import { enterPressed, pasteText, insertString, getParentNodeOfLine } from '$lib/editor/helper';
	import type { IBlog } from '$lib/types';

	export let blog: IBlog | null;
	export let updateOutput: (content: string) => void;
	export let updateDb: (editorString: string) => void;

	let inputTextArea: HTMLDivElement;
	let typeTimeout: ReturnType<typeof setTimeout>;

	const renderInitialBlog = (blog: IBlog | null, inputTextArea: HTMLDivElement) => {
		if (!blog || !inputTextArea) return;
		let blogContent = blog?.content;
		if (!blogContent) return console.error('no blog content');

		let content = blogContent.split('\n');

		const tempContent = [...content];

		for (let i = 0; i < content.length; i++) {
			const line = content[content.length - i - 1];
			if (line.length > 0) break;
			tempContent.pop();
		}

		content = [...tempContent];

		for (const line of content) {
			const div = document.createElement('div');
			const inner = document.createTextNode(line);
			div.appendChild(inner);
			inputTextArea.appendChild(div);
		}

		pressRender();
	};

	const sanitiseInput = () => {
		let sanitised = '';
		for (const child of inputTextArea.children) {
			if (child.textContent) {
				sanitised += child.textContent + '\n';
			} else {
				sanitised += '\n';
			}
		}

		return sanitised;
	};

	const pressRender = () => {
		let sanitised = sanitiseInput();
		updateOutput(sanitised);
	};

	const updateFunction = () => {
		updateDb(sanitiseInput());
	};

	const onTextareaKey = (e: KeyboardEvent) => {
		if (typeTimeout) {
			clearTimeout(typeTimeout);
		}
		typeTimeout = setTimeout(pressRender, 1000);
		if (e.key === 'Tab') {
			console.log('tab');
			e.preventDefault();
			insertString('\t');
		} else if (e.key === 'Enter') {
			e.preventDefault();
			enterPressed();
		} else if (e.key === 'Shift') {
			console.log(getParentNodeOfLine());
		}
	};

	const onPaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain');
		if (!text) return;
		pasteText(text);
	};

	$: renderInitialBlog(blog, inputTextArea);
</script>

<button on:click={updateFunction}>Save</button>
<div
	class="editor"
	id="editor"
	contenteditable="true"
	spellcheck="false"
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

	button {
		position: fixed;
		bottom: 0;
		right: 0;
		margin: 1rem;

		background: lightsteelblue;
		color: white;
		border: none;
		outline: none;
		font-size: 1.5rem;
		padding: 0.5rem;
		padding-inline: 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	button:hover {
		opacity: 1;
	}
</style>
