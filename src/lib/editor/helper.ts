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

export const checkIfEditable = (parent: Node | null | undefined) => {
  if (!parent) return false;
  let ele = document.getElementById("editor");
  console.log(!ele?.contains(parent));
  return !ele?.contains(parent)
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

export const isParentTheEditor = (parent: HTMLElement | ParentNode | Node) => {
  const _parent = parent as HTMLElement;
  return _parent.getAttribute("data-iseditor");
}

export const insertString = (str: string) => {
  const parentNode = getParentNodeOfLine() as HTMLDivElement;
  if (checkIfEditable(parentNode)) return;

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

export const insertOnNewLine = (contentToAdd: string) => {
  const parentNode = getParentNodeOfLine() as HTMLDivElement;
  if (checkIfEditable(parentNode)) return;

  console.log('new func')
  const sel = window.getSelection();

  let div = document.createElement('div');

  // let inner: HTMLBRElement | Text = document.createElement('br');
  // if (contentToAdd) {
  //   inner = document.createTextNode(contentToAdd!);
  // }

  let inner = document.createTextNode(contentToAdd);
  // let br = document.createElement("br");

  div.appendChild(inner)
  // div.appendChild(br);

  const isEditor = isParentTheEditor(parentNode);
  console.log(parentNode)
  console.log(isEditor)

  if (isEditor) {
    parentNode.prepend(div);
  } else {
    parentNode.after(div);
  }
  sel?.removeAllRanges();
  sel?.collapse(div.firstChild);
}

export const clearLineBeforeCursor = () => {
  let parentNode = getParentNodeOfLine();
  if (checkIfEditable(parentNode)) return;

  console.log("clearing line")
  let sel = window.getSelection();
  if (!sel) return;
  let currentRange = sel.getRangeAt(0);
  if (!parentNode) return;
  console.log(parentNode)
  currentRange.setStartAfter(parentNode.firstChild!);
  console.log("deleting: ", currentRange.toString());
  currentRange.deleteContents()
}


export const enterPressed = (inputTextArea: HTMLDivElement) => {
  let parentNode = getParentNodeOfLine();
  if (checkIfEditable(parentNode)) return;

  const indentLevel = getIndentLevel();
  const currentLine = getCurrentLine();

  if (currentLine?.match(/^[\s]+$/gm)) {
    clearLineBeforeCursor();
  } else {
    let sel = window.getSelection();
    if (!parentNode) return;

    let range = sel?.getRangeAt(0);
    if (!range) return;

    let newRange = range.cloneRange();

    newRange.setEndBefore(parentNode?.lastChild!);
    let existingContent = newRange.toString();

    newRange.deleteContents();

    // let div = document.createElement('div');
    // let br = document.createElement('br');
    // let inner = document.createTextNode(existingContent ?? '\n');
    // console.log('has existingContent: ', existingContent);
    //
    // div.appendChild(inner);
    //
    // div.appendChild(br);
    //
    // if (parentEle === inputTextArea) {
    //   inputTextArea.prepend(div);
    // } else {
    //   parentEle.after(div);
    // }
    //
    // sel?.removeAllRanges();
    // sel?.collapse(div.firstChild);

    insertOnNewLine(existingContent);

    if (indentLevel) {
      for (let i = 0; i < indentLevel; i++) insertString('\t');
    }
  }
}

export const pasteText = (text: string, inputTextArea: HTMLDivElement) => {
  let parentNode = getParentNodeOfLine();
  if (checkIfEditable(parentNode)) return;

  const formatted = text?.split('\n') || [];
  // console.log(formatted);
  if (!text) return;

  const selection = window.getSelection();
  const range = document.getSelection()?.getRangeAt(0);


  if (!range) return;
  range.deleteContents();

  if (!parentNode) return;
  let isEditor = isParentTheEditor(parentNode)
  if (isEditor) {
    insertOnNewLine(formatted[0]);
  } else {
    let textNode = document.createTextNode(formatted[0]);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);
  }

  for (let i = 1; i < formatted.length; i++) {
    insertOnNewLine(formatted[i])
  }

  // insertOnNewLine(formatted[0]);
  //
  // if (!focusedNode) return;
  //
  // for (let i = formatted.length - 1; i > 0; i--) {
  //   let divEle = document.createElement('div');
  //   // let frag = document.createDocumentFragment();
  //   const textNode = document.createTextNode(formatted[i]);
  //   const br = document.createElement("br");
  //
  //   divEle.appendChild(textNode);
  //   divEle.appendChild(br);
  //
  //   if (focusedNode.nextSibling) {
  //     inputTextArea.insertBefore(divEle, focusedNode.nextSibling);
  //   } else {
  //     console.log('no next sibling');
  //     inputTextArea.appendChild(divEle);
  //   }
  // }

  console.log(selection);
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

}
