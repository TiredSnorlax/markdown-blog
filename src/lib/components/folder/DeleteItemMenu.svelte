<script lang="ts">
	export let fileType: string;
	export let fileName: string;
	export let deleteFunction: () => void;
	export let deleteMenuOpen: boolean;
</script>

{#if deleteMenuOpen}
	<button class="bg" on:click|self={() => (deleteMenuOpen = false)}>
		<div class="menu">
			<p>Delete {fileType}: <strong>{fileName}</strong>?</p>
			<div class="btnContainer">
				<button on:click={() => (deleteMenuOpen = false)}>No</button>
				<button on:click={deleteFunction}>Yes</button>
			</div>
		</div>
	</button>
{/if}

<style>
	.bg {
		position: fixed;
		inset: 0;
		width: 100%;

		background: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		outline: none;

		z-index: 100;
	}

	.menu {
		border-radius: 0.5rem;
		background: white;
		padding: 1rem;
	}

	.menu p {
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
