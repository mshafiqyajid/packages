import PropPlayground from "../PropPlayground";
import { CodeBlockStyled } from "@mshafiqyajid/react-code-block/styled";
import "@mshafiqyajid/react-code-block/styles.css";

const DEMO_CODE: Record<string, string> = {
  tsx: `import { useState } from "react";

interface CounterProps {
  initialCount?: number;
}

export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="counter">
      <button onClick={() => setCount((c) => c - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}`,

  typescript: `type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<User>;
}`,

  javascript: `const fibonacci = (n) => {
  const memo = new Map();

  function fib(k) {
    if (k <= 1) return k;
    if (memo.has(k)) return memo.get(k);
    const result = fib(k - 1) + fib(k - 2);
    memo.set(k, result);
    return result;
  }

  return fib(n);
};

console.log(fibonacci(40)); // 102334155`,

  css: `.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}`,

  bash: `# Install dependencies and start dev server
npm install

# Run all tests across the monorepo
npm run test

# Build a specific package
npm run build --workspace=packages/react-code-block

# Check types
npm run typecheck`,

  json: `{
  "name": "@mshafiqyajid/react-code-block",
  "version": "1.0.0",
  "description": "Syntax-highlighted code blocks for React",
  "peerDependencies": {
    "react": ">=17.0.0",
    "shiki": ">=1.0.0"
  },
  "peerDependenciesMeta": {
    "shiki": { "optional": true }
  }
}`,
};

const DIFF_CODE = `+import { useEffect } from "react";
 import { useState } from "react";

 export function Timer() {
-  const [time, setTime] = useState(0);
+  const [elapsed, setElapsed] = useState(0);

   useEffect(() => {
-    const id = setInterval(() => setTime((t) => t + 1), 1000);
+    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
     return () => clearInterval(id);
   }, []);

-  return <span>Time: {time}s</span>;
+  return <span>Elapsed: {elapsed}s</span>;
 }`;

export default function CodeBlockDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="CodeBlockStyled"
      importLine={`import { CodeBlockStyled } from "@mshafiqyajid/react-code-block/styled";\nimport "@mshafiqyajid/react-code-block/styles.css";`}
      props={[
        /* ── Code ── */
        { name: "language", group: "Code",
          control: { type: "select", options: ["tsx", "typescript", "javascript", "css", "bash", "json"] },
          defaultValue: "tsx" },
        { name: "showLineNumbers", label: "line numbers", group: "Code",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "wrap",  label: "wrap lines", group: "Code",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "diff",  label: "diff mode",  group: "Code",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "focusLines", label: "focus lines", group: "Code",
          control: { type: "select", options: ["", "1,2,3", "3,4,5,6"] },
          defaultValue: "", omitWhen: "" },

        /* ── Display ── */
        { name: "size",   group: "Display",
          control: { type: "select", options: ["sm", "md", "lg"] },
          defaultValue: "md", omitWhen: "md" },
        { name: "radius", group: "Display",
          control: { type: "select", options: ["none", "sm", "md", "lg"] },
          defaultValue: "md", omitWhen: "md" },
        { name: "fontFamily", label: "font", group: "Display",
          control: { type: "select", options: ["", "JetBrains Mono", "Fira Code", "Source Code Pro", "Cascadia Code", "monospace"] },
          defaultValue: "", omitWhen: "" },

        /* ── Header ── */
        { name: "showCopy",  label: "copy button",  group: "Header",
          control: { type: "toggle" }, defaultValue: true, omitWhen: true },
        { name: "terminal",  label: "terminal bar", group: "Header",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "badge",     group: "Header",
          control: { type: "select", options: ["", "Live", "Example", "New", "Beta", "Deprecated"] },
          defaultValue: "", omitWhen: "" },
        { name: "maxLines", label: "max lines", group: "Header",
          control: { type: "select", options: ["", "5", "10", "15"] },
          defaultValue: "", omitWhen: "" },
      ]}
      render={(v) => {
        const lang = (v.language as string) ?? "tsx";
        const isDiff = v.diff as boolean;
        const code = isDiff ? DIFF_CODE : (DEMO_CODE[lang] ?? DEMO_CODE["tsx"] ?? "");

        return (
          <div style={{ width: "100%" }}>
            <CodeBlockStyled
              code={code}
              language={isDiff ? "tsx" : lang}
              size={v.size as "sm" | "md" | "lg"}
              radius={v.radius as "none" | "sm" | "md" | "lg"}
              showLineNumbers={v.showLineNumbers as boolean}
              showCopy={v.showCopy as boolean}
              wrap={v.wrap as boolean}
              diff={isDiff}
              title={isDiff ? "Timer.tsx" : (v.terminal ? "index.tsx" : undefined)}
              showLanguageLabel
              terminal={v.terminal as boolean}
              badge={v.badge ? String(v.badge) : undefined}
              maxLines={v.maxLines ? Number(v.maxLines) : undefined}
              focusLines={v.focusLines ? String(v.focusLines).split(",").map(Number) : undefined}
              fontFamily={v.fontFamily ? String(v.fontFamily) : undefined}
            />
          </div>
        );
      }}
    />
  );
}
