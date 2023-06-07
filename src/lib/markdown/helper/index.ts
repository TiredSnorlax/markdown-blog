
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

export const getParentNodeOfLine = () => {
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
  let parent = getParentNodeOfLine();
  console.log("currentLine", parent?.textContent)
  return parent?.textContent || null;
}

export const getIndentLevel = () => {
  let currentLine = getCurrentLine();
  console.log('current line in indent level', currentLine)
  if (!currentLine) return 0;

  const tabArray = currentLine?.match(/^[\t]+/);
  if (!tabArray) return 0;
  let indentLevel = tabArray[0].length;
  return indentLevel;
}

export const insertString = (str: string) => {
  let sel = window.getSelection();
  console.log(sel);
  if (!sel) return;
  let range = sel.getRangeAt(0);
  range.deleteContents();

  // var tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0');
  const tabNode = document.createTextNode(str);
  console.log(tabNode)
  range.insertNode(tabNode);
  range.setStartAfter(tabNode);
  range.setEndAfter(tabNode);
}

export const clearLineBeforeCursor = () => {
  console.log("clearing line")
  let sel = window.getSelection();
  if (!sel) return;
  let currentRange = sel.getRangeAt(0);
  let parentNode = getParentNodeOfLine();
  if (!parentNode) return;
  console.log(parentNode)
  currentRange.setStartAfter(parentNode.firstChild!);
  console.log("deleting: ", currentRange.toString());
  currentRange.deleteContents()
}

