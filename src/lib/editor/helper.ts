import {
  getIndentLevel,
  insertString,
  clearLineBeforeCursor,
  getParentNodeOfLine,
  getCurrentLine
} from '$lib/markdown/helper';

export const enterPressed = (inputTextArea: HTMLDivElement) => {
  const indentLevel = getIndentLevel();
  const currentLine = getCurrentLine();

  if (currentLine?.match(/^[\s]+$/gm)) {
    clearLineBeforeCursor();
  } else {
    let sel = window.getSelection();
    let parentEle = getParentNodeOfLine() as HTMLDivElement;
    if (!parentEle) return;

    let range = sel?.getRangeAt(0);
    if (!range) return;

    let newRange = range.cloneRange();

    newRange.setEndAfter(parentEle?.lastChild!);
    let existingContent = newRange.toString();

    newRange.deleteContents();

    let div = document.createElement('div');
    let br = document.createElement('br');
    let inner = document.createTextNode(existingContent ?? '\n');
    console.log('has existingContent: ', existingContent);

    div.appendChild(inner);

    div.appendChild(br);

    if (parentEle === inputTextArea) {
      inputTextArea.appendChild(div);
    } else {
      parentEle.after(div);
    }

    sel?.removeAllRanges();
    sel?.collapse(div.firstChild);

    if (indentLevel) {
      for (let i = 0; i < indentLevel; i++) insertString('\t');
    }
  }
}

export const pasteText = (text: string, inputTextArea: HTMLDivElement) => {
  const formatted = text?.split('\n') || [];
  // console.log(formatted);
  if (!text) return;

  const selection = window.getSelection();
  const range = document.getSelection()?.getRangeAt(0);


  if (!range) return;
  range.deleteContents();

  let focusedNode = getParentNodeOfLine();
  if (inputTextArea === focusedNode) {
    let div = document.createElement('div');
    let br = document.createElement('br');
    let inner = document.createTextNode(formatted[0]);
    div.appendChild(inner)
    div.appendChild(br);
    inputTextArea.prepend(div);
    focusedNode = div;
  } else {
    let textNode = document.createTextNode(formatted[0]);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);
  }

  // if (selection) {
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  // }


  console.log(formatted);

  // var focusedNode = selection?.focusNode;
  //
  // while (focusedNode?.parentNode !== inputTextArea || focusedNode === null) {
  //   focusedNode = focusedNode?.parentNode;
  // }

  console.log(focusedNode)
  if (!focusedNode) return;

  // let focusedNode = selection?.focusNode;
  for (let i = formatted.length - 1; i > 0; i--) {
    let divEle = document.createElement('div');
    // let frag = document.createDocumentFragment();
    const textNode = document.createTextNode(formatted[i]);
    const br = document.createElement("br");

    divEle.appendChild(textNode);
    divEle.appendChild(br);

    if (focusedNode.nextSibling) {
      inputTextArea.insertBefore(divEle, focusedNode.nextSibling);
    } else {
      console.log('no next sibling');
      inputTextArea.appendChild(divEle);
    }
  }

  console.log(selection);
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

}
