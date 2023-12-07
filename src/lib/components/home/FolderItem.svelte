<script lang="ts">
	import { goto } from '$app/navigation';
	import type { IFolder } from '$lib/types';

	const click = () => {
		if (folder.id) goto(window.location.origin + '/folder/' + folder.id);
	};

	export let folder: IFolder;
</script>

<button on:click={click}>
	<p>{folder.name}</p>
</button>

<style>
	button {
		border: 1px solid lightgrey;
		outline: none;

		padding: 0.5rem;
		padding-inline: 1rem;
		border-radius: 0.5rem;
	}
</style>
