<script lang="ts">
	import type { IBlog } from '$lib/types';
	import { onMount } from 'svelte';
	import EditorButtons from './EditorButtons.svelte';
	import Editor from '$lib/editor/index';

	export let blog: IBlog | null;
	export let updateOutput: (content: string) => void;
	export let updateDb: (editorString: string) => void;

	let editor: Editor;
	let inputTextArea: HTMLDivElement;
	let typeTimeout: ReturnType<typeof setTimeout>;

	let windowSelection: Selection | null;
	let prevSelectedLine: HTMLElement;
	let prevSelectedLineNumber = 0;

	const renderInitialBlog = (blog: IBlog | null, inputTextArea: HTMLDivElement) => {
		if (!blog || !inputTextArea) return;
		let blogContent = blog?.content;
		if (!blogContent || blogContent.trim().length === 0) {
			const pre = document.createElement('pre');
			const inner = document.createTextNode('');
			pre.appendChild(inner);
			inputTextArea.appendChild(pre);
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
			const pre = document.createElement('pre');
			const inner = document.createTextNode(line);
			pre.appendChild(inner);
			inputTextArea.appendChild(pre);
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
			editor.tabPressed();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			editor.enterPressed();
		} else if (e.key === 'Shift') {
			console.log(editor.getParentNodeOfLine());
		} else if (e.key === 'z' && e.ctrlKey) {
			return;
			// if (!windowSelection) return;
			// // windowSelection.modify('extend', 'backward', 'word');
			// const range = windowSelection?.getRangeAt(0);
			// // checks is selection extends to prev line
			// if (windowSelection.focusNode !== windowSelection?.anchorNode) {
			// 	const prev = windowSelection.focusNode?.parentNode;
			// 	if (!prev) return;
			// 	range?.deleteContents();
			// 	gotoEndOfNode(windowSelection, prev);
			// } else {
			// 	range?.deleteContents();
			// }
		}
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			addPreToInput();
			changeFocus(e);
		}
	};

	const addPreToInput = () => {
		if (inputTextArea.children[0].matches('br')) {
			const newPre = document.createElement('pre');
			inputTextArea.prepend(newPre);
			let sel = window.getSelection();
			sel?.collapse(newPre);
		}
	};

	const changeFocus = (e: KeyboardEvent) => {
		if (!windowSelection) return;
		console.debug('change focus');
		if (
			windowSelection.anchorNode === inputTextArea ||
			windowSelection.focusNode === inputTextArea
		) {
			if (inputTextArea.lastChild) {
				const range = document.createRange(); //Create a range (a range is a like the selection but invisible)
				if (inputTextArea.children.length > prevSelectedLineNumber) {
					const newFocusedPre = Array.from(inputTextArea.children).filter(
						(child) => child.tagName === 'PRE'
					)[prevSelectedLineNumber];
					range.selectNodeContents(newFocusedPre); //Select the entire contents of the element with the range
				} else {
					range.selectNodeContents(inputTextArea.lastChild); //Select the entire contents of the element with the range
				}
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
		editor.pasteText(text);
	};

	$: renderInitialBlog(blog, inputTextArea);

	onMount(() => {
		windowSelection = window.getSelection();
		if (windowSelection) editor = new Editor(blog?.content || '', windowSelection);
		const onSelectionChange = () => {
			if (windowSelection) {
				let newSelectedLine = windowSelection.focusNode?.parentElement;
				if (newSelectedLine === inputTextArea)
					newSelectedLine = windowSelection.focusNode as HTMLElement;
				if (prevSelectedLine !== newSelectedLine && newSelectedLine !== inputTextArea) {
					if (newSelectedLine && newSelectedLine.matches('pre')) {
						newSelectedLine.classList.add('selected');
						if (prevSelectedLine) {
							prevSelectedLine.classList.remove('selected');
						}
						prevSelectedLine = newSelectedLine;
						prevSelectedLineNumber = Array.from(inputTextArea.children).indexOf(newSelectedLine);
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
	<EditorButtons {blog} {updateFunction} {editor} />
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
		user-select: text;

		border: none;
		outline: none;

		overflow-y: auto;

		counter-reset: line-number;

		padding-bottom: 3rem;
	}

	:global(.editor > br) {
		display: none;
	}

	:global(.editor > pre) {
		border-radius: 0;
		margin: 0;
		padding: 0;
		width: 100%;
		max-width: 100%;
		line-height: 20px;
		min-height: 20px;
		padding-left: 3rem;

		overflow-wrap: break-word;
		white-space: pre-wrap;

		position: relative;
		counter-increment: line-number;
		user-select: text;
	}

	:global(.editor > pre::before) {
		content: counter(line-number);
		position: absolute;
		top: 0;
		left: 0.5rem;
		color: grey;
	}

	:global(.editor > pre.selected::before) {
		color: black;
	}

	:global(.editor > pre.selected) {
		background: #d0d0d0;
	}

	:global(.editor > pre:focus-within) {
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
