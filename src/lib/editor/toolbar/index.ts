import {
	insertOnNewLine,
	insertString,
	getParentNodeOfLine,
	checkIfEditable,
	surroundStringMultiLine
} from '../helper';

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
			console.log(range);
			console.log(sel);
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
					surroundStringMultiLine(token, sel.anchorNode, sel.focusNode, sel);
				} else {
					range.deleteContents();

					insertString(token + inside + token);

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
	} else {
		console.log('This action is not supported by your browser. Please use Chrome or Firefox.');
	}
};

export const toNewLine = (str: string) => {
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
		insertOnNewLine(str + ' ' + existingContent, false);
		range.deleteContents();
	}
};
