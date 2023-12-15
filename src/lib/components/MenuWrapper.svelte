<script lang="ts">
	import { slide } from 'svelte/transition';

	export let open: boolean;
</script>

{#if open}
	<button on:click|self={() => (open = false)} class="background" transition:slide>
		<div class="menu">
			<slot />
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

		user-select: text;
	}
</style>
