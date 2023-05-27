interface Token {
  type: string;
  content: string;
}

interface Group {
  type: string;
  children: Token[]
}

const rules = [
  [/(#{1,6}\s?[^\n]+)/g, "$1", "HEADER"],
]

export const tokenise = (doc: string) => {
  let splitByLine = doc.split("\n");

  for (let i = 0; i < splitByLine.length; i++) {
    let line = splitByLine[i];
    if (line.length === 0) return;

    for (const [rule, template, name] of rules) {
      let content = line.replace(rule, template as string);
      let token: Token = { type: name as string, content };
      console.log(token)
    }
  }

}
