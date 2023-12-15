import { insertOnNewLine, insertString, getParentNodeOfLine, checkIfEditable } from '../helper';

export const surroundSelectedText = (token: string) => {
	const parentNode = getParentNodeOfLine() as HTMLDivElement;
	if (checkIfEditable(parentNode)) return;

	let range: Range;
	if (window.getSelection) {
		const sel = window.getSelection();
		const selectedValue = sel?.toString();
		if (sel && sel.rangeCount) {
			range = sel.getRangeAt(0);
			const rangeOffset = range.startOffset;
			// No highlighted
			if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
				insertString(token);
				insertString(token);

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

				range.deleteContents();

				// I have no idea why the following code works
				insertString(token);
				insertString(inside);
				insertString(token);

				const newRange = document.createRange();

				if (!sel.anchorNode) return;
				newRange.setStart(sel.anchorNode, 0);
				newRange.setEnd(sel.anchorNode, 0);

				sel.removeAllRanges();

				sel.addRange(newRange);

				for (let i = 0; i < rangeOffset + token.length + inside.length; i++) {
					sel.modify('move', 'right', 'character');
				}
				// range.insertNode(document.createTextNode(token));
				// range.insertNode(nodeToSurround);
				// range.insertNode(document.createTextNode(token));
				// sel.setPosition(range.startContainer, range.startOffset);
				//
				// sel.removeAllRanges();
				//
				//
				// const newRange = document.createRange();
				// newRange.setStart(nodeToSurround, 0);
				// newRange.setEnd(nodeToSurround, selectedValue ? selectedValue.length : 0);
				//
				// sel.addRange(newRange);
			}
		}
	} else {
		console.log('This action is not supported by your browser. Please use Chrome or Firefox.');
	}
};

export const toNewLine = (str: string) => {
	const parentNode = getParentNodeOfLine() as HTMLDivElement;
	if (checkIfEditable(parentNode)) return;

	const sel = window.getSelection();
	if (!sel?.rangeCount) return;
	const range = sel?.getRangeAt(0);
	if (!range || !sel) return;

	if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
		console.log('Nothing selected');
		insertString(str + ' ');
	} else {
		console.log('Selected: ', range.toString());
		const existingContent = range.toString();
		range.deleteContents();
		insertOnNewLine(str + ' ' + existingContent, false);
	}
};
