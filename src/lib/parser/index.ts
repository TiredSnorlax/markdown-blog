import {
	rules,
	blockQuoteRules,
	unorderedListRules,
	orderedListRules,
	preOpeningRules,
	tableRowRules
} from '$lib/parser/rules';

interface Token {
	type: string;
	content: string;
}

interface Block {
	type: string;
	children: string[];
}

const convertDocToHTML = (content: string) => {
	const tokens = tokenise(content);
	if (!tokens) return;
	const blocks = groupTokens(tokens);
	const html = convertToHtml(blocks);
	return html;
};

export const tokenise = (doc: string) => {
	const tokens: Token[] = [];
	const splitByLine = doc.split('\n');

	for (let i = 0; i < splitByLine.length; i++) {
		const line = splitByLine[i];
		let token: Token;

		if (line.match(blockQuoteRules[0])) {
			token = { type: blockQuoteRules[1] as string, content: line };
		} else if (line.match(unorderedListRules[0])) {
			// const match = line.replace(unorderedListRules[0], unorderedListRules[1] as string);
			token = { type: unorderedListRules[1] as string, content: line };
		} else if (line.match(orderedListRules[0])) {
			// const match = line.replace(orderedListRules[0], orderedListRules[1] as string);
			token = { type: unorderedListRules[1] as string, content: line };
		} else if (line.match(preOpeningRules[0])) {
			token = { type: preOpeningRules[1] as string, content: line };
		} else if (line.match(tableRowRules[0])) {
			token = { type: tableRowRules[1] as string, content: line };
		} else {
			token = { type: 'INLINE', content: line };
		}
		tokens.push(token);
	}

	const cleanedTokens = [...tokens];
	for (let i = 0; i < tokens.length; i++) {
		const hasContent = tokens[tokens.length - i - 1].content.length > 0;
		if (hasContent) break;
		cleanedTokens.pop();
	}

	return cleanedTokens;
};

export const groupTokens = (tokens: Token[]) => {
	const blocks: Block[] = [];
	let currentBlock: Block | null = null;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.type === 'INLINE') {
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = null;
			blocks.push({ type: token.type, children: [token.content] });
		} else if (!currentBlock) {
			currentBlock = { type: token.type, children: [token.content] };
			// Check for ending pre tag
			if (token.type === 'PRE') {
				const relativeClosingIndex = tokens.slice(i + 1).findIndex((token) => token.type === 'PRE');
				if (relativeClosingIndex) {
					currentBlock.children = tokens
						.slice(i, i + relativeClosingIndex + 2)
						.map((item) => item.content);
					currentBlock.type = 'PRE';
					i += relativeClosingIndex + 1;
					blocks.push(currentBlock);
					currentBlock = null;
				}
			} else if (token.type === 'TABLE') {
				if (i < tokens.length) {
					const nextToken = tokens[i + 1];
					if (nextToken.type === 'TABLE_FORMAT') {
						currentBlock.children.push(nextToken.content);
						i++;
					}
				}
			}
		} else if (currentBlock && currentBlock.type === token.type) {
			currentBlock.children.push(token.content);
		} else if (currentBlock.type !== token.type) {
			blocks.push(currentBlock);
			currentBlock = null;
			i--;
			// currentBlock = { type: token.type, children: [token.content] };
		}
	}
	if (currentBlock) blocks.push(currentBlock);
	return blocks;
};

const convertInlineToHtml = (html: string) => {
	rules.forEach(([rule, template]) => {
		html = html.replace(rule, template as string);
	});
	return html;
};

export const convertToHtml = (blocks: Block[]) => {
	const htmlList: string[] = [];
	for (const block of blocks) {
		let html = '';
		// TODO: convert to swtich statement
		if (block.type === 'BLOCKQUOTE') {
			html = handleBlockQuotes(block);
		} else if (block.type === 'INLINE') {
			html = block.children[0];
			html = convertInlineToHtml(html);
			if (html.length > 0) {
				html = html.replace(/^\s*(\n)?(.+)/gm, function (m) {
					return /<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
				});
			} else {
				html = '<br>';
			}
		} else if (block.type === 'LIST') {
			html = handleLists(block);
		} else if (block.type === 'PRE') {
			html = handlePreBlocks(block);
		} else if (block.type === 'TABLE') {
			html = handleTables(block);
		}
		htmlList.push(html);
	}

	const output = htmlList.join('');
	return output;
};

export const handleLists = (listBlock: Block) => {
	let prevIndent = 0;
	let html = '';

	const endTagStack = [];

	let currentListType: string | null = null;
	let prevListType: string | null = null;

	for (let i = 0; i < listBlock.children.length; i++) {
		let child = listBlock.children[i];
		const nextChild = i + 1 < listBlock.children.length ? listBlock.children[i + 1] : null;

		const currentMatchIndent = (child.match(/^(\t*)/gm) as string[]) || [''];
		const currentIndent = currentMatchIndent[0].length;

		// const nextMatch = nextChild?.match(/^([^\S\t\n\r]*)\*/g) as string[] || [""];
		const nextMatchIndent = (nextChild?.match(/^(\t*)[^\t|\n]+/gm) as string[]) || null;
		const nextIndent = nextMatchIndent ? nextMatchIndent[0].length : -1;

		if (child.match(unorderedListRules[0])) {
			child = child.replace(/^\t*\*(.+)/gm, '$1');
			currentListType = 'UNORDERED_LIST';
		} else if (child.match(orderedListRules[0])) {
			child = child.replace(/^\t*(?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9])\.(.+)/gm, '$1');
			currentListType = 'ORDERED_LIST';
		}

		child = convertInlineToHtml(child);

		const currentTag = currentListType === 'UNORDERED_LIST' ? ['<ul>', '</ul>'] : ['<ol>', '</ol>'];

		// If start of list or nothing before list
		if (html.length === 0) {
			html += currentTag[0];
			endTagStack.push(currentTag[1]);
		} else if (currentIndent > prevIndent) {
			for (let i = 0; i < currentIndent - prevIndent; i++) {
				html += currentTag[0];
				endTagStack.push(currentTag[1]);
			}
		} else if (currentIndent < prevIndent) {
			// end current list indent level
			for (let i = 0; i < prevIndent - currentIndent; i++) {
				html += '</li>' + endTagStack.pop();
			}
		}

		// if children are on the same indent level but have different list types
		if (prevListType && currentListType !== prevListType && currentIndent === prevIndent) {
			html += endTagStack.pop();

			html += currentTag[0];
			endTagStack.push(currentTag[1]);
		}

		// adding child items to the list
		html += '<li>' + child;
		prevIndent = currentIndent;
		prevListType = currentListType;

		// close the child item if it does not contain another list
		if (nextChild && currentIndent === nextIndent) {
			html += '</li>';
		}

		// close the list with the stack
		if (!nextChild) {
			for (let i = 0; i < currentIndent; i++) {
				html += '</li>' + endTagStack.pop();
			}
		}
	}

	html += '</li>' + endTagStack.pop();

	return html;
};

export const handlePreBlocks = (listBlock: Block) => {
	const startToken = listBlock.children[0];
	let html = `<pre class="${startToken}">\n`;

	for (let i = 1; i < listBlock.children.length - 1; i++) {
		html += listBlock.children[i] + '\n';
	}
	html += '</pre>\n';

	return html;
};

export const handleBlockQuotes = (listBlock: Block) => {
	let content = '';
	for (const child of listBlock.children) {
		if (child.at(1) === ' ') {
			content = content.concat(child.slice(2) + '\n');
		} else {
			content = content.concat(child.slice(1) + '\n');
		}
	}
	// console.log(content);
	const innerHTML = convertDocToHTML(content);

	return '<blockquote>' + innerHTML + '</blockquote>';
};

export const handleTables = (listBlock: Block) => {
	let html = '<table> <tr>';
	const headerData = listBlock.children[0];
	const headerValues = headerData.slice(1, headerData.length - 1).split('|');

	for (const header of headerValues) {
		html += '<th>' + header + '</th>';
	}

	html += '</tr>';
	for (let i = 2; i < listBlock.children.length; i++) {
		html += '<tr>';
		const dataValues = listBlock.children[i].slice(1, headerData.length - 1).split('|');
		for (const data of dataValues) {
			html += '<td>' + data + '</td>';
		}
		html += '</tr>';
	}

	html += '</table>';

	return html;
};
