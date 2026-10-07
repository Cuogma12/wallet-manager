const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
const root = path.resolve(__dirname, '../..');

// Run pure TS/data-layer modules without bundling React Native or adding test dependencies.
function loadTypescript(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  const localRequire = (name) => {
    if (name === 'react-native')
      return { Platform: { OS: process.env.TEST_PLATFORM || 'ios' } };
    if (name.startsWith('@/')) return loadTypescript(`src/${name.slice(2)}.ts`);
    return require(name);
  };
  new Function('require', 'module', 'exports', outputText)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

module.exports = { loadTypescript };
