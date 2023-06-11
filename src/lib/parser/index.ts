import { rules } from '$lib/markdown/rules';

interface Token {
  type: string;
  content: string;
}

interface Block {
  type: string;
  children: string[];
}

// TODO: convert to array to loop through
const unorderedListRules = [/^(\t*\*[^\S\t\n\r].+)/gm, '$1', 'LIST'];
const orderedListRules = [/^(\t*(?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9])\.[^\S\t\n\r].*)/gm, '$1', 'LIST'];
const preOpeningRules = [/^\`{3}(.+)?/gm, "$1", "PRE"];

export const tokenise = (doc: string) => {
  const tokens: Token[] = [];
  const splitByLine = doc.split('\n');

  for (let i = 0; i < splitByLine.length; i++) {
    const line = splitByLine[i];
    if (line.length === 0) continue;
    let token: Token;

    if (line.match(unorderedListRules[0])) {
      // const match = line.replace(unorderedListRules[0], unorderedListRules[1] as string);
      token = { type: unorderedListRules[2] as string, content: line };
    } else if (line.match(orderedListRules[0])) {
      // const match = line.replace(orderedListRules[0], orderedListRules[1] as string);
      token = { type: unorderedListRules[2] as string, content: line };
    } else if (line.match(preOpeningRules[0])) {
      console.log("pre detected")
      token = { type: preOpeningRules[2] as string, content: line };
    } else {
      token = { type: 'INLINE', content: line };
    }
    tokens.push(token);
  }
  console.log(tokens);
  return tokens;
};

export const groupTokens = (tokens: Token[]) => {
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'INLINE') {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = null;
      blocks.push({ type: token.type, children: [token.content] });
    } else if (!currentBlock) {
      currentBlock = { type: token.type, children: [token.content] };
      // Check for ending pre tag

      console.log(token.type, i)
      if (token.type === "PRE") {
        console.log(token, i);
        console.log(tokens.slice(i + 1));
        let relativeClosingIndex = tokens.slice(i + 1).findIndex((token) => token.type === "PRE");
        if (relativeClosingIndex) {
          console.log("has pre block")
          currentBlock.children = tokens.slice(i, i + relativeClosingIndex + 2).map((item) => item.content);
          currentBlock.type = "PRE";
          console.log(currentBlock)
          i += relativeClosingIndex + 1;
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
    } else if (currentBlock && currentBlock.type === token.type) {
      currentBlock.children.push(token.content);
    } else if (currentBlock.type !== token.type) {
      console.log('change in current block', currentBlock, token)
      blocks.push(currentBlock);
      currentBlock = null;
      i--;
      // currentBlock = { type: token.type, children: [token.content] };
    }
  }
  if (currentBlock) blocks.push(currentBlock);
  console.log(blocks);
  return blocks;
};

const convertInlineToHtml = (html: string) => {
  rules.forEach(([rule, template]) => {
    html = html.replace(rule, template as string);
  });
  return html;
}

export const convertToHtml = (blocks: Block[]) => {
  const htmlList: string[] = [];
  for (const block of blocks) {
    let html = '';
    if (block.type === 'INLINE') {
      html = block.children[0];
      html = convertInlineToHtml(html);
      html = html.replace(/^\s*(\n)?(.+)/gm, function(m) {
        return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
      });
    } else if (block.type === "LIST") {
      html = handleLists(block);
    } else if (block.type === "PRE") {
      html = handlePreBlocks(block);
    }
    htmlList.push(html);
  }

  let output = htmlList.join("");
  return output;
};

export const handleLists = (listBlock: Block) => {
  let prevIndent = 0;
  let html = "";

  let endTagStack = [];

  let currentListType: string | null = null;
  let prevListType: string | null = null;

  for (let i = 0; i < listBlock.children.length; i++) {
    let child = listBlock.children[i];
    const nextChild = i + 1 < listBlock.children.length ? listBlock.children[i + 1] : null;

    const currentMatch = child.match(/^(\t*)/gm) as string[] || [""];
    const currentIndent = currentMatch[0].length;


    // const nextMatch = nextChild?.match(/^([^\S\t\n\r]*)\*/g) as string[] || [""];
    const nextMatch = nextChild?.match(/^(\t*)[^\t|\n]+/gm) as string[] || null;
    const nextIndent = nextMatch ? nextMatch[0].length : -1;


    if (child.match(unorderedListRules[0])) {
      child = child.replace(/^\t*\*(.+)/gm, "$1");
      currentListType = "UNORDERED_LIST";
    } else if (child.match(orderedListRules[0])) {
      child = child.replace(/^\t*(?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9])\.(.+)/gm, "$1")
      currentListType = "ORDERED_LIST";
    }


    child = convertInlineToHtml(child);

    const currentTag = currentListType === "UNORDERED_LIST" ? ["<ul>", "</ul>"] : ["<ol>", "</ol>"];
    // const prevTag = prevListType === "UNORDERED_LIST" ? ["<ul>", "</ul>"] : ["<ol>", "</ol>"];

    if (currentIndent > prevIndent || html.length === 0) {
      html += currentTag[0];
      endTagStack.push(currentTag[1]);
    } else if (currentIndent < prevIndent) {
      for (let i = 0; i < prevIndent - currentIndent; i++) {
        html += "</li>" + endTagStack.pop()
      }
    }

    // if children are on the same indent level but have different list types
    if (prevListType && currentListType !== prevListType && currentIndent === prevIndent) {
      html += endTagStack.pop();

      html += currentTag[0]
      endTagStack.push(currentTag[1]);
    }

    html += '<li>' + child;
    prevIndent = currentIndent;
    prevListType = currentListType;

    if (nextChild && currentIndent === nextIndent) {
      html += '</li>';
    }


    if (!nextChild) {
      for (let i = 0; i < currentIndent; i++) {
        html += "</li>" + endTagStack.pop();
      }
    }
  }

  html += "</li>" + endTagStack.pop();

  console.log(html);
  return html;
};

export const handlePreBlocks = (listBlock: Block) => {
  let startToken = listBlock.children[0];
  let html = `<pre class="${startToken}">\n`;

  for (let i = 1; i < listBlock.children.length - 1; i++) {
    html += listBlock.children[i] + "\n";
  }
  html += "</pre>\n"
  console.log("pre: ", html)

  return html;
}

