const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

// Reuse the app dictionary for the no-JavaScript fallback in the generated HTML.
const messages = { exports: {} };
const compiled = ts.transpileModule(
  fs.readFileSync(path.join(root, 'src/shared/i18n/locales/vi.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
new Function('exports', compiled)(messages.exports);

fs.mkdirSync(path.join(output, 'icons'), { recursive: true });
fs.copyFileSync(
  path.join(root, 'assets/icon.png'),
  path.join(output, 'icons/app.png'),
);
const index = path.join(output, 'index.html');
fs.writeFileSync(
  index,
  fs
    .readFileSync(index, 'utf8')
    .replace('__MONEE_NOSCRIPT__', messages.exports.vi.pwa.noScript),
);

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  });
}
const assets = files(output)
  .filter(
    (file) =>
      /\.(?:html|js|css|wasm|ttf|otf|png|jpg|jpeg|webp|svg|ico|webmanifest)$/.test(
        file,
      ) && path.basename(file) !== 'sw.js',
  )
  .sort();
if (!assets.some((file) => file.endsWith('.wasm')))
  throw new Error('SQLite WASM asset is missing');
const hash = crypto.createHash('sha256');
const template = fs.readFileSync(
  path.join(root, 'src/services/pwa/service-worker.js'),
  'utf8',
);
hash.update(template);
for (const file of assets)
  hash.update(path.relative(output, file)).update(fs.readFileSync(file));
const version = hash.digest('hex').slice(0, 16);
const urls = assets.map(
  (file) => '/' + path.relative(output, file).split(path.sep).join('/'),
);
fs.writeFileSync(
  path.join(output, 'sw.js'),
  template
    .replace('__VERSION__', version)
    .replace('/*__ASSETS__*/ []', JSON.stringify(urls)),
);
process.stdout.write(
  `PWA shell ${version}: ${urls.length} local assets; no financial data included.\n`,
);
