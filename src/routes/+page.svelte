<script lang="ts">
	import { convertToHtml, groupTokens, handleUnorderedLists, tokenise } from '$lib/parser';
	import {
		replaceSelectedText,
		getIndentLevel,
		insertString,
		clearLineBeforeCursor,
		getParentElementOfLine,
		getCurrentLine
	} from '$lib/markdown/helper';

	let inputTextArea: HTMLDivElement;
	let markdownOutput: HTMLDivElement;

	const pressRender = () => {
		let doc = inputTextArea.innerText;
		console.log(doc);
		let tokens = tokenise(doc);
		if (!tokens) return;
		let blocks = groupTokens(tokens);
		let html = convertToHtml(blocks);

		if (html) markdownOutput.innerHTML = html;
	};

	const onTextareaKey = (e: KeyboardEvent) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			console.log('Tab pressed');
			insertString('\t');
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const indentLevel = getIndentLevel();
			let sel = window.getSelection();

			const currentLine = getCurrentLine();
			if (currentLine?.match(/^[\s]+$/gm)) {
				console.log('there is no further content');
				clearLineBeforeCursor();
			} else {
				let parentEle = getParentElementOfLine() as HTMLDivElement;
				console.log(parentEle, 'parent');

				let range = sel?.getRangeAt(0);
				const existingContent =
					range?.startContainer?.textContent?.substring(range.startOffset) || null;

				console.log('existingContent', existingContent?.trim());
				let newRange = document.createRange();
				let startOffset = range?.startOffset || 0;

				newRange.setStart(range?.startContainer!, startOffset);

				if (existingContent) {
					newRange.setEndAfter(range?.startContainer!);
				}

				console.log(newRange);
				newRange.deleteContents();

				let div = document.createElement('div');
				let br = document.createElement('br');
				let inner = document.createTextNode(existingContent ?? '');

				div.appendChild(inner);

				div.appendChild(br);

				if (parentEle) parentEle.after(div);
				sel?.collapse(div.firstChild);

				if (indentLevel) {
					console.log('inserting string');
					for (let i = 0; i < indentLevel; i++) insertString('\t');
				}
			}
		} else if (e.key === 'Shift') {
			// clearLineBeforeCursor();
		}
	};

	const onPaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain');
		const formatted = text?.split('\n') || [];
		// console.log(formatted);
		if (!text) return;

		const selection = window.getSelection();
		const range = document.getSelection()?.getRangeAt(0);

		if (!range) return;
		range.deleteContents();

		const textNode = document.createTextNode(text);
		range.insertNode(textNode);
		range.selectNodeContents(textNode);
		range.collapse(false);
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(range);
		}

		console.log(formatted);

		var focusedNode = selection?.focusNode;

		while (focusedNode?.parentNode !== inputTextArea || focusedNode === null) {
			focusedNode = focusedNode?.parentNode;
		}

		console.log(focusedNode);
		// let focusedNode = selection?.focusNode;
		console.log(focusedNode);
		for (let i = formatted.length - 1; i > 0; i--) {
			let divEle = document.createElement('div');
			// let frag = document.createDocumentFragment();
			const textNode = document.createTextNode(formatted[i]);

			divEle.appendChild(textNode);
			if (focusedNode && focusedNode.nextSibling) {
				inputTextArea.insertBefore(divEle, focusedNode.nextSibling);
			} else if (focusedNode) {
				console.log('no next sibling');
				inputTextArea.appendChild(divEle);
			}
		}

		console.log(selection);
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(range);
		}
	};
</script>

<div class="container">
	<div class="utilityBar">
		<button on:click={() => replaceSelectedText('**')}>Bold</button>
		<button on:click={() => replaceSelectedText('*')}>Italics</button>
	</div>
	<section class="left">
		<button on:click={pressRender}>Render</button>
		<!-- <textarea on:keydown={onTextareaKey} bind:this={inputTextArea} /> -->
		<div
			contenteditable="true"
			on:paste={onPaste}
			on:keydown={onTextareaKey}
			bind:this={inputTextArea}
		>
			<div>Edit me</div>
		</div>
	</section>
	<section class="right">
		<div class="output" bind:this={markdownOutput} />
	</section>
</div>

<style>
	.container {
		padding-top: 8rem;
		height: 100svh;
		width: 100vw;

		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.left {
		padding: 1rem;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.left > div {
		flex: 1 1 auto;
		width: 100%;
		padding: 1rem;

		display: inline-block;

		font-family: Arial, Helvetica, sans-serif;
	}

	:global(.left > div div) {
		white-space: pre-wrap;
	}

	.utilityBar {
		position: fixed;
		top: 4rem;
		left: 2rem;
		right: 2rem;
		background: #eee;
		border: 1px solid grey;
		border-radius: 2rem;
		padding: 0.5rem;
	}
</style>
