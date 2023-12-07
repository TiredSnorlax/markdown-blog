<script lang="ts">
	export let url: string;
</script>

<a href={url}>
	<div>
		<span class="material-icons-outlined"> home </span>
	</div>
</a>

<style>
	a {
		color: initial;
		text-decoration: none;

		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 0.5rem;
		background: white;
		border-radius: 50%;
		box-shadow: 0 0 5px #ccc;

		transition: box-shadow 0.3s;
	}

	a:hover {
		box-shadow: 0 0 10px #ccc;
	}

	span {
		display: flex;
		font-size: 2rem;
	}
</style>
