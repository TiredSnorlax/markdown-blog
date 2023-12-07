import { enterSpecialRules } from '$lib/parser/rules';

export const getParentNodeOfLine = () => {
	const sel = window.getSelection();
	if (!sel) return;
	const range = sel.getRangeAt(0);
	let divContainer: Node | ParentNode | null = range.startContainer;
	while (divContainer !== null && divContainer.nodeName !== 'DIV') {
		divContainer = divContainer.parentNode;
	}
	return divContainer;
};

export const checkIfEditable = (parent: Node | null | undefined) => {
	if (!parent) return false;
	const ele = document.getElementById('editor');
	console.log(!ele?.contains(parent));
	return !ele?.contains(parent);
};

export const getCurrentLine = () => {
	const sel = window.getSelection();
	if (!sel) return;
	const parent = getParentNodeOfLine();
	return parent?.textContent || null;
};

export const getIndentLevel = () => {
	const currentLine = getCurrentLine();
	console.log('current line in indent level', currentLine);
	if (!currentLine) return 0;

	const tabArray = currentLine?.match(/^[\t]+/);
	if (!tabArray) return 0;
	const indentLevel = tabArray[0].length;
	return indentLevel;
};

export const isParentTheEditor = (parent: HTMLElement | ParentNode | Node) => {
	const _parent = parent as HTMLElement;
	return _parent.getAttribute('data-iseditor');
};

export const insertString = (str: string) => {
	const parentNode = getParentNodeOfLine() as HTMLDivElement;
	if (checkIfEditable(parentNode)) return;

	const sel = window.getSelection();
	if (!sel) return;

	const range = sel.getRangeAt(0);
	range.deleteContents();

	const tabNode = document.createTextNode(str);
	console.log(tabNode);
	range.insertNode(tabNode);
	range.setStartAfter(tabNode);
	range.setEndAfter(tabNode);
};

export const insertOnNewLine = (contentToAdd: string, collapseStart: boolean) => {
	const parentNode = getParentNodeOfLine() as HTMLDivElement;
	if (checkIfEditable(parentNode)) return;

	console.log('new func');
	const sel = window.getSelection();

	const div = document.createElement('div');

	// let inner: HTMLBRElement | Text = document.createElement('br');
	// if (contentToAdd) {
	//   inner = document.createTextNode(contentToAdd!);
	// }

	const inner = document.createTextNode(contentToAdd);
	console.log(inner);
	// let br = document.createElement("br");

	div.appendChild(inner);
	// div.appendChild(br);

	const isEditor = isParentTheEditor(parentNode);

	if (isEditor) {
		parentNode.prepend(div);
	} else {
		parentNode.after(div);
	}
	sel?.removeAllRanges();
	sel?.collapse(div.firstChild, collapseStart ? 0 : contentToAdd.length);
};

export const enterPressed = () => {
	const parentNode = getParentNodeOfLine();
	if (checkIfEditable(parentNode)) return;

	const indentLevel = getIndentLevel();
	const currentLine = getCurrentLine();

	console.log(currentLine);
	const sel = window.getSelection();
	if (!sel) return;
	console.log(sel);
	const lineText = sel.focusNode?.nodeValue;

	const range = sel.getRangeAt(0);

	if (range.startOffset !== range.endOffset) {
		console.log(range);
		const existingText = range.toString();
		range.deleteContents();
		insertOnNewLine(existingText, true);
		return;
	}

	let textBeforeCursor = '';
	let textAfterCursor = '';
	if (lineText) {
		textBeforeCursor = lineText.slice(0, sel.focusOffset);
		textAfterCursor = lineText.slice(sel.focusOffset);
		if (sel.anchorNode) sel.anchorNode.nodeValue = textBeforeCursor;
		textAfterCursor = checkLineForSpecialChars(lineText, textAfterCursor, indentLevel);
	}

	insertOnNewLine(textAfterCursor, true);
};

const checkLineForSpecialChars = (lineText: string, textToAdd: string, indentLevel: number) => {
	let text = textToAdd;
	for (const block of enterSpecialRules) {
		if (lineText.match(block[0])) {
			console.log(block[1]);
			switch (block[1]) {
				case 'UNORDERED_LIST': {
					text = '* ' + textToAdd;
					break;
				}
				case 'ORDERED_LIST': {
					const number = parseInt(lineText.replaceAll(/\t/g, '').split('.')[0]) + 1;
					const padding = '\t'.repeat(indentLevel);
					text = padding + number + '. ' + textToAdd;
					break;
				}
				default:
					break;
			}
			return text;
		}
	}
	return text;
};

export const pasteText = (text: string) => {
	const parentNode = getParentNodeOfLine();
	if (checkIfEditable(parentNode)) return;

	const formatted = text?.split('\n') || [];
	// console.log(formatted);
	if (!text) return;

	const selection = window.getSelection();
	const range = document.getSelection()?.getRangeAt(0);

	if (!range) return;
	range.deleteContents();

	if (!parentNode) return;
	const isEditor = isParentTheEditor(parentNode);
	if (isEditor) {
		insertOnNewLine(formatted[0], false);
	} else {
		const textNode = document.createTextNode(formatted[0]);
		range.insertNode(textNode);
		range.selectNodeContents(textNode);
		range.collapse(false);
	}

	for (let i = 1; i < formatted.length; i++) {
		insertOnNewLine(formatted[i], false);
	}

	console.log(selection);
	if (selection) {
		selection.removeAllRanges();
		selection.addRange(range);
	}
};
