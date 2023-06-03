import { rules } from '$lib/markdown/rules';

interface Token {
  type: string;
  content: string;
}

interface Block {
  type: string;
  children: string[];
}

const unorderedListRules = [/^(\t*\*.+)/gm, '$1', 'UNORDERED_LIST'];

export const tokenise = (doc: string) => {
  const tokens: Token[] = [];
  const splitByLine = doc.split('\n');

  for (let i = 0; i < splitByLine.length; i++) {
    const line = splitByLine[i];
    if (line.length === 0) continue;

    let token: Token;

    if (line.match(unorderedListRules[0])) {
      const match = line.replace(unorderedListRules[0], unorderedListRules[1] as string);
      token = { type: unorderedListRules[2] as string, content: match };
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
  for (const token of tokens) {
    if (token.type === 'INLINE') {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = null;
      blocks.push({ type: token.type, children: [token.content] });
    } else if (!currentBlock) {
      currentBlock = { type: token.type, children: [token.content] };
    } else if (currentBlock && currentBlock.type === token.type) {
      currentBlock.children.push(token.content);
    } else if (currentBlock.type !== token.type) {
      blocks.push(currentBlock);
      currentBlock = { type: token.type, children: [token.content] };
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
    } else if (block.type === "UNORDERED_LIST") {
      html = handleUnorderedLists(block);
    }
    htmlList.push(html);
  }

  let output = htmlList.join("");
  return output;
};

export const handleUnorderedLists = (listBlock: Block) => {
  let indentLevel = 0;
  let html = '<ul>';

  for (let i = 0; i < listBlock.children.length; i++) {
    let child = listBlock.children[i];
    const nextChild = i + 1 < listBlock.children.length ? listBlock.children[i + 1] : null;

    // const currentMatch = child.match(/^([^\S\t\n\r]*)\*/g) as string[] || [""];
    const currentMatch = child.match(/^(\t*)\*/g) as string[] || [""];
    // NOTE: Subtract 1 as the '*' is in the matched string
    const currentIndent = currentMatch[0].length - 1;

    // const nextMatch = nextChild?.match(/^([^\S\t\n\r]*)\*/g) as string[] || [""];
    const nextMatch = nextChild?.match(/^(\t*)\*/g) as string[] || [""];
    const nextIndent = nextMatch[0].length - 1;

    console.log(currentIndent, nextIndent)

    child = child.replace(/^\t*\*(.+)/gm, "$1");
    child = convertInlineToHtml(child);

    if (currentIndent > indentLevel) {
      html += '<ul>';
    } else if (currentIndent < indentLevel) {
      for (let i = 0; i < indentLevel; i += 1) {
        html += "</li></ul>"
      }
    }

    if (nextChild && currentIndent === nextIndent) {
      html += '</li>';
    }

    indentLevel = currentIndent;

    html += '<li>' + child;

    if (!nextChild) {
      for (let i = 0; i < currentIndent; i += 1) {
        html += "</li></ul>"
      }
    }
  }

  html += "</ul>"

  console.log(html);
  return html;
};


