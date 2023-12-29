<script lang="ts">
	import type { IBlog } from '$lib/types';
	import ImageMenu from './toolbar/ImageMenu.svelte';
	import MarkdownHelpMenu from '$lib/editor/toolbar/MarkdownHelpMenu.svelte';
	import { onMount } from 'svelte';
	import type Editor from '$lib/editor';

	export let blog: IBlog | null;
	export let updateFunction: () => void;
	export let editor: Editor;

	interface ICtrlFunction {
		key: string;
		keyFunction: () => void;
		shift: boolean;
	}

	let ctrlKeyFunctions: ICtrlFunction[] = [];

	let helpMenuOpen = false;
	let imageMenuOpen = false;

	const addCodeBlock = () => {
		let sel = editor.selection;
		if (!sel?.rangeCount) return;
		let range = sel?.getRangeAt(0);
		let content = range?.toString();

		if (content && sel.anchorNode === sel.focusNode) {
			editor.surroundSelectedText('`');
		} else if (sel.anchorNode !== sel.focusNode) {
			editor.surroundStringMultiLine('```');
		} else {
			editor.insertOnNewLine('```', true);
			editor.insertOnNewLine('', true);
			editor.insertOnNewLine('```', true);
		}
	};

	const addImageBlock = () => {
		editor.toNewLine('![Description](URL)');
	};

	onMount(() => {
		ctrlKeyFunctions = [
			{ key: 's', keyFunction: updateFunction, shift: false },
			{ key: 'b', keyFunction: () => editor.surroundSelectedText('**'), shift: false },
			{ key: 'i', keyFunction: () => editor.surroundSelectedText('*'), shift: false },
			{ key: 's', keyFunction: () => editor.surroundSelectedText('~~'), shift: true },
			{ key: '1', keyFunction: () => editor.toNewLine('#'), shift: true },
			{ key: '2', keyFunction: () => editor.toNewLine('##'), shift: true },
			{ key: 'U', keyFunction: () => editor.toNewLine('-'), shift: true },
			{ key: 'O', keyFunction: () => editor.toNewLine('1.'), shift: true },
			{ key: 'C', keyFunction: addCodeBlock, shift: true }
		];

		const ctrlKeyPressHandler = (e: KeyboardEvent) => {
			if (e.ctrlKey) {
				console.log('ctrl');
				for (const { key, keyFunction, shift } of ctrlKeyFunctions) {
					if (e.key === key && e.shiftKey === shift) {
						e.preventDefault();
						console.log('running');
						keyFunction();
					}
				}
			}
		};

		window.addEventListener('keydown', ctrlKeyPressHandler);

		return () => {
			ctrlKeyFunctions = [];
			console.log('ctrl keypress removed');
			window.removeEventListener('keydown', ctrlKeyPressHandler);
		};
	});
</script>

<div class="buttons">
	<button on:click={() => editor.surroundSelectedText('**')} title="Bold">
		<span class="material-icons-outlined"> format_bold </span>
	</button>
	<button on:click={() => editor.surroundSelectedText('*')} title="Italic">
		<span class="material-icons-outlined"> format_italic </span>
	</button>
	<button on:click={() => editor.surroundSelectedText('~~')} title="Strikethrough">
		<span class="material-icons-outlined"> format_strikethrough </span>
	</button>
	<button on:click={() => editor.toNewLine('#')} title="Header 1">
		<span class="span-text">h1</span>
	</button>
	<button on:click={() => editor.toNewLine('##')} title="Header 2">
		<span class="span-text">h2</span>
	</button>

	<span class="divider" />

	<button on:click={() => editor.toNewLine('-')} title="List">
		<span class="material-icons-outlined"> format_list_bulleted </span>
	</button>
	<button on:click={() => editor.toNewLine('1.')} title="Numbered List">
		<span class="material-icons-outlined">format_list_numbered</span>
	</button>
	<button on:click={addCodeBlock} title="Code">
		<span class="material-icons-outlined"> code </span>
	</button>

	<span class="divider" />

	<button on:click={() => editor.toNewLine('[title](link)')} title="Link">
		<span class="material-icons-outlined"> link </span>
	</button>
	<button on:click={addImageBlock} title="Image">
		<span class="material-icons-outlined"> image </span>
	</button>
	<button on:click={() => (imageMenuOpen = true)} title="Upload Files">
		<span class="material-icons-outlined"> upload_file </span>
	</button>

	<span class="divider" />

	<button on:click={() => (helpMenuOpen = true)} title="Help">
		<span class="material-icons-outlined"> help </span>
	</button>
</div>
<ImageMenu bind:imageMenuOpen blogId={blog && blog.id ? blog.id : ''} />
<MarkdownHelpMenu bind:helpMenuOpen />

<style>
	.buttons {
		position: sticky;
		top: 0rem;
		height: 32px;
		display: flex;
		align-items: center;

		z-index: 50;

		background: #eee;

		overflow-x: auto;
	}
	button .span-text {
		font-weight: bold;
	}
	button {
		position: relative;
		background: none;
		outline: none;
		border: none;

		width: 32px;
		height: 32px;

		border-radius: 5px;
		color: grey;
	}

	button span {
		display: flex;
	}

	button:hover {
		background: #00000020;
	}

	button:active {
		background: #00000050;
	}

	.divider {
		content: '';
		width: 2px;
		height: 1.5rem;
		background: lightgrey;
		margin: 0.5rem;
	}
</style>
