<script lang="ts">
	import { slide } from 'svelte/transition';

	export let renameMenuOpen: boolean;
	export let newName: string;
	export let renameFolder: () => void;
</script>

{#if renameMenuOpen}
	<button class="background" on:click|self={() => (renameMenuOpen = false)}>
		<div class="menu" transition:slide>
			<input class="titleInput" bind:value={newName} placeholder="New name" />

			<div class="btnContainer">
				<button on:click={() => (renameMenuOpen = false)}>Cancel</button>
				<button on:click={renameFolder}>Rename</button>
			</div>
		</div>
	</button>
{/if}

<style>
	.background {
		position: fixed;
		inset: 0;
		width: 100%;

		border: none;
		outline: none;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}
	.menu {
		padding: 1rem;
		background: white;

		border-radius: 0.5rem;
	}

	.titleInput {
		font-size: 1.5rem;
		border: 1px solid grey;
		border-radius: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 2rem;
	}

	.btnContainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.btnContainer button {
		font-size: 1.2rem;
		border-radius: 0.5rem;
		padding-inline: 1rem;
		padding-block: 0.5rem;

		border: none;
		outline: none;
		background: lightskyblue;
		color: white;

		cursor: pointer;
	}

	.btnContainer button:first-child {
		background: lightgrey;
	}
</style>
