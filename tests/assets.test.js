import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

test('each shipped GLB has all external textures and buffers locally available', () => {
  for (const path of ['public/models/car/car.glb', 'public/models/city/garage.glb', 'public/models/city/trees.glb']) {
    const file = readFileSync(path);
    assert.equal(file.toString('ascii', 0, 4), 'glTF');
    const size = file.readUInt32LE(12);
    const data = JSON.parse(file.toString('utf8', 20, 20 + size));
    for (const resource of [...(data.images ?? []), ...(data.buffers ?? [])]) {
      if (!resource.uri || resource.uri.startsWith('data:')) continue;
      assert.equal(/^https?:/.test(resource.uri), false, 'no model needs an external CDN');
      assert.ok(existsSync(resolve(dirname(path), resource.uri)), `${path}: missing ${resource.uri}`);
    }
  }
});
