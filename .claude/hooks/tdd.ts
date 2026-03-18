#!/usr/bin/env npx tsx
/// <reference types="node" />
/**
 * TDD Hook - PreToolUse
 *
 * Blocks Claude from writing implementation code unless a corresponding
 * test file already exists. Tests are expected to fail when first written.
 */

import * as fs from "fs";
import * as path from "path";

interface HookInput {
  hook_event_name: string;
  tool_name: string;
  tool_input: {
    file_path?: string;
    [key: string]: unknown;
  };
}

interface HookOutput {
  decision: "block" | "allow";
  reason?: string;
}

function respond(output: HookOutput): void {
  console.log(JSON.stringify(output));
  process.exit(output.decision === "block" ? 2 : 0);
}

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx",
  ".py", ".go", ".rs", ".java",
  ".cs", ".rb", ".php", ".swift", ".kt",
]);

const IGNORED_DIRS = new Set([
  "node_modules", ".next", "dist", "build", "out",
  ".git", "coverage", "__pycache__", ".cache",
]);

function isInIgnoredDir(filePath: string): boolean {
  return filePath.split(path.sep).some((part) => IGNORED_DIRS.has(part));
}

function isTestFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return (
    /\.(test|spec)\.[^.]+$/.test(basename) ||
    filePath.includes(`${path.sep}__tests__${path.sep}`) ||
    filePath.includes(`${path.sep}test${path.sep}`) ||
    filePath.includes(`${path.sep}tests${path.sep}`) ||
    filePath.includes(`${path.sep}spec${path.sep}`) ||
    filePath.includes(`${path.sep}specs${path.sep}`)
  );
}

function isCodeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  if (!CODE_EXTENSIONS.has(ext)) return false;

  // Skip config, declaration, and setup files
  if (
    basename.endsWith(".d.ts") ||
    basename.includes(".config.") ||
    basename.startsWith("__") ||
    basename === "index.ts" ||
    basename === "index.tsx" ||
    basename === "index.js" ||
    basename === "index.jsx"
  ) {
    return false;
  }

  return true;
}

function findExpectedTestPaths(filePath: string): string[] {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  return [
    path.join(dir, `${basename}.test${ext}`),
    path.join(dir, `${basename}.spec${ext}`),
    path.join(dir, "__tests__", `${basename}.test${ext}`),
    path.join(dir, "__tests__", `${basename}${ext}`),
    path.join(dir, "..", "tests", `${basename}.test${ext}`),
    path.join(dir, "..", "__tests__", `${basename}.test${ext}`),
  ];
}

function testFileExists(testPaths: string[]): boolean {
  return testPaths.some((p) => fs.existsSync(p));
}

// Read stdin
let raw = "";
try {
  raw = fs.readFileSync("/dev/stdin", "utf-8");
} catch {
  process.exit(0);
}

let input: HookInput;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const { tool_name, tool_input } = input;

// Only care about file-writing tools
if (tool_name !== "Edit" && tool_name !== "Write") {
  process.exit(0);
}

const filePath: string | undefined = tool_input?.file_path;
if (!filePath) process.exit(0);

// After the guard above, filePath is guaranteed to be a string
const fp = filePath as string;

// Skip irrelevant files
if (isInIgnoredDir(fp)) process.exit(0);
if (isTestFile(fp)) process.exit(0);
if (!isCodeFile(fp)) process.exit(0);

// Check for a corresponding test file
const expectedTestPaths = findExpectedTestPaths(fp);
if (testFileExists(expectedTestPaths)) {
  process.exit(0);
}

// No test file found — block and guide Claude
const suggestions = expectedTestPaths.slice(0, 3).join("\n  - ");
respond({
  decision: "block",
  reason: `TDD Protocol: No test file found for \`${path.basename(fp)}\`.

Please write the failing tests FIRST before implementing this file.
Tests are expected to fail when written — that is correct TDD behaviour.

Create a test file at one of:
  - ${suggestions}

Once the test file exists, come back and implement \`${path.basename(fp)}\`.`,
});