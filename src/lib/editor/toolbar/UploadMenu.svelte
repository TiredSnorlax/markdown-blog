<script lang="ts">
	import { storage, auth } from '$lib/db/setup';
	import { ref, uploadBytes } from 'firebase/storage';

	import { userStore } from '$lib/stores';

	export let uploadMenuOpen: boolean;
	export let toggleUploadMenu: () => void;
	export let blogId: string;

	let imageFiles: FileList | null = null;

	let user = userStore(auth);

	$: if (imageFiles) {
		console.log(imageFiles);
	}

	const uploadToDb = async () => {
		if (!$user || !imageFiles) return;
		for await (const image of imageFiles) {
			const storageRef = ref(storage, `${$user.uid}/${blogId}/${image.name}`);

			uploadBytes(storageRef, image).then((snapshot) => {
				console.log('Uploaded: ', image.name);
				console.log(snapshot);
			});
		}
	};
</script>

{#if uploadMenuOpen}
	<button class="background" on:click|self={toggleUploadMenu}>
		<div class="menu">
			<h2>Upload Images</h2>
			<input type="file" accept="image/*" bind:files={imageFiles} multiple />
			{#if imageFiles}
				<ol>
					{#each imageFiles as image}
						<li>{image.name}</li>
					{/each}
				</ol>
				<button on:click={() => (imageFiles = null)}>Cancel</button>
				<button on:click={uploadToDb}>Upload</button>
			{/if}
		</div>
	</button>
{/if}

<style>
	.background {
		background: #00000050;
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		border: none;

		z-index: 1000;
	}

	.menu {
		padding: 1rem;
		background: #ffffff;
	}
</style>
