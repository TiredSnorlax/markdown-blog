export const rules = [
	// header rules
	[/^#{6}\s?([^\n]+)/g, '<h6>$1</h6>'],
	[/^#{5}\s?([^\n]+)/g, '<h5>$1</h5>'],
	[/^#{4}\s?([^\n]+)/g, '<h4>$1</h4>'],
	[/^#{3}\s?([^\n]+)/g, '<h3>$1</h3>'],
	[/^#{2}\s?([^\n]+)/g, '<h2>$1</h2>'],
	[/^#{1}\s?([^\n]+)/g, '<h1>$1</h1>'],

	// bold, italics and paragragh rules
	[/[*_]{2}([^*_]+)[*_]{2}/g, '<b>$1</b>'],
	[/[*_]{1}([^*_]+)[*_]{1}/g, '<i>$1</i>'],
	[/[~]{2}([^~]+)[~]{2}/g, '<s>$1</s>'],

	// code
	[/[`]{1}([^`]+)[`]{1}/g, '<code>$1</code>'],
	//
	//Image
	[/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />'],

	// links
	[/\[(.*?)\]\((.*?)\)/g, '<a href="$2" title="$3" target="_blank" style="color:#2A5DB0">$1</a>'],

	[/^[-*]{3}\s*$/gm, '<hr />'],
	[/^_{3,}\s*$/gm, '<hr />']
];

// TODO : change this to an object
export const unorderedListRules = [/^(\t*[*-][^\S\t\n\r].+)/gm, 'LIST'];
export const orderedListRules = [
	/^(\t*(?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9])\.[^\S\t\n\r].*)/gm,
	'LIST'
];
export const uncheckedListRules = [/^\[\s\]\s(.+)/gm, 'UNCHECKED'];
export const checkedListRules = [/^\[x\]\s(.+)/gm, 'CHECKED'];
export const preOpeningRules = [/^`{3}(.+)?/gm, 'PRE'];
export const blockQuoteRules = [/^>+(.*)/gm, 'BLOCKQUOTE'];
export const tableRowRules = [/^\|(.+)\|$/gm, 'TABLE'];
export const tableAlignmentRules = [/^(\|(?:\s*[-:]+\s*\|)+)/gm, 'TABLE_FORMAT'];

export const enterSpecialRules = [
	[/^(\t*[*-][^\S\t\n\r].+)/gm, 'UNORDERED_LIST'],
	[/^\t*((?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9]))\.[^\S\t\n\r].+/gm, 'ORDERED_LIST'],
	[/^>+(.*)/gm, 'BLOCKQUOTE']
];

export const tabSpecialRules = [
	[/^(\t*)[*-]\s$/gm, 'UNORDERED_LIST'],
	[/^(\t*)(?:[0-9]|[1-9][0-9]|[1-9][0-9][0-9])\.\s$/gm, 'ORDERED_LIST']
];
