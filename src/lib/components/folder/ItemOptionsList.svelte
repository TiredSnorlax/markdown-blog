<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	export let isOwner: boolean;
	export let optionsOpen: boolean;
	export let renameMenuOpen: boolean;
	export let deleteMenuOpen: boolean;
	export let detailsMenuOpen: boolean;
</script>

{#if optionsOpen}
	<div class="bg" transition:fade><button on:click={() => (optionsOpen = false)} /></div>
	<div class="options" transition:slide>
		{#if isOwner}
			<button
				on:click={() => {
					renameMenuOpen = true;
					optionsOpen = false;
				}}
			>
				<span class="material-icons-outlined"> drive_file_rename_outline </span>
				Rename</button
			>
			<button
				on:click={() => {
					deleteMenuOpen = true;
					optionsOpen = false;
				}}
			>
				<span class="material-icons-outlined"> delete </span>
				Delete</button
			>
		{/if}
		<button
			on:click={() => {
				detailsMenuOpen = true;
				optionsOpen = false;
			}}
		>
			<span class="material-icons-outlined"> info </span>
			Details</button
		>
	</div>
{/if}

<style>
	button {
		background: none;
		outline: none;
		border: none;
	}

	.bg {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.2);
		z-index: 100;
	}

	.bg button {
		width: 100%;
		height: 100%;
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

		z-index: 200;
	}

	.options span {
		display: none;
	}

	.options button {
		border-radius: 0;
		padding: 0.5rem;
		width: 100%;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.options button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 650px) {
		.options {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			top: auto;
			margin: 1rem;
			margin-bottom: 0;
			border-bottom-right-radius: 0;
			border-bottom-left-radius: 0;
		}

		.options span {
			display: block;
		}
	}
</style>
