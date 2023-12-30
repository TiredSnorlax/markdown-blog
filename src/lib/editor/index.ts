import { enterSpecialRules, tabSpecialRules } from '$lib/parser/rules';

export default class Editor {
	content: string;
	selection: Selection;

	constructor(content: string, selection: Selection) {
		this.content = content;
		this.selection = selection;
	}

	isNodeAfter = (firstNode: Node, secondNode: Node) => {
		return firstNode.compareDocumentPosition(secondNode) === 2;
	};

	getParentNodeOfLine = () => {
		let anchorNode = this.selection.anchorNode;
		let focusNode = this.selection.focusNode;
		// empty lines will return the pre element as anchorNode/focusNode
		// this will cause the parentNode taken to be the editor itself
		// this will account for it and fix it
		if (!focusNode || !anchorNode) return;
		// nodeType 3 is text node
		if (anchorNode.nodeType === 3) {
			anchorNode = anchorNode.parentNode;
			focusNode = focusNode.parentNode;
		}
		if (!focusNode || !anchorNode) return;
		if (focusNode === anchorNode) return anchorNode;
		let firstNode = focusNode;
		if (this.isNodeAfter(anchorNode, focusNode)) {
			firstNode = anchorNode;
		}
		return firstNode;
	};

	getCurrentLine = () => {
		const parent = this.getParentNodeOfLine();
		return parent?.textContent || null;
	};

	getIndentLevel = () => {
		const currentLine = this.getCurrentLine();
		if (!currentLine) return 0;

		const tabArray = currentLine?.match(/^[\t]+/);
		if (!tabArray) return 0;
		const indentLevel = tabArray[0].length;
		return indentLevel;
	};

	isParentTheEditor = (parent: HTMLElement | ParentNode | Node) => {
		const _parent = parent as HTMLElement;
		return _parent.getAttribute('data-iseditor');
	};

	checkIfEditable = (parent: Node | null | undefined) => {
		if (!parent) return false;
		if (this.isParentTheEditor(parent)) return false;
		const ele = document.getElementById('editor');
		return ele?.contains(parent);
	};

	checkIfCurrentLineEditable = () => {
		const parentNode = this.getParentNodeOfLine();
		return this.checkIfEditable(parentNode);
	};

	insertString = (str: string) => {
		const range = this.selection.getRangeAt(0);

		const parentNode = this.getParentNodeOfLine();
		if (!parentNode) return;

		const beforeCursor = range.startContainer.textContent?.slice(0, range.startOffset);
		const afterCursor = range.startContainer.textContent?.slice(range.startOffset);

		parentNode.textContent = beforeCursor + str + afterCursor;

		this.selection.setPosition(
			parentNode.firstChild,
			beforeCursor?.length ? beforeCursor.length + str.length : str.length
		);
	};

	insertOnNewLine = (contentToAdd: string, collapseStart: boolean) => {
		if (!this.checkIfCurrentLineEditable()) return;
		const parentNode = this.getParentNodeOfLine() as HTMLPreElement;

		if (!this.selection) return;

		const pre = document.createElement('pre');
		const inner = document.createTextNode(contentToAdd);
		pre.appendChild(inner);

		if (parentNode) parentNode.after(pre);

		this.selection.removeAllRanges();
		this.selection.collapse(pre.firstChild, collapseStart ? 0 : contentToAdd.length);
	};

	gotoEndOfParentNode = (targetNode: Node | ChildNode) => {
		const range = document.createRange();
		range.setStart(targetNode, targetNode.childNodes.length);

		range.collapse(true);

		this.selection.removeAllRanges();
		this.selection.addRange(range);
	};

	enterPressed = () => {
		if (!this.checkIfCurrentLineEditable()) return;
		const parentNode = this.getParentNodeOfLine();

		const indentLevel = this.getIndentLevel();

		const sel = window.getSelection();
		if (!sel) return;
		const lineText = parentNode?.textContent;

		const range = sel.getRangeAt(0);

		if (range.startOffset !== range.endOffset) {
			const existingText = range.toString();
			range.deleteContents();
			this.insertOnNewLine(existingText, true);
			return;
		}

		let textBeforeCursor = '';
		let textAfterCursor = '';
		if (lineText) {
			textBeforeCursor = lineText.slice(0, sel.focusOffset);
			textAfterCursor = lineText.slice(sel.focusOffset);
			const _tempTextAfterCursor = textAfterCursor.slice(0);
			if (sel.anchorNode) sel.anchorNode.nodeValue = textBeforeCursor;
			textAfterCursor = this.checkLineForSpecialChars(lineText, textAfterCursor, indentLevel);
			if (_tempTextAfterCursor !== textAfterCursor) {
				this.insertOnNewLine(textAfterCursor, false);
			} else {
				this.insertOnNewLine(textAfterCursor, true);
			}
		} else {
			this.insertOnNewLine('', true);
		}
	};

	tabPressed = () => {
		if (!this.checkIfCurrentLineEditable()) return;
		const parentNode = this.getParentNodeOfLine();

		// const currentLine = getCurrentLine();

		const sel = window.getSelection();
		if (!sel) return;
		const lineText = sel.focusNode?.textContent;

		if (lineText) {
			for (const block of tabSpecialRules) {
				if (lineText.match(block[0])) {
					if (parentNode) {
						parentNode.textContent = '\t' + parentNode.textContent;
						this.gotoEndOfParentNode(parentNode);
					}
					return;
				}
			}
		}

		this.insertString('\t');
	};

	checkLineForSpecialChars = (lineText: string, textToAdd: string, indentLevel: number) => {
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

	pasteText = (text: string) => {
		if (!this.checkIfCurrentLineEditable()) return;
		const parentNode = this.getParentNodeOfLine();

		const formatted = text?.split('\n') || [];
		// console.log(formatted);
		if (!text) return;

		if (!this.selection) return;
		const range = this.selection.getRangeAt(0);

		if (!range) return;
		range.deleteContents();

		if (!parentNode) return;
		const isEditor = this.isParentTheEditor(parentNode);
		if (isEditor) {
			this.insertOnNewLine(formatted[0], false);
		} else {
			this.insertString(formatted[0]);
		}

		for (let i = 1; i < formatted.length; i++) {
			this.insertOnNewLine(formatted[i], false);
		}
	};

	surroundStringMultiLine = (str: string) => {
		const anchorNode = this.selection.anchorNode;
		const focusNode = this.selection.focusNode;
		if (this.checkIfEditable(anchorNode?.parentNode) || this.checkIfEditable(focusNode?.parentNode))
			return;
		if (!anchorNode?.parentNode || !focusNode?.parentNode) return;
		let startNode = anchorNode.parentNode;
		let endNode = focusNode.parentNode;
		if (this.isNodeAfter(anchorNode, focusNode)) {
			startNode = focusNode.parentNode;
			endNode = anchorNode.parentNode;
		}

		const range = this.selection.getRangeAt(0);
		// const lines = selectedText.split('\n');
		const startBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset);
		const startAfterCursor = range.startContainer.textContent?.slice(range.startOffset);

		const endBeforeCursor = range.endContainer.textContent?.slice(0, range.endOffset);
		const endAfterCursor = range.endContainer.textContent?.slice(range.endOffset);

		startNode.textContent = startBeforeCursor + str + startAfterCursor;
		endNode.textContent = endBeforeCursor + str + endAfterCursor;

		this.gotoEndOfParentNode(endNode);
	};

	surroundSelectedText = (token: string) => {
		if (!this.checkIfCurrentLineEditable()) return;

		let range: Range;
		const sel = this.selection;
		const selectedValue = sel?.toString();
		if (sel && sel.rangeCount) {
			range = sel.getRangeAt(0);
			const rangeOffset = range.startOffset;
			console.log(range);
			console.log(sel);
			// No highlighted
			if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
				this.insertString(token + token);

				const newRange = document.createRange();

				if (!sel.anchorNode) return;
				newRange.setStart(sel.anchorNode, 0);
				newRange.setEnd(sel.anchorNode, 0);

				sel.removeAllRanges();

				sel.addRange(newRange);

				for (let i = 0; i < rangeOffset + token.length; i++) {
					sel.modify('move', 'right', 'character');
				}
			} else {
				const inside = selectedValue || '';

				// TODO: check if its already surrounded by token

				// const newSelectedValue = sel.toString();
				// console.log(newSelectedValue);
				// if (newSelectedValue.split(inside).join('') === token + token) {
				// 	range.deleteContents();
				//
				// 	insertString(inside);
				//
				// 	for (let i = 0; i < inside.length; i++) {
				// 		sel.modify('extend', 'left', 'character');
				// 	}
				//
				// 	return;
				// }

				// range.collapse(true);

				if (sel.anchorNode !== sel.focusNode) {
					this.surroundStringMultiLine(token);
				} else {
					range.deleteContents();

					this.insertString(token + inside + token);

					for (let i = 0; i < token.length; i++) {
						sel.modify('move', 'left', 'character');
					}

					for (let i = 0; i < inside.length; i++) {
						sel.modify('extend', 'left', 'character');
					}
				}

				return;
			}
		}
	};

	toNewLine = (str: string) => {
		if (!this.selection?.rangeCount) return;
		const range = this.selection?.getRangeAt(0);
		if (!range || !this.selection) return;

		if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
			console.log('Nothing selected');
			this.insertString(str + ' ');
		} else {
			console.log('Selected: ', range.toString());
			const existingContent = range.toString();
			this.insertOnNewLine(str + ' ' + existingContent, false);
			range.deleteContents();
		}
	};
}
