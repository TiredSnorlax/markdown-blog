import { enterSpecialRules, tabSpecialRules } from '$lib/parser/rules';

export const isNodeAfter = (firstNode: Node, secondNode: Node) => {
	return firstNode.compareDocumentPosition(secondNode) === 2;
};

export const getParentNodeOfLine = () => {
	const sel = window.getSelection();
	if (!sel) return;
	const range = sel.getRangeAt(0);
	console.log(sel);
	console.log(range);
	if (!sel.focusNode?.parentNode || !sel.anchorNode?.parentNode) return;
	if (sel.focusNode.parentNode === sel.anchorNode.parentNode) return sel.anchorNode.parentNode;
	let firstNode = sel.focusNode.parentNode;
	if (isNodeAfter(sel.anchorNode.parentNode, sel.focusNode.parentNode)) {
		firstNode = sel.anchorNode.parentNode;
	}
	console.log(firstNode);

	return firstNode;
};

export const checkIfEditable = (parent: Node | null | undefined) => {
	if (!parent) return false;
	console.log('editable', parent);
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
	console.log(parent);
	const _parent = parent as HTMLElement;
	return _parent.getAttribute('data-iseditor');
};

export const insertString = (str: string) => {
	// const parentNode = getParentNodeOfLine() as HTMLDivElement;
	// if (checkIfEditable(parentNode)) return;

	const sel = window.getSelection();
	if (!sel) return;

	const range = sel.getRangeAt(0);

	const parentNode = sel.anchorNode?.parentNode;
	if (!parentNode) return;

	const beforeCursor = range.startContainer.textContent?.slice(0, range.startOffset);
	const afterCursor = range.startContainer.textContent?.slice(range.startOffset);

	parentNode.textContent = beforeCursor + str + afterCursor;

	sel.setPosition(
		parentNode.firstChild,
		beforeCursor?.length ? beforeCursor.length + str.length : str.length
	);

	// for (let i = 0; i < (beforeCursor ? beforeCursor.length : 0) + str.length; i++) {
	// 	console.log('move');
	// 	sel.modify('move', 'forward', 'character');
	// }

	// const tabNode = document.createTextNode(str);
	// range.insertNode(tabNode);
	// range.setStartAfter(tabNode);
	// range.setEndAfter(tabNode);
};

export const surroundStringMultiLine = (
	str: string,
	anchorNode: Node | null | undefined,
	focusNode: Node | null | undefined,
	sel: Selection
) => {
	if (checkIfEditable(anchorNode?.parentNode) || checkIfEditable(focusNode?.parentNode)) return;
	if (!anchorNode?.parentNode || !focusNode?.parentNode) return;
	let startNode = anchorNode.parentNode;
	let endNode = focusNode.parentNode;
	console.log(startNode);
	if (isNodeAfter(anchorNode, focusNode)) {
		startNode = focusNode.parentNode;
		endNode = anchorNode.parentNode;
	}

	const range = sel.getRangeAt(0);
	// const lines = selectedText.split('\n');
	const startBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset);
	const startAfterCursor = range.startContainer.textContent?.slice(range.startOffset);

	const endBeforeCursor = range.endContainer.textContent?.slice(0, range.endOffset);
	const endAfterCursor = range.endContainer.textContent?.slice(range.endOffset);

	startNode.textContent = startBeforeCursor + str + startAfterCursor;
	endNode.textContent = endBeforeCursor + str + endAfterCursor;

	gotoEndOfNode(sel, endNode);
};

export const insertOnNewLine = (contentToAdd: string, collapseStart: boolean) => {
	const parentNode = getParentNodeOfLine() as HTMLPreElement;
	if (checkIfEditable(parentNode)) return;

	const sel = window.getSelection();

	if (!sel) return;

	const isEditor = isParentTheEditor(parentNode);
	console.log(isEditor);

	const pre = document.createElement('pre');
	const inner = document.createTextNode(contentToAdd);
	pre.appendChild(inner);
	if (isEditor) {
		// parentNode.append(pre);
		// console.log(parentNode.firstChild);

		// inner.textContent = '';
		const lastChild = parentNode.lastChild;
		lastChild?.after(pre);
	} else {
		parentNode.after(pre);
	}

	sel.removeAllRanges();
	sel.collapse(pre.firstChild, collapseStart ? 0 : contentToAdd.length);
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
		const _tempTextAfterCursor = textAfterCursor.slice(0);
		if (sel.anchorNode) sel.anchorNode.nodeValue = textBeforeCursor;
		textAfterCursor = checkLineForSpecialChars(lineText, textAfterCursor, indentLevel);
		if (_tempTextAfterCursor !== textAfterCursor) {
			insertOnNewLine(textAfterCursor, false);
		} else {
			insertOnNewLine(textAfterCursor, true);
		}
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
	if (!selection) return;
	const range = selection.getRangeAt(0);

	if (!range) return;
	range.deleteContents();

	if (!parentNode) return;
	const isEditor = isParentTheEditor(parentNode);
	if (isEditor) {
		insertOnNewLine(formatted[0], false);
	} else {
		insertString(formatted[0]);
	}

	for (let i = 1; i < formatted.length; i++) {
		insertOnNewLine(formatted[i], false);
	}
};
