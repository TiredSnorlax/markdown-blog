<script lang="ts">
	import MenuWrapper from '$lib/components/MenuWrapper.svelte';

	export let fileType: string;
	export let fileName: string;
	export let deleteFunction: () => void;
	export let deleteMenuOpen: boolean;
</script>

<MenuWrapper bind:open={deleteMenuOpen}>
	<p>Delete {fileType}: <strong>{fileName}</strong>?</p>
	<div class="btnContainer">
		<button on:click={() => (deleteMenuOpen = false)}>No</button>
		<button on:click={deleteFunction}>Yes</button>
	</div>
</MenuWrapper>

<style>
	p {
		font-size: 1.5rem;
	}

	.btnContainer {
		margin-top: 2rem;
		display: flex;
		justify-content: space-between;
	}

	.btnContainer button {
		background: red;
		border: none;
		outline: none;
		padding: 0.5rem;
		padding-inline: 1rem;

		color: white;
		border-radius: 0.5rem;
		cursor: pointer;

		font-size: 1.2rem;
	}

	button:first-child {
		background: lightgrey;
	}
</style>
