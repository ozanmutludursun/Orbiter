import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const jsxRuntime = pathToFileURL(require.resolve('react/jsx-runtime')).href;
function compile(path) {
  return ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'), {
    compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}
  }).outputText.replaceAll('"react/jsx-runtime"',JSON.stringify(jsxRuntime));
}
const iconModule = 'data:text/javascript;base64,'+Buffer.from(compile('../src/shared/ConditionIcon.tsx')).toString('base64');
const moduleCode = compile('../src/shared/Notification.tsx').replace(/(['"])\.\/ConditionIcon\1/,JSON.stringify(iconModule));
const {notificationContent} = await import('data:text/javascript;base64,'+Buffer.from(moduleCode).toString('base64'));
const item = {conditionId:'bird-city',name:'Bird City',map:'Buried City',icon:'<svg><path d="M0 0"/></svg>'};

test('a single condition uses its official icon and retains the map text',()=>{
  const content=notificationContent({title:'Starting now · ARC Raiders',body:'Bird City · Buried City',items:[item]});
  assert.equal(content.body,'Bird City · Buried City');
  const icon=renderToStaticMarkup(content.icon);
  assert.match(icon,/mask-image:url/);
  assert.match(icon,/background-color:currentColor/);
  assert.doesNotMatch(icon,/<svg/);
});
test('merged conditions retain their individual icons and escaped names',()=>{
  const content=notificationContent({title:'Starting now · ARC Raiders',body:'unused',items:[item,{...item,conditionId:'other',name:'<script>bad</script>',map:'The Blue Gate'}]});
  const body=renderToStaticMarkup(content.body);
  assert.match(body,/Bird City · Buried City/);
  assert.match(body,/&lt;script&gt;bad&lt;\/script&gt; · The Blue Gate/);
  assert.equal((body.match(/mask-image:url/g)||[]).length,4); // standard + WebKit per icon
  assert.doesNotMatch(body,/<script>/);
});
test('one condition on multiple maps keeps its official icon and every map',()=>{
  const body='Bird City · Buried City\nBird City · The Blue Gate';
  const content=notificationContent({title:'Starting now · ARC Raiders',body,items:[item,{...item,map:'The Blue Gate'}]});
  assert.equal(content.body,body);
  assert.match(renderToStaticMarkup(content.icon),/mask-image:url/);
});
test('an older notice without artwork still renders its original text',()=>{
  const content=notificationContent({title:'Orbiter',body:'Test notification'});
  assert.equal(content.body,'Test notification');
  assert.match(renderToStaticMarkup(content.icon),/◎/);
});
