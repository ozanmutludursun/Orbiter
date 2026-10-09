import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../distribution/worker.mjs';

const official = [{ id: 1, name: 'MagicPods', versions: [{ name: '1.0.0', hash: 'old' }] }];
const orbiter = {
  id: -1, name: 'Orbiter', author: 'Rageworks', description: 'ARC Raiders conditions',
  tags: ['utility'], image_url: '', versions: [{ name: '0.1.13', hash: 'a'.repeat(64), artifact: 'https://example.com/orbiter.zip' }],
};
const env = { ORBITER_MANIFEST_URL: 'https://example.com/orbiter.json' };
const json = value => new Response(JSON.stringify(value));

test('Decky CORS preflight accepts its version header without upstream calls', async () => {
  const handler = createHandler(() => { throw Error('Unexpected fetch'); });
  const response = await handler(new Request('https://store.test/plugins', { method: 'OPTIONS' }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal(response.headers.get('Access-Control-Allow-Headers'), 'X-Decky-Version');
});

test('preserves official plugins and adds the exact Orbiter name, version, digest and artifact', async () => {
  const calls = [];
  const handler = createHandler(async (url, options) => {
    calls.push({ url, options });
    return json(url === env.ORBITER_MANIFEST_URL ? orbiter : official);
  });
  const response = await handler(new Request('https://store.test/plugins?sort_by=name&sort_direction=asc&token=secret', {
    headers: { 'X-Decky-Version': 'v3.2.9', Authorization: 'secret' },
  }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [...official, orbiter]);
  assert.equal(calls[0].options.headers['X-Decky-Version'], 'v3.2.9');
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(new URL(calls[0].url).searchParams.has('token'), false);
});

test('deduplicates a future official Orbiter listing', async () => {
  const handler = createHandler(async url => json(url === env.ORBITER_MANIFEST_URL ? orbiter : [...official, { ...orbiter, versions: [] }]));
  const response = await handler(new Request('https://store.test/'), env);
  assert.equal((await response.json()).filter(plugin => plugin.name === 'Orbiter').length, 1);
});

test('uses Decky asc/desc sorting values', async () => {
  const handler = createHandler(async url => json(url === env.ORBITER_MANIFEST_URL ? orbiter : official));
  const response = await handler(new Request('https://store.test/plugins?sort_by=name&sort_direction=desc'), env);
  assert.deepEqual((await response.json()).map(plugin => plugin.name), ['Orbiter', 'MagicPods']);
});

test('official outage does not hide other plugin updates behind an Orbiter-only catalogue', async () => {
  const handler = createHandler(async url => url === env.ORBITER_MANIFEST_URL ? json(orbiter) : new Response('offline', { status: 503 }));
  const response = await handler(new Request('https://store.test/plugins'), env);
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('rejects malformed releases and invalid official catalogues', async () => {
  for (const bad of [{ ...orbiter, name: 'Something else' }, { ...orbiter, versions: [{ ...orbiter.versions[0], hash: '' }] },
    { ...orbiter, versions: [{ ...orbiter.versions[0], artifact: 'http://example.com/orbiter.zip' }] }]) {
    const handler = createHandler(async url => json(url === env.ORBITER_MANIFEST_URL ? bad : official));
    assert.equal((await handler(new Request('https://store.test/'), env)).status, 502);
  }
  const handler = createHandler(async url => json(url === env.ORBITER_MANIFEST_URL ? orbiter : []));
  assert.equal((await handler(new Request('https://store.test/'), env)).status, 502);
});

test('HEAD is bodyless and update statistics require no external request', async () => {
  const handler = createHandler(async url => json(url === env.ORBITER_MANIFEST_URL ? orbiter : official));
  const head = await handler(new Request('https://store.test/', { method: 'HEAD' }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const noFetch = createHandler(() => { throw Error('Unexpected fetch'); });
  assert.equal((await noFetch(new Request('https://store.test/Orbiter/versions/0.1.13/increment?isUpdate=true', { method: 'POST' }), env)).status, 204);
  assert.equal((await noFetch(new Request('https://store.test/plugins/Orbiter/versions/0.1.13/increment?isUpdate=true', { method: 'POST' }), env)).status, 204);
  assert.equal((await noFetch(new Request('https://store.test/anything', { method: 'POST' }), env)).status, 405);
});
