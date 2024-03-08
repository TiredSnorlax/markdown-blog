<script lang="ts">
	import TextEditor from '$lib/components/editor/TextEditor.svelte';
	import ToolBar from '$lib/components/editor/toolbar/ToolBar.svelte';
	import type { IBlog } from '$lib/types';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MarkdownOutput from '$lib/components/MarkdownOutput.svelte';
	import { fly } from 'svelte/transition';
	import TryoutEditor from '$lib/components/editor/TryoutEditor.svelte';
	import type { FieldValue } from 'firebase/firestore';

	let blog: IBlog | null = {
		parentId: 'root',
		createdAt: {} as FieldValue,
		isPublic: false,
		ownerId: 'ZCWEnqZFiNgN583E6ohdrw7e5NU2',
		title: 'testing',
		lastEdited: {} as FieldValue,
		content:
			'# Showcase\n\nThis is a showcase of all the features of the markdown parser. The syntax can be found [here](https://www.markdownguide.org/basic-syntax/) and [extended syntax](https://www.markdownguide.org/extended-syntax/).\n\nDo note that the editor itself is buggy and will be fixed in the future.\n\n## Basic Syntax\n\nThese are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.\n\n### Heading\n\n# H1\n## H2\n### H3\n\n### Bold\n\n**bold text**\n\n### Italic\n\n*italicized text*\n\n### Blockquote\n\n> blockquote\n>> fds\n\n### Ordered List\n\n1. First item\n1. Second item\n3. Third item\n\t4. fds\n\t\t- fdsa\n\t5. fdsa\n\n### Unordered List\n\n- First item\n- Second item\n- Third item\n\n### Code\n\n`code`\n\n### Horizontal Rule\n\n---\n\n### Link\n\n[Markdown Guide](https://www.markdownguide.org)\n\n### Image\n\n![alt text](https://www.markdownguide.org/assets/images/tux.png)\n\n## Extended Syntax\n\nThese elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.\n\n### Table\n\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |\n\n### Fenced Code Block\n\n```\n{\n  "firstName": "John",\n  "lastName": "Smith",\n  "age": 25\n}\n```\n\n\n### Strikethrough\n\n~~The world is flat.~~\n\n### Task List\n\n- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media\n'
	};

	let markdownContent: string | null = null;

	let newTitle: string | null = null;

	let editorOpen = true;
	let outputOpen = true;

	let resizeClosed: 'editor' | 'output' | null = null;

	const updateOutput = (content: string) => {
		markdownContent = content;
	};

	const resizeThreshold = 650;
	const onResize = () => {
		if (window.innerWidth <= resizeThreshold && editorOpen === outputOpen && editorOpen === true) {
			outputOpen = false;
			resizeClosed = null;
		} else if (window.innerWidth > resizeThreshold) {
			if (resizeClosed === null) {
				outputOpen = true;
				editorOpen = true;
			}
		}
	};

	onMount(() => {
		updateOutput(blog?.content || '');
	});
</script>

<svelte:window on:resize={onResize} />
<div class="container">
	<ToolBar bind:newTitle {blog} bind:editorOpen bind:outputOpen bind:resizeClosed tryout={true} />
	<main>
		{#if editorOpen}
			<section class="left" transition:fly={{ x: '-50vw' }}>
				<TryoutEditor {updateOutput} {blog} />
			</section>
		{/if}
		{#if outputOpen}
			<section class="right" transition:fly={{ x: '50vw' }}>
				<MarkdownOutput {markdownContent} />
			</section>
		{/if}
	</main>
</div>

<style>
	.container {
		height: 100svh;
		width: 100%;

		display: flex;
		flex-direction: column;
		font-family: 'Roboto Condensed', sans-serif;
		font-size: 16px;
	}

	main {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		height: calc(100svh - 3rem);
	}

	.left {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;

		overflow-y: auto;
	}

	.right {
		overflow-y: auto;
	}
</style>
