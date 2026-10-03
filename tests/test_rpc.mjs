import ts from 'typescript';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/shared/backendRequest.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {backendRequest} = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

test('a synchronous loader exception becomes a catchable rejection', async () => {
  await assert.rejects(backendRequest(() => {throw new Error('sync loader failure');}, 20), /sync loader failure/);
});
test('an unanswered RPC terminates with a visible timeout error', async () => {
  await assert.rejects(backendRequest(() => new Promise(() => {}), 20), /backend did not respond/);
});
test('a successful RPC returns its original state', async () => {
  const state={settings:{region:null}};
  assert.equal(await backendRequest(() => Promise.resolve(state), 20), state);
});
