interface IRule {
	words: string[];
	color: { r: number; g: number; b: number };
}

const operands = /[+\-=*/]/gm;

class Parser {
	cursor: number;
	content: string;

	constructor(content: string) {
		this.cursor = 0;
		this.content = content;
	}

	getCurrentCharacter() {
		return this.content[this.cursor];
	}

	startsWith(str: string) {
		return this.content.slice(this.cursor).startsWith(str);
	}

	eof() {
		return this.cursor >= this.content.length;
	}

	consumeChar() {
		const char = this.getCurrentCharacter();
		console.log(this.cursor);
		this.cursor = this.cursor + 1;
		console.log(this.cursor);
		return char;
	}

	consumeWhile(testFunc: (char: string) => boolean) {
		let results = '';
		while (!this.eof && testFunc(this.getCurrentCharacter())) {
			results += this.consumeChar();
		}
		return results;
	}

	consumeWhitespace() {
		return this.consumeWhile((c: string) => !!c.match(/\s/gm));
	}

	parseToken() {
		return this.consumeWhile((c: string) => !!c.match(/[^\s+\-=*/]*/gm));
	}

	convertToHtml() {
		const tokens: string[] = [];
		while (!this.eof()) {
			tokens.push(this.consumeWhitespace());
			const token = this.parseToken();
			tokens.push(token);
			if (this.getCurrentCharacter().match(operands)) {
				tokens.push(this.consumeChar());
			}
		}
		console.log(tokens);
		const polishedTokens = [];
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			// if it is a number
			if (!isNaN(parseFloat(token))) {
				polishedTokens.push(`<span class="number-token">${token}</span>`);
			} else if (token.match(/["']/gm)) {
				let stringContent = '';
				while (i < tokens.length - 1) {
					const nextToken = tokens[i + 1];
					if (nextToken === token) {
						break;
					} else {
						stringContent = stringContent.concat(nextToken);
					}
				}
				polishedTokens.push(`<span class="string-token">${stringContent}</span>`);
			} else if (token.match(operands)) {
				polishedTokens.push(`<span class"operand-token">${token}</span>`);
			} else {
				polishedTokens.push(token);
			}
		}
		console.log(polishedTokens);
	}
}

export default function parseCode(code: string) {
	const parser = new Parser(code);
	console.log(code);
	// parser.cursor = parser.cursor + 1;
	// console.log(parser.getCurrentCharacter());
	parser.convertToHtml();
}

// const typescriptRules = [
// 	{
// 		words: ['let', 'const', 'var', 'class', 'interface', 'return', 'for', 'while'],
// 		color: { r: 146, g: 48, b: 227 }
// 	},
// 	{}
// ];
