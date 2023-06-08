import { insertOnNewLine, insertString, getParentNodeOfLine, checkIfEditable } from "../helper";

export const surroundSelectedText = (token: string) => {
  const parentNode = getParentNodeOfLine() as HTMLDivElement;
  if (checkIfEditable(parentNode)) return;

  let range: Range;
  if (window.getSelection) {
    let sel = window.getSelection();
    let selectedValue = sel?.toString();
    if (sel && sel.rangeCount) {
      range = sel.getRangeAt(0);
      // No highlighted
      if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
        console.log(range.startOffset);

        range.insertNode(document.createTextNode(token));
        range.insertNode(document.createTextNode(token));

        sel.setPosition(range.startContainer, range.startOffset);

        for (let i = 0; i < token.length; i++) {
          sel.modify('move', 'right', 'character');
        }
      } else {
        const nodeToSurround = document.createTextNode(selectedValue || '');

        range.deleteContents();
        range.insertNode(document.createTextNode(token));
        range.insertNode(nodeToSurround);
        range.insertNode(document.createTextNode(token));
        sel.setPosition(range.startContainer, range.startOffset);

        sel.removeAllRanges();

        for (let i = 0; i < token.length; i++) {
          sel.modify('move', 'right', 'character');
        }

        let newRange = document.createRange();
        newRange.setStart(nodeToSurround, 0);
        newRange.setEnd(nodeToSurround, selectedValue ? selectedValue.length : 0);

        sel.addRange(newRange);
      }
    }
  } else {
    console.log('This action is not supported by your browser. Please use Chrome or Firefox.');
  }
};

export const toNewLine = (str: string) => {
  const parentNode = getParentNodeOfLine() as HTMLDivElement;
  if (checkIfEditable(parentNode)) return;

  let sel = window.getSelection();
  if (!sel?.rangeCount) return;
  let range = sel?.getRangeAt(0);
  if (!range || !sel) return;

  if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
    console.log("Nothing selected");
    insertString(str + " ");
  } else {
    console.log("Selected: ", range.toString())
    const existingContent = range.toString();
    range.deleteContents();
    insertOnNewLine(str + " " + existingContent)
  }
}
