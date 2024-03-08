# About this project

This project is an online markdown editor.

## Core features:

1. Editor
2. Markdown parser
3. File system
   All of the above stated features were build from scratch with little dependencies

## Caveats:

1. The editor is extremely buggy.

- The solution may be to use an external library as it is too time consuming to build an editor like that from scratch

2. The markdown parser, while working, uses regex instead of the more traditional tokenisation

- The functionality is there, but the code is rather unoptimised

3. The file system requires a server to handle the recursive deletion of folders and files, which the current serverless functions are unable to do so.

This is just a prototype and can be reworked in the future.

## Pictures:

![Editor](static\readme\showcase-editor.png 'Editor')
![File System](static\readme\showcase-file.png 'File System')
