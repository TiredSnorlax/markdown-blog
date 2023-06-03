
export const replaceSelectedText = (token: string) => {
  let range: Range;
  if (window.getSelection) {
    let sel = window.getSelection();
    let selectedValue = sel?.toString();
    if (sel && sel.rangeCount) {
      range = sel.getRangeAt(0);
      // No highlighted
      if (range.endOffset === range.startOffset) {
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

export const getParentElementOfLine = () => {
  let sel = window.getSelection();
  if (!sel) return;
  let range = sel.getRangeAt(0);
  let divContainer: Node | ParentNode | null = range.startContainer;
  while (divContainer !== null && divContainer.nodeName !== "DIV") {
    divContainer = divContainer.parentNode;
  }
  return divContainer;

}

export const getCurrentLine = () => {
  let sel = window.getSelection();
  if (!sel) return;
  let range = sel.getRangeAt(0);
  let divContainer: Node | ParentNode | null = range.startContainer;
  return divContainer?.textContent;
}

export const getIndentLevel = () => {
  let currentLine = getCurrentLine();

  const tabArray = currentLine?.match(/^[\t]+/);
  if (!tabArray) return 0;
  let indentLevel = tabArray[0].length;
  return indentLevel;
}

export const insertString = (str: string) => {
  let sel = window.getSelection();
  if (!sel) return;
  let range = sel.getRangeAt(0);

  // var tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0');
  const tabNode = document.createTextNode(str);
  range.insertNode(tabNode);

  range.setStartAfter(tabNode);
  range.setEndAfter(tabNode);
  sel.removeAllRanges();
  sel.addRange(range);
}

export const clearLineBeforeCursor = () => {
  let sel = window.getSelection();
  if (!sel) return;
  let currentRange = sel.getRangeAt(0);

  let newRange = document.createRange();

  newRange.setStart(currentRange.startContainer, 0)
  newRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  console.log(newRange);

  sel.addRange(newRange);
  newRange.deleteContents()
  sel.collapseToStart()
}

