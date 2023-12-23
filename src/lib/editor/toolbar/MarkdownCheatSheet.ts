type syntax = { element: string; markdown: string; output: string };

export const cheatsheet: syntax[] = [
	{
		element: 'Heading',
		markdown: '# H1\n## H2\n### H3',
		output: '<h1>H1</h1><h2>H2</h2><h3>H3></h3>'
	},
	{
		element: 'Bold',
		markdown: '**bold text**',
		output: '<strong>bold</strong>'
	},
	{
		element: 'Italic',
		markdown: '*italicized text*',
		output: '<i>italicized text</i>'
	},
	{
		element: 'Blockquote',
		markdown: '> blockquote',
		output: '<blockquote>blockquote</blockquote>'
	},
	{
		element: 'Ordered List',
		markdown: '1. First Item\n2. Second Item\n3. Third Item',
		output: '<ol><li>First Item</li><li>Second Item</li><li>Third Item</li></ol>'
	},
	{
		element: 'Unordered List',
		markdown: '- First Item\n- Second Item\n- Third Item',
		output: '<ul><li>First Item</li><li>Second Item</li><li>Third Item</li></ul>'
	},
	{
		element: 'Code',
		markdown: '`code`',
		output: '<pre>code</pre>'
	},
	{
		element: 'Horizontal Rule',
		markdown: '--- \nOR ***\nOR ---',
		output: '<hr />'
	},
	{
		element: 'Link',
		markdown: '[title](https://www.google.com)',
		output: '<a href="https://www.google.com">Google</a>'
	},
	{
		element: 'Image',
		markdown: '![alt text](image.jpg)',
		output: '<img src="image.jpg" alt="alt text" />'
	},
	{
		element: 'Table',
		markdown:
			'| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text | ',
		output:
			'<table><tbody><tr><th>Syntax</th><th>Description</th></tr><tr><td>Header</td><td>Title</td></tr><tr><td>Paragraph</td><td> Text</td></tr></tbody></table>'
	},
	{
		element: 'Fenced Code Block',
		markdown: ' 	```\n{\n\t"firstName": "John",\n\t"lastName": "Smith",\n\t"age": 25\n}\n``` ',
		output: '<pre>{\n\t"firstName": "John",\n\t"lastName": "Smith",\n\t"age": 25\n}</pre>'
	},
	{
		element: 'Strikethrough',
		markdown: '~~~The world is flat.~~~',
		output: '<s>The world is flat</s>'
	}
];
