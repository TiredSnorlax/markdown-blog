<script lang="ts">
	import { goto } from '$app/navigation';
	import type { IBlog } from '$lib/types';
	export let blog: IBlog;
</script>

<button class="item">
	<span class="material-icons-outlined"> article </span>
	<a href={window.location.origin + '/blog/' + blog.id}>{blog.title}</a>
	<button><span class="material-icons-outlined"> more_vert </span></button>
</button>

<style>
	.item {
		flex: 1 1 250px;
		min-width: 250px;
		max-width: 350px;

		border-radius: 0.5rem;

		background: none;
		outline: none;
		border: 2px solid lightgrey;

		padding: 0.5rem;

		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
	}

	.item a {
		margin: 0;
		font-size: 1.1rem;
		flex: 1 1 auto;
		text-align: left;
		text-decoration: none;
		color: initial;

		font-family: inherit;
	}

	.item a:hover {
		text-decoration: underline;
	}

	.item button {
		background: none;
		outline: none;
		border: none;
		border-radius: 100%;
		padding: 2px;
	}

	.item button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.item button span {
		display: flex;
	}
</style>
