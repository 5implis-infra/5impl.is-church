---
name: text-formatter
description: Format text files by normalizing whitespace, fixing line endings, and trimming trailing spaces. Use when the user says "format this text", "clean up whitespace", or "normalize line endings".
---

# Text Formatter

Cleans and normalizes text files.

## What it does

- Removes trailing whitespace from lines
- Normalizes line endings to Unix (LF)
- Trims blank lines at end of file
- Reports how many lines were changed

## Usage

```
/text-formatter <file-path>
```

## Process

1. Read the file
2. Process each line: strip trailing whitespace
3. Normalize line endings
4. Write back to file
5. Report the summary

Keep a backup at `<file>.bak` before writing.
