<script lang="ts">
	import { page } from '$app/stores';
	import TaskBar from '$lib/components/TaskBar.svelte';

	let hideTaskBar = false;
	const checkIfHideTaskBar = (path: string) => {
		if (path.match(/\/blog\/.+\/edit/)) {
			hideTaskBar = true;
		} else {
			hideTaskBar = false;
		}
	};
	$: checkIfHideTaskBar($page.url.pathname);
</script>

{#if !hideTaskBar}
	<TaskBar />
{/if}
<slot />
