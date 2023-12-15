<script lang="ts">
	import { browser } from '$app/environment';
	import type { IBlog } from '$lib/types';
	import { surroundSelectedText, toNewLine } from '.';
	import { insertOnNewLine } from '../helper';
	import ImageMenu from './ImageMenu.svelte';
	import ShareBlogMenu from './ShareBlogMenu.svelte';

	export let newTitle: string | null = 'Default';
	export let blog: IBlog | null;

	let imageMenuOpen = false;
	let shareMenuOpen = false;

	const addCodeBlock = () => {
		let sel = window.getSelection();
		if (!sel?.rangeCount) return;
		let range = sel?.getRangeAt(0);
		let content = range?.toString();
		if (content) {
			surroundSelectedText('`');
		} else {
			insertOnNewLine('```', true);
			insertOnNewLine('', true);
			insertOnNewLine('```', true);
		}
	};

	const addImageBlock = () => {
		toNewLine('![Description](URL)');
	};
</script>

<div class="toolBar">
	<a href={browser ? window.location.origin + '/folder/' + blog?.parentId : ''}>
		<span class="material-icons-outlined"> keyboard_backspace </span>
	</a>
	<div class="buttons">
		<button on:click={() => surroundSelectedText('**')}>
			<span class="material-icons-outlined"> format_bold </span>
			<p>Bold</p></button
		>
		<button on:click={() => surroundSelectedText('*')}>
			<span class="material-icons-outlined"> format_italic </span>
			<p>Italics</p></button
		>
		<button on:click={() => surroundSelectedText('~~')}>
			<span class="material-icons-outlined"> format_strikethrough </span>
			<p>Strikethrough</p></button
		>
		<button on:click={() => toNewLine('#')}>
			<span class="span-text">h1</span>
			<p>Heading 1</p>
		</button>
		<button on:click={() => toNewLine('##')}>
			<span class="span-text">h2</span>
			<p>Heading 2</p>
		</button>

		<button on:click={() => toNewLine('*')}>
			<span class="material-icons-outlined"> format_list_bulleted </span>
			<p>Unordered List</p>
		</button>

		<button on:click={() => toNewLine('1.')}>
			<span class="material-icons-outlined">format_list_numbered</span>
			<p>Ordered List</p>
		</button>

		<button on:click={addCodeBlock}>
			<span class="material-icons-outlined"> code </span>
			<p>Code</p>
		</button>

		<button on:click={addImageBlock}>
			<span class="material-icons-outlined"> image </span>
			<p>Images</p>
		</button>

		<button on:click={() => (imageMenuOpen = true)}>
			<span class="material-icons-outlined"> upload_file </span>
			<p>Upload</p>
		</button>
	</div>
	<div class="right">
		<input type="text" class="newTitleInput" bind:value={newTitle} />
		<button class="shareBtn" on:click={() => (shareMenuOpen = true)}>
			<span class="material-icons-outlined"> share </span>
			Share</button
		>
	</div>
	<ImageMenu bind:imageMenuOpen blogId={blog && blog.id ? blog.id : ''} />
	<ShareBlogMenu {blog} bind:shareMenuOpen />
</div>

<style>
	.toolBar {
		top: 0rem;
		position: sticky;
		background: #aaa;

		padding-inline: 1rem;
		padding-block: 5px;

		display: flex;
		justify-content: space-between;
		align-items: center;

		z-index: 100;
	}

	.toolBar .buttons {
		flex: 1 1 auto;
		display: grid;
		grid-auto-flow: columns;
		grid-template-columns: repeat(auto-fit, 32px);
		gap: 0.5rem;
	}

	a {
		color: initial;
		text-decoration: none;
		display: flex;
		padding-right: 0.5rem;
	}

	a span {
		display: flex;
		font-size: 2rem;
		color: #333;
	}

	button {
		position: relative;
		background: none;
		outline: none;
		border: none;

		width: 32px;
		height: 32px;

		border-radius: 5px;
		color: white;
	}

	button span {
		display: flex;
	}

	button .span-text {
		font-size: 1rem;
		font-weight: bold;
	}

	button:hover {
		background: #ffffff40;
	}

	button:active {
		background: #ffffff60;
	}

	button:hover p {
		display: block;
	}

	button p {
		display: none;
		padding: 5px;
		background: grey;
		border-radius: 5px;
		color: white;

		width: auto;

		position: absolute;
	}

	.right {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.right .shareBtn {
		background: blue;
		color: white;

		width: initial;
		height: initial;
		padding: 0.5rem;
		padding-inline: 1rem;

		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		font-size: 1rem;

		border-radius: 0.5rem;
	}

	.shareBtn span {
		font-size: 1rem;
	}

	.newTitleInput {
		background: none;
		outline: none;
		border: 1px solid #777;
		border-radius: 0.25rem;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;

		color: #333;
	}

	.newTitleInput:hover,
	.newTitleInput:focus {
		background: #ffffff20;
		border-color: black;
	}
</style>
