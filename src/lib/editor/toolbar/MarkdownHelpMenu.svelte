<script lang="ts">
	import MenuWrapper from '$lib/components/MenuWrapper.svelte';
	import { cheatsheet } from '$lib/editor/toolbar/MarkdownCheatSheet';

	export let helpMenuOpen: boolean;
</script>

<MenuWrapper bind:open={helpMenuOpen}>
	<h2>Syntax</h2>
	<table>
		<tr>
			<th>Element</th>
			<th>Markdown Syntax</th>
			<th>Output</th>
		</tr>
		{#each cheatsheet as item}
			<tr>
				<td>{item.element}</td>
				<td><pre>{item.markdown}</pre></td>
				<td><div contenteditable="false" bind:innerHTML={item.output} /></td>
			</tr>
		{/each}
	</table>
</MenuWrapper>

<style>
	h2 {
		font-size: 2rem;
		text-align: start;
	}

	table {
		width: 100%;
		margin-bottom: 2rem;

		font-size: 1rem;
	}

	pre {
		background: none;
	}

	th {
		font-size: 1.2rem;
		font-weight: normal;
	}
</style>
