import { enterSpecialRules, tabSpecialRules } from '$lib/parser/rules';

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
	if (isParentTheEditor(parent)) return false;
	const ele = document.getElementById('editor');
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

	const beforeCursor = range.startContainer.textContent?.slice(0, range.startOffset);
	const afterCursor = range.startContainer.textContent?.slice(range.startOffset);

	parentNode.textContent = beforeCursor + str + afterCursor;

	for (let i = 0; i < (beforeCursor ? beforeCursor.length : 0) + str.length; i++) {
		console.log('move');
		sel.modify('move', 'forward', 'character');
	}

	// const tabNode = document.createTextNode(str);
	// range.insertNode(tabNode);
	// range.setStartAfter(tabNode);
	// range.setEndAfter(tabNode);
};

export const insertOnNewLine = (contentToAdd: string, collapseStart: boolean) => {
	const parentNode = getParentNodeOfLine() as HTMLDivElement;
	if (checkIfEditable(parentNode)) return;

	const sel = window.getSelection();

	if (!sel) return;

	const div = document.createElement('div');

	const inner = document.createTextNode(contentToAdd);

	div.appendChild(inner);

	const isEditor = isParentTheEditor(parentNode);

	if (isEditor) {
		// parentNode.append(div);
		// console.log(parentNode.firstChild);

		inner.textContent = '';
		const lastChild = parentNode.lastChild;
		lastChild?.after(div);
	} else {
		parentNode.after(div);
	}

	sel.removeAllRanges();
	sel.collapse(div.firstChild, collapseStart ? 0 : contentToAdd.length);
};

export const gotoEndOfNode = (sel: Selection, targetNode: Node | ChildNode) => {
	const range = document.createRange();
	range.setStart(targetNode, targetNode.childNodes.length);

	range.collapse(true);

	sel.removeAllRanges();
	sel.addRange(range);
};

export const enterPressed = () => {
	const parentNode = getParentNodeOfLine();
	if (checkIfEditable(parentNode)) return;

	const indentLevel = getIndentLevel();

	const sel = window.getSelection();
	if (!sel) return;
	const lineText = parentNode?.textContent;

	const range = sel.getRangeAt(0);

	if (range.startOffset !== range.endOffset) {
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
		insertOnNewLine(textAfterCursor, false);
	} else {
		insertOnNewLine('', true);
	}
};

export const tabPressed = () => {
	const parentNode = getParentNodeOfLine();
	if (checkIfEditable(parentNode)) return;

	// const currentLine = getCurrentLine();

	const sel = window.getSelection();
	if (!sel) return;
	const lineText = sel.focusNode?.textContent;

	if (lineText) {
		for (const block of tabSpecialRules) {
			if (lineText.match(block[0])) {
				if (parentNode) {
					parentNode.textContent = '\t' + parentNode.textContent;
					gotoEndOfNode(sel, parentNode);
				}

				// if (parentNode) {
				// 	parentNode?.insertBefore(document.createTextNode('\t'), parentNode.firstChild);
				// 	// gotoEndOfNode(sel, parentNode);
				// }
				return;
			}
		}
	}

	insertString('\t');
};

const checkLineForSpecialChars = (lineText: string, textToAdd: string, indentLevel: number) => {
	let text = textToAdd;
	for (const block of enterSpecialRules) {
		if (lineText.match(block[0])) {
			switch (block[1]) {
				case 'BLOCKQUOTE': {
					const number = (lineText.match(/>/g) || []).length;
					const arrows = '>'.repeat(number);
					text = arrows + ' ' + textToAdd;
					break;
				}
				case 'UNORDERED_LIST': {
					const token = lineText.trimStart()[0];
					const padding = '\t'.repeat(indentLevel);
					text = padding + token + ' ' + textToAdd;
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
			break;
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

	if (selection) {
		selection.removeAllRanges();
		selection.addRange(range);
	}
};
