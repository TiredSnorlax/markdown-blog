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
	console.log('tokenise');
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
		console.log(token.type);
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
		console.log(currentBlock);
	}
	if (currentBlock) blocks.push(currentBlock);
	console.log(blocks);
	return blocks;
};

export const convertToHtml = (blocks: Block[]) => {
	const htmlList: string[] = [];
	for (const block of blocks) {
		let html = '';
		if (block.type === 'INLINE') {
			html = block.children[0];
			rules.forEach(([rule, template]) => {
				html = html.replace(rule, template as string);
			});
			htmlList.push(html);
		}
	}
	console.log(htmlList);
};

const handleUnorderedLists = (listBlock: Block) => {
	let indentLevel = 0;
	let html = '<ul>';

	for (let i = 0; i < listBlock.children.length; i++) {
		const child = listBlock.children[i];
		const nextChild = i + 1 < listBlock.children.length ? listBlock.children[i + 1] : null;

		const currentIndent = child.match(/\t/g)?.length || 0;
		const nextIndent = nextChild?.match(/\t/g)?.length || 0;

		if (currentIndent > indentLevel) {
			html += '<ul>';
			indentLevel = currentIndent;
		} else if (currentIndent < indentLevel) {
			html += '</li></ul>';
			indentLevel = currentIndent;
		}
		html += '<li>' + child;

		if (currentIndent > nextIndent) {
			html += '</li>';
		}
	}

	console.log(html);
};
