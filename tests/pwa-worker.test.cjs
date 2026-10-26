const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function worker(options = {}) {
  const listeners = {};
  const deleted = [];
  const store = new Map([
    ['/index.html', new Response('OFFLINE APP')],
    ['/app.js', new Response('BUNDLE')],
  ]);
  const names = options.names ?? [
    'monee-shell-old',
    'monee-shell-current',
    'unrelated-cache',
  ];
  const cache = {
    match: async (key) => store.get(key),
    addAll: async () => {
      if (options.failInstall) throw new Error('Missing asset');
    },
  };
  const self = {
    addEventListener: (name, handler) => {
      listeners[name] = handler;
    },
    location: { origin: 'https://monee.test' },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
  };
  const source = fs
    .readFileSync(
      path.join(__dirname, '../src/services/pwa/service-worker.js'),
      'utf8',
    )
    .replace('__VERSION__', 'current')
    .replace('/*__ASSETS__*/ []', JSON.stringify(['/index.html', '/app.js']));
  vm.runInNewContext(source, {
    self,
    URL,
    Request: class {
      constructor(url) {
        this.url = url;
      }
    },
    fetch: async () => new Response('NETWORK'),
    caches: {
      open: async () => cache,
      keys: async () => names,
      delete: async (name) => {
        deleted.push(name);
        return true;
      },
    },
  });
  return { listeners, deleted };
}

test('service worker serves deep links from the installed shell without caching query strings', async () => {
  const { listeners } = worker();
  let result;
  listeners.fetch({
    request: {
      url: 'https://monee.test/transaction-detail?id=private-id',
      mode: 'navigate',
      method: 'GET',
    },
    respondWith: (value) => {
      result = value;
    },
  });
  assert.equal(await (await result).text(), 'OFFLINE APP');
});

test('only explicitly precached same-origin GET assets are intercepted', async () => {
  const { listeners } = worker();
  for (const [url, method] of [
    ['https://monee.test/api/transactions', 'GET'],
    ['https://bank.test/app.js', 'GET'],
    ['https://monee.test/backup.json', 'GET'],
    ['https://monee.test/app.js?token=private', 'GET'],
    ['https://monee.test/app.js', 'POST'],
  ]) {
    let intercepted = false;
    listeners.fetch({
      request: { url, method, mode: 'cors' },
      respondWith: () => {
        intercepted = true;
      },
    });
    assert.equal(intercepted, false, url);
  }
  let response;
  listeners.fetch({
    request: { url: 'https://monee.test/app.js', method: 'GET', mode: 'cors' },
    respondWith: (value) => {
      response = value;
    },
  });
  assert.equal(await (await response).text(), 'BUNDLE');
});

test('failed installation removes only its partial shell cache', async () => {
  const { listeners, deleted } = worker({ failInstall: true });
  let task;
  listeners.install({
    waitUntil: (value) => {
      task = value;
    },
  });
  await assert.rejects(task, /Missing asset/);
  assert.deepEqual(deleted, ['monee-shell-current']);
});

test('activation keeps current/previous shells and never removes unrelated storage', async () => {
  const { listeners, deleted } = worker({
    names: [
      'monee-shell-ancient',
      'monee-shell-old',
      'monee-shell-current',
      'unrelated-cache',
    ],
  });
  let task;
  listeners.activate({
    waitUntil: (value) => {
      task = value;
    },
  });
  await task;
  assert.deepEqual(deleted, ['monee-shell-ancient']);
});
