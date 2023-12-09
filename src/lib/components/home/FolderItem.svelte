<script lang="ts">
	import { goto } from '$app/navigation';
	import type { IFolder } from '$lib/types';
	import { slide } from 'svelte/transition';

	let moreBtnEle: HTMLSpanElement;

	let optionsOpen = false;

	const click = (ev: Event) => {
		if (folder.id && ev.target !== moreBtnEle)
			goto(window.location.origin + '/folder/' + folder.id);
	};

	const toggleOptions = () => {
		optionsOpen = !optionsOpen;
	};

	export let folder: IFolder;
</script>

<button on:click={click} class="item">
	<span class="material-icons-outlined"> folder </span>
	<p>{folder.name}</p>
	<button on:click={toggleOptions}
		><span bind:this={moreBtnEle} class="material-icons-outlined"> more_vert </span></button
	>
	{#if optionsOpen}
		<div class="options" transition:slide>
			<button>Rename</button>
			<button>Delete</button>
			<button>Details</button>
		</div>
	{/if}
</button>

<style>
	.item {
		border: 2px solid lightgrey;
		outline: none;
		background: lightgrey;

		padding: 0.5rem;
		border-radius: 0.5rem;

		display: flex;
		justify-content: space-between;
		gap: 1.5rem;
		align-items: center;

		flex: 1 1 250px;
		max-width: 350px;
		min-width: 250px;

		position: relative;
	}

	.item p {
		margin: 0;
		font-size: 1.1rem;
		flex: 1 1 auto;
		text-align: left;
	}

	.item button {
		background: none;
		outline: none;
		border: none;
		border-radius: 100%;
		cursor: pointer;
		padding: 0;
	}

	.item button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.item button span {
		display: flex;
		border-radius: 100%;
		padding: 2px;
	}

	.options {
		padding-block: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		position: absolute;
		left: 100%;
		top: 1rem;

		background: white;
		border-radius: 0.5rem;

		box-shadow: 0 1px 2px 0 grey;
	}

	.options button {
		border-radius: 0;
		padding: 0.5rem;
		width: 100%;
		font-size: 1rem;
	}
</style>
