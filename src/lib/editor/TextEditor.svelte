<script lang="ts">
	import {
		enterPressed,
		pasteText,
		getParentNodeOfLine,
		tabPressed,
		gotoEndOfNode
	} from '$lib/editor/helper';
	import type { IBlog } from '$lib/types';
	import { onMount } from 'svelte';
	import EditorButtons from './EditorButtons.svelte';

	export let blog: IBlog | null;
	export let updateOutput: (content: string) => void;
	export let updateDb: (editorString: string) => void;

	let inputTextArea: HTMLDivElement;
	let typeTimeout: ReturnType<typeof setTimeout>;

	let windowSelection: Selection | null;
	let prevSelectedLine: HTMLElement;

	const renderInitialBlog = (blog: IBlog | null, inputTextArea: HTMLDivElement) => {
		if (!blog || !inputTextArea) return;
		let blogContent = blog?.content;
		if (!blogContent || blogContent.trim().length === 0) {
			const div = document.createElement('div');
			const inner = document.createTextNode('');
			div.appendChild(inner);
			inputTextArea.appendChild(div);
		}

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
		// console.log(inputTextArea);
		for (const child of inputTextArea.childNodes) {
			if (child.textContent) {
				sanitised += child.textContent + '\n';
				// } else if (child.nodeType === 1) {
				// 			continue;
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
			e.preventDefault();
			tabPressed();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			enterPressed();
		} else if (e.key === 'Shift') {
			console.log(getParentNodeOfLine());
		} else if (e.key === 'Backspace' && e.ctrlKey) {
			console.log('special backspace');
			e.preventDefault();
			if (!windowSelection) return;
			windowSelection.modify('extend', 'backward', 'word');
			const range = windowSelection?.getRangeAt(0);
			// checks is selection extends to prev line
			if (windowSelection.focusNode !== windowSelection?.anchorNode) {
				const prev = windowSelection.focusNode?.parentNode;
				if (!prev) return;
				range?.deleteContents();
				gotoEndOfNode(windowSelection, prev);
			} else {
				range?.deleteContents();
			}
		}
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			addDivToInput();
			changeFocus(e);
		}
	};

	const addDivToInput = () => {
		if (inputTextArea.children[0].matches('br')) {
			const newDiv = document.createElement('div');
			inputTextArea.prepend(newDiv);
			let sel = window.getSelection();
			sel?.collapse(newDiv);
		}
	};

	const changeFocus = (e: KeyboardEvent) => {
		if (!windowSelection) return;
		if (
			windowSelection.anchorNode === inputTextArea ||
			windowSelection.focusNode === inputTextArea
		) {
			if (inputTextArea.lastChild) {
				console.log(prevSelectedLine);
				const range = document.createRange(); //Create a range (a range is a like the selection but invisible)
				range.selectNodeContents(inputTextArea.lastChild); //Select the entire contents of the element with the range
				range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
				windowSelection.removeAllRanges(); //remove any selections already made
				windowSelection.addRange(range);
				// this fixes a bug
				windowSelection.modify('move', 'forward', 'word');
			} else if (e.key === 'Backspace' && e.ctrlKey) {
				// this also fixed a bug
				windowSelection.modify('move', 'backward', 'word');
				windowSelection.modify('move', 'backward', 'character');
			}
		}
	};

	const onPaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain');
		if (!text) return;
		pasteText(text);
	};

	$: renderInitialBlog(blog, inputTextArea);

	onMount(() => {
		windowSelection = window.getSelection();
		const onSelectionChange = () => {
			if (windowSelection) {
				const newSelectedLine = windowSelection.focusNode?.parentElement;
				if (prevSelectedLine !== newSelectedLine && newSelectedLine !== inputTextArea) {
					if (newSelectedLine) {
						newSelectedLine.classList.add('selected');
						if (prevSelectedLine) {
							prevSelectedLine.classList.remove('selected');
						}
						prevSelectedLine = newSelectedLine;
					}
				}
			}
		};
		document.addEventListener('selectionchange', onSelectionChange, true);

		return () => {
			document.removeEventListener('selectionchange', onSelectionChange);
		};
	});
</script>

<button on:click={updateFunction}>Save</button>
<div class="container">
	<EditorButtons {blog} {updateFunction} />
	<div
		class="editor"
		id="editor"
		contenteditable="true"
		spellcheck="false"
		on:paste={onPaste}
		on:keydown={onTextareaKey}
		on:keyup={onKeyUp}
		bind:this={inputTextArea}
		data-iseditor="true"
	/>
</div>

<style>
	.container {
		flex: 1 1 auto;
		width: 100%;
		padding-block: 0.5rem;
		background: #eee;

		display: flex;
		flex-direction: column;
	}
	.editor {
		flex-grow: 1;
		display: inline-block;

		border: none;
		outline: none;

		overflow-y: auto;

		counter-reset: line-number;

		padding-bottom: 3rem;
	}

	:global(.editor > br) {
		display: none;
	}

	:global(.editor > div) {
		padding-left: 3rem;
		white-space: pre-wrap;
		position: relative;
		counter-increment: line-number;
	}

	:global(.editor > div::before) {
		content: counter(line-number);
		position: absolute;
		top: 0;
		left: 0.5rem;
		color: grey;
	}

	:global(.editor > div.selected::before) {
		color: black;
	}

	:global(.editor > div.selected) {
		background: #d0d0d0;
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
