<script lang="ts">
	import UserProfileMenu from '$lib/components/UserProfileMenu.svelte';
</script>

<nav>
	<a href="./../../">
		<span class="material-icons-outlined"> home </span>
	</a>
	<UserProfileMenu />
</nav>

<style>
	nav {
		background: white;
		border-bottom: 1px solid grey;
		padding: 0.5rem;
		padding-inline: 1rem;

		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	a {
		color: initial;
		text-decoration: none;
		display: flex;
		padding-right: 0.5rem;
	}

	a span {
		display: flex;
		font-size: 2rem;
		color: #333;
	}
</style>
