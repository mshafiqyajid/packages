/**
 * Tiny JSX/TSX highlighter for the PropPlayground.
 * Only handles the syntax that actually appears in generated snippets:
 *   - import statements
 *   - JSX tags + component names
 *   - prop names
 *   - string literals
 *   - {expressions}
 *   - boolean/number values
 *
 * Returns an array of tokens — each is { type, value }.
 * Render as <span class={`tok-${type}`}>{value}</span>.
 */

export type TokenType =
  | "keyword"
  | "string"
  | "comp"
  | "tag-punct"
  | "attr"
  | "punct"
  | "expr"
  | "number"
  | "boolean"
  | "comment"
  | "plain";

export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "import", "from", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "true", "false", "null", "undefined",
  "async", "await", "as", "default",
]);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;

  function emit(type: TokenType, value: string) {
    if (value.length === 0) return;
    tokens.push({ type, value });
  }

  while (i < n) {
    const ch = source[i]!;

    // Newline / whitespace — kept as plain so layout is preserved
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      let j = i;
      while (j < n && (source[j] === " " || source[j] === "\t" || source[j] === "\n" || source[j] === "\r")) j++;
      emit("plain", source.slice(i, j));
      i = j;
      continue;
    }

    // String literal
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < n && source[j] !== quote) {
        if (source[j] === "\\" && j + 1 < n) j += 2;
        else j++;
      }
      j = Math.min(j + 1, n);
      emit("string", source.slice(i, j));
      i = j;
      continue;
    }

    // Line comment
    if (ch === "/" && source[i + 1] === "/") {
      let j = i;
      while (j < n && source[j] !== "\n") j++;
      emit("comment", source.slice(i, j));
      i = j;
      continue;
    }

    // {expression}
    if (ch === "{") {
      // find matching close brace, accounting for nesting
      let depth = 1;
      let j = i + 1;
      while (j < n && depth > 0) {
        const c = source[j];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        if (depth === 0) break;
        // skip over strings inside the expression
        if (c === '"' || c === "'" || c === "`") {
          const q = c;
          j++;
          while (j < n && source[j] !== q) {
            if (source[j] === "\\" && j + 1 < n) j += 2;
            else j++;
          }
        }
        j++;
      }
      j = Math.min(j + 1, n);
      emit("expr", source.slice(i, j));
      i = j;
      continue;
    }

    // JSX tag start
    if (ch === "<") {
      // Punctuation `<` or `</`
      let j = i + 1;
      const isClose = source[j] === "/";
      if (isClose) j++;

      // Capture tag name (component if PascalCase, lower otherwise)
      let nameStart = j;
      while (j < n && /[A-Za-z0-9_]/.test(source[j]!)) j++;
      const tagName = source.slice(nameStart, j);

      emit("tag-punct", isClose ? "</" : "<");
      if (tagName.length > 0) {
        const isComp = /^[A-Z]/.test(tagName);
        emit(isComp ? "comp" : "tag-punct", tagName);
      }
      i = j;
      continue;
    }

    // Tag end punctuation
    if (ch === ">" || (ch === "/" && source[i + 1] === ">")) {
      const len = ch === "/" ? 2 : 1;
      emit("tag-punct", source.slice(i, i + len));
      i += len;
      continue;
    }

    // Identifiers / keywords / attribute names
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(source[j]!)) j++;
      const word = source.slice(i, j);

      if (KEYWORDS.has(word)) {
        if (word === "true" || word === "false") emit("boolean", word);
        else emit("keyword", word);
      } else {
        // If followed by `=`, it's an attribute name
        let k = j;
        while (k < n && source[k] === " ") k++;
        if (source[k] === "=") emit("attr", word);
        else emit("plain", word);
      }
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9.]/.test(source[j]!)) j++;
      emit("number", source.slice(i, j));
      i = j;
      continue;
    }

    // Default: punctuation
    emit("plain", ch);
    i++;
  }

  return tokens;
}
