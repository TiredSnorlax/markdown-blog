<script lang="ts">
	import type { IBlog } from '$lib/types';

	export let blog: IBlog;
</script>

<a href="./blog/{blog.id}">
	<div class="container">
		<div>
			<h2>{blog.title}</h2>
			<p>{blog.description}</p>
		</div>
		<span>{blog.createdAt}</span>
	</div>
</a>

<style>
	a {
		flex: 1 1 250px;
		max-width: 250px;
		color: initial;
		text-decoration: initial;
	}

	.container {
		padding: 0.5rem;
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		gap: 1rem;

		box-shadow: 5px 5px 0px 0px rgba(220, 220, 220, 1);
		border: 1px solid rgb(200, 200, 200);
		border-radius: 0.5rem;

		transition: all 0.3s ease-out;
	}

	.container:hover {
		translate: 0 -5px;
		box-shadow: 10px 10px 1px 1px rgba(220, 220, 220, 0.7);
	}

	h2 {
		margin: 0;
		font-size: 2rem;
	}

	p {
		color: grey;
		font-size: 1rem;
		margin: 0;
	}

	span {
		align-self: flex-end;
		color: grey;
		font-size: 12px;
	}
</style>
