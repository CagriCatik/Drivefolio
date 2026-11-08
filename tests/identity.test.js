import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {ownerName} from '../src/identity.js';

test('the name sculpture has real outlines for Turkish letters without fallback glyphs',()=>{
  assert.equal(ownerName,'Çağrı Çatık');
  const data=JSON.parse(readFileSync(new URL('../public/fonts/name-bold.json',import.meta.url),'utf8'));
  for(const letter of ownerName)assert.ok(data.glyphs[letter],`missing glyph: ${letter}`);
  for(const letter of ['Ç','ğ','ı'])assert.notEqual(data.glyphs[letter].o,data.glyphs['?'].o);
  const font=new FontLoader().parse(data);
  const geometry=new TextGeometry(ownerName,{font,size:0.95,depth:0.24,curveSegments:3});
  geometry.computeBoundingBox();
  assert.ok(geometry.attributes.position.count>500);
  assert.ok(geometry.boundingBox.min.y<0,'cedilla and descender extend below baseline');
  for(const value of geometry.attributes.position.array)assert.ok(Number.isFinite(value));
  geometry.dispose();
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes(`<title>${ownerName}`));
  assert.ok(html.includes(`<span>${ownerName}<small>`));
});
