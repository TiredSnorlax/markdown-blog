<script lang="ts">
	const goBack = () => {
		if (history) history.go(-2);
	};
</script>

<div>
	<h1>You are not allowed to view that page</h1>
	<p>Please either login or request for the owner to make it public</p>

	<button on:click={goBack}>Go back</button>
</div>
