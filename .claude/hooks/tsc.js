import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";

// Read stdin
async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}

const FORMAT_HOST = {
  getCanonicalFileName: (f) => f,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

// Returns formatted error string if type errors found, null otherwise.
// Throws if tsconfig cannot be read.
function runTypeCheck(configPath) {
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.formatDiagnostic(configFile.error, FORMAT_HOST));
  }

  const parseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    onUnRecoverableConfigFileDiagnostic: () => {},
  };

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    parseConfigHost,
    path.dirname(configPath)
  );

  const program = ts.createProgram(parsed.fileNames, {
    ...parsed.options,
    noEmit: true,
    incremental: false,
    tsBuildInfoFile: undefined,
  });

  const diagnostics = Array.from(ts.getPreEmitDiagnostics(program));
  if (diagnostics.length === 0) return null;

  return ts.formatDiagnostics(diagnostics, FORMAT_HOST);
}

function findTsConfig(filePath) {
  let dir = path.dirname(path.resolve(filePath));
  const root = path.parse(dir).root;
  while (dir !== root) {
    const candidate = path.join(dir, "tsconfig.json");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

async function main() {
  const input = await readInput();
  const file = input.tool_response?.filePath || input.tool_input?.file_path;

  // Only check TypeScript files
  if (!file || !/\.(ts|tsx)$/.test(file)) process.exit(0);

  const configPath = findTsConfig(file);
  if (!configPath) process.exit(0);

  let result;
  try {
    result = runTypeCheck(configPath);
  } catch (e) {
    // Config error — skip gracefully
    process.exit(0);
  }

  if (result !== null) {
    console.error(result);
    process.exit(2);
  }
}

main();
