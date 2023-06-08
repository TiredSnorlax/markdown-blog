<script lang="ts">
	import { surroundSelectedText, toNewLine } from '.';
	import { insertOnNewLine } from '../helper';

	const addCodeBlock = () => {
		let sel = window.getSelection();
		if (!sel?.rangeCount) return;
		let range = sel?.getRangeAt(0);
		let content = range?.toString();
		if (content) {
			surroundSelectedText('`');
		} else {
			insertOnNewLine('```');
			insertOnNewLine('');
			insertOnNewLine('```');
		}
	};
</script>

<div class="toolBar">
	<div class="buttons">
		<button on:click={() => surroundSelectedText('**')}>
			<span class="material-icons-outlined"> format_bold </span>
			<p>Bold</p></button
		>
		<button on:click={() => surroundSelectedText('*')}>
			<span class="material-icons-outlined"> format_italic </span>
			<p>Italics</p></button
		>
		<button on:click={() => surroundSelectedText('~~')}>
			<span class="material-icons-outlined"> format_strikethrough </span>
			<p>Strikethrough</p></button
		>
		<button on:click={() => toNewLine('#')}>
			<span class="span-text">h1</span>
			<p>Heading 1</p>
		</button>
		<button on:click={() => toNewLine('##')}>
			<span class="span-text">h2</span>
			<p>Heading 2</p>
		</button>

		<button on:click={() => toNewLine('*')}>
			<span class="material-icons-outlined"> format_list_bulleted </span>
			<p>Unordered List</p>
		</button>

		<button on:click={() => toNewLine('1.')}>
			<span class="material-icons-outlined">format_list_numbered</span>
			<p>Ordered List</p>
		</button>

		<button on:click={addCodeBlock}>
			<span class="material-icons-outlined"> code </span>
			<p>Code</p></button
		>
	</div>
</div>

<style>
	.toolBar {
		top: 0rem;
		position: sticky;
		background: #444;
		border: 1px solid grey;
		padding: 0.5rem;
	}

	.toolBar .buttons {
		display: grid;
		grid-auto-flow: columns;
		grid-template-columns: repeat(auto-fit, 32px);
		gap: 0.5rem;
	}

	button {
		position: relative;
		background: none;
		outline: none;
		border: none;

		width: 32px;
		height: 32px;

		border-radius: 5px;
		color: white;
	}

	button span {
		display: flex;
	}

	button .span-text {
		font-size: 1rem;
		font-weight: bold;
	}

	button:hover {
		background: #ffffff40;
	}

	button:active {
		background: #ffffff60;
	}

	button:hover p {
		display: block;
	}

	button p {
		display: none;
		padding: 5px;
		background: grey;
		border-radius: 5px;
		color: white;

		width: auto;

		position: absolute;
	}
</style>
