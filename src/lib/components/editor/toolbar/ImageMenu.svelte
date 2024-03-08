<script lang="ts">
	import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
	import { auth, storage } from '$lib/db/setup';
	import { userStore } from '$lib/stores';
	import MenuWrapper from '$lib/components/MenuWrapper.svelte';

	export let blogId: string;
	export let imageMenuOpen: boolean;

	interface IImage {
		url: string;
		name: string;
	}

	const user = userStore(auth);
	let images: IImage[] = [];

	let fileInputElement: HTMLInputElement;
	let imageFilesToUpload: File[] | null = null;

	let loading = false;

	let uploadOpen = false;

	let uploadDropZoneEle: HTMLDivElement;

	const openFileExplorer = () => {
		fileInputElement.click();
	};

	const handleFileSelection = () => {
		const files = fileInputElement.files;
		if (files) {
			imageFilesToUpload = Array.from(files);
		}
	};

	const getImageFiles = async () => {
		if (!$user) return;
		console.log('getting image files');
		const listRef = ref(storage, `${$user.uid}/${blogId}`);
		await listAll(listRef).then(async (res) => {
			let temp: IImage[] = [];
			for await (const imageRef of res.items) {
				const url = await getDownloadURL(imageRef);
				temp.push({ url, name: imageRef.name });
			}
			images = [...temp];
		});
		console.log(images);
	};

	const copyToClipboard = (link: string) => {
		navigator.clipboard.writeText(link);
	};

	const closeUploadSection = () => {
		uploadOpen = false;
		imageFilesToUpload = null;
	};

	const dropHandler = (ev: DragEvent) => {
		ev.preventDefault();
		uploadDropZoneEle.style.background = 'white';
		if (ev.dataTransfer && ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...ev.dataTransfer.items].forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file && imageFilesToUpload) {
						imageFilesToUpload = [...imageFilesToUpload, file];
					} else if (file) {
						imageFilesToUpload = [file];
					}
				}
			});
		} else if (ev.dataTransfer) {
			// Use DataTransfer interface to access the file(s)
			imageFilesToUpload = [...ev.dataTransfer.files];
		}
	};

	const dragOverHandler = (ev: DragEvent) => {
		ev.preventDefault();
		uploadDropZoneEle.style.background = '#e0e0f0';
	};

	const endDrag = (ev: DragEvent) => {
		ev.preventDefault();
		uploadDropZoneEle.style.background = 'none';
	};

	const uploadToDb = async (image: File) => {
		if (!$user) return;
		const storageRef = ref(storage, `${$user.uid}/${blogId}/${image.name}`);
		await uploadBytes(storageRef, image).then(() => {
			console.log('uploaded: ', image.name);
		});
	};

	const uploadPressed = async () => {
		if (!$user || !imageFilesToUpload) return;
		loading = true;

		await Promise.all(
			imageFilesToUpload.map(async (img) => {
				await uploadToDb(img);
			})
		);

		loading = false;
		getImageFiles();
		imageFilesToUpload = null;
		uploadOpen = false;
	};

	// TODO: add a notice for users that explains that uploaded images with the same
	// name will be overridden
	const deleteImage = async (name: string) => {
		if (!$user) return;

		const imageRef = ref(storage, `${$user.uid}/${blogId}/${name}`);
		await deleteObject(imageRef).then(() => {
			console.log(name + ' deleted');
			images = [...images.filter((image) => image.name !== name)];
		});
	};

	$: if (imageMenuOpen) {
		getImageFiles();
	}
</script>

<MenuWrapper bind:open={imageMenuOpen}>
	{#if $user}
		{#if uploadOpen}
			<div class="uploadSection">
				<h2>Upload Files</h2>
				<input
					type="file"
					accept="image/*"
					bind:this={fileInputElement}
					on:change={handleFileSelection}
					multiple
					hidden
				/>
				{#if imageFilesToUpload}
					<ol>
						{#each imageFilesToUpload as imageFile}
							<li>
								<p>{imageFile.name}</p>
							</li>
						{/each}
					</ol>
				{/if}
				<div
					class="dropzone"
					bind:this={uploadDropZoneEle}
					on:dragover={dragOverHandler}
					on:dragend={endDrag}
					on:dragleave={endDrag}
					on:drop={dropHandler}
				>
					<p>
						Drag images here or
						<button class="browseBtn" on:click={openFileExplorer}>Browse</button>
					</p>
				</div>
				<div class="btnContainer">
					{#if imageFilesToUpload && imageFilesToUpload.length > 0}
						<button class="cancelBtn" on:click={() => (imageFilesToUpload = null)}>Reset</button>
						<button class="uploadBtn" on:click={uploadPressed}
							>{loading ? 'Loading' : 'Upload'}</button
						>
					{:else}
						<button class="cancelBtn" on:click={closeUploadSection}>Cancel</button>
					{/if}
				</div>
			</div>
		{:else}
			<h2>Uploaded images</h2>
			{#if images && images.length > 0}
				<div class="imageList">
					{#each images as image}
						<div class="imageItem">
							<img src={image.url} title={image.name} alt="" />
							<div>
								<button on:click={() => copyToClipboard(image.url)}>{image.name}</button>
							</div>
							<button class="removeBtn" on:click={() => deleteImage(image.name)}
								><span class="material-icons-outlined"> remove </span></button
							>
						</div>
					{/each}
				</div>
			{:else}
				<p style="margin-bottom: 1rem;">There are no images uploaded</p>
			{/if}
			<button class="addFileBtn" on:click={() => (uploadOpen = true)}>Add Image</button>
		{/if}
	{:else}
		<p>Please login to use this</p>
	{/if}
</MenuWrapper>

<style>
	button {
		cursor: pointer;
	}

	img {
		max-width: 100px;
		max-height: 100px;
		border-radius: 3px;
		border: 1px solid black;
	}

	.imageItem {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.imageItem div:nth-child(2) {
		flex: 1 1 auto;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		background: #f0f0f0;
		border-radius: 0.5rem;

		position: relative;
	}

	.imageItem div:nth-child(2) button {
		border: none;
		outline: none;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
	}

	.imageItem .removeBtn {
		border-radius: 100%;
		background: lightgrey;
		padding: 3px;
		border: none;
	}

	.imageItem .removeBtn:hover {
		background: red;
	}

	.imageItem .removeBtn span {
		display: flex;
		font-size: 12px;
		color: white;
	}

	.imageList {
		overflow-y: scroll;
		max-height: 500px;
	}

	.dropzone {
		border: 3px dashed lightblue;
		width: 200px;
		height: 120px;
		font-size: 18px;

		padding: 1rem;
		margin: 1rem;

		border-radius: 1rem;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.browseBtn {
		font-size: 18px;
		background: none;
		outline: none;
		border: none;
		color: blue;
	}

	.btnContainer {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.cancelBtn {
		width: 100%;
		padding-block: 0.5rem;
		background: lightgrey;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: white;
		border: none;
		outline: none;
	}

	.addFileBtn {
		width: 100%;
		padding-block: 0.5rem;
		background: blue;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: white;
		border: none;
		outline: none;
		margin-block: 0.5rem;
	}

	.uploadBtn {
		width: 100%;
		padding-block: 0.5rem;
		background: blue;
		border-radius: 0.5rem;
		font-size: 1rem;
		color: white;
		border: none;
		outline: none;
		margin-block: 0.5rem;
	}
</style>
