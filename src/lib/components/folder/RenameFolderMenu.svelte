<script lang="ts">
	import MenuWrapper from '../MenuWrapper.svelte';

	export let fileType: string;
	export let renameMenuOpen: boolean;
	export let newName: string;
	export let renameFunction: () => void;
</script>

<MenuWrapper bind:open={renameMenuOpen}>
	<input
		class="titleInput"
		bind:value={newName}
		placeholder={fileType === 'Blog' ? 'New title of blog' : 'New name for folder'}
	/>

	<div class="btnContainer">
		<button on:click={() => (renameMenuOpen = false)}>Cancel</button>
		<button on:click={renameFunction}>Rename</button>
	</div>
</MenuWrapper>

<style>
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
