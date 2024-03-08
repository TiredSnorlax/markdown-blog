<script lang="ts">
	import type { IBlog } from '$lib/types';
	import ShareBlogMenu from './ShareBlogMenu.svelte';

	export let newTitle: string | null = 'Default';
	export let blog: IBlog | null;
	export let editorOpen: boolean;
	export let outputOpen: boolean;
	export let resizeClosed: 'editor' | 'output' | null;
	export let tryout: boolean = false;

	let shareMenuOpen = false;

	const toggleEditor = () => {
		if (outputOpen) {
			editorOpen = !editorOpen;
			resizeClosed = 'editor';
		} else {
			outputOpen = true;
			editorOpen = false;
			resizeClosed = 'editor';
		}
	};

	const toggleOutput = () => {
		if (editorOpen) {
			outputOpen = !outputOpen;
			resizeClosed = 'output';
		} else {
			editorOpen = true;
			outputOpen = false;
			resizeClosed = 'output';
		}
	};

	const goBack = () => {
		history.go(-1);
	};
</script>

<div class="toolBar">
	<div class="left">
		<button on:click={goBack} class="backBtn">
			<span class="material-icons-outlined"> keyboard_backspace </span>
		</button>
		<input type="text" class="newTitleInput" bind:value={newTitle} />
		<div class="btnContainer">
			<button on:click={toggleEditor} title="Bold" class:selected={editorOpen}>
				<span class="material-icons-outlined"> edit </span>
			</button>
			<button on:click={toggleOutput} title="Bold" class:selected={outputOpen}>
				<span class="material-icons-outlined"> article </span>
			</button>
		</div>
	</div>
	{#if !tryout}
		<button class="shareBtn" on:click={() => (shareMenuOpen = true)}>
			<span class="material-icons-outlined"> share </span>
			<p>Share</p></button
		>
		<ShareBlogMenu {blog} bind:shareMenuOpen />
	{/if}
</div>

<style>
	.toolBar {
		top: 0;
		position: sticky;
		background: #aaa;

		padding-inline: 1rem;
		padding-block: 5px;

		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;

		height: 3rem;

		z-index: 80;
	}

	.toolBar .left {
		flex: 1 1 auto;
		display: flex;
		gap: 1rem;
	}

	.toolBar .backBtn {
		display: flex;
		background: lightgrey;
		border-radius: 100%;
		padding: 3px;

		width: 32px;
		height: 32px;

		display: flex;
		justify-content: center;
		align-items: center;

		border: none;
		outline: none;

		cursor: pointer;
	}

	.backBtn span {
		display: flex;
		font-size: 1.5rem;
		color: white;
	}

	.newTitleInput {
		flex: 1 1 auto;
		width: 0;
		max-width: 300px;
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
	.btnContainer button {
		position: relative;
		background: none;
		outline: none;
		border: none;

		width: 32px;
		height: 32px;

		border-radius: 5px;
		color: white;
	}

	.btnContainer button.selected {
		background: #00000030;
	}

	.btnContainer button span {
		display: flex;
	}

	.btnContainer button:hover {
		background: #ffffff40;
	}

	.btnContainer button:active {
		background: #ffffff60;
	}

	.shareBtn {
		background: blue;
		outline: none;
		border: none;
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

	@media (max-width: 650px) {
		.toolBar {
			padding-inline: 0.5rem;
		}

		.toolBar .left {
			gap: 0.5rem;
		}

		.shareBtn {
			padding: 0.5rem;
		}

		.shareBtn p {
			display: none;
		}
	}
</style>
