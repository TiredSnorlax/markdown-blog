<script lang="ts">
	import NewBlogDialog from '$lib/components/home/NewBlogDialog.svelte';
	import type { User } from 'firebase/auth';
	import { collection, getDocs, query, where } from 'firebase/firestore';
	import { db, auth } from '$lib/db/setup';
	import { userStore } from '$lib/stores';
	import type { IBlog } from '$lib/types';
	import BlogItem from '$lib/components/home/BlogItem.svelte';

	let dialogOpen = false;

	let user = userStore(auth);
	let blogs: IBlog[] = [];

	const getBlogs = async (user: User | null) => {
		if (!user) return;
		const blogsRef = collection(db, 'blogs');
		const q = query(blogsRef, where('ownerId', '==', user.uid));

		const snapshot = await getDocs(q);

		blogs = [];
		snapshot.forEach((doc) => {
			let data = doc.data() as IBlog;
			blogs.push({ ...data, id: doc.id });
		});

		console.log(blogs);
	};

	$: getBlogs($user);
</script>

<main>
	<h1>Dashboard</h1>

	<h2>My Blogs</h2>
	<div class="blogsContainer">
		{#each blogs as blog}
			<BlogItem {blog} />
		{/each}
	</div>
	<button on:click={() => (dialogOpen = true)}>Create</button>

	<NewBlogDialog bind:dialogOpen />
</main>

<style>
	.blogsContainer {
		display: flex;
		flex-wrap: wrap;

		padding: 2rem;

		width: 100%;
	}
</style>
