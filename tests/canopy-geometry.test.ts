import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canopyNodes, canopyStems, ribbonAt, bendCurve, pointAt } from '../src/lib/canopy-geometry';

test('each growing ribbon has its own finite, changing geometry and a stable attached tip', () => {
  for (const part of [...canopyStems, ...canopyNodes]) {
    assert.equal(ribbonAt(part.curve, 0, part.width).surface, 'M0 0');
    const half = ribbonAt(part.curve, 0.5, part.width);
    const full = ribbonAt(part.curve, 1, part.width);
    assert.notEqual(half.surface, full.surface);
    assert.doesNotMatch(full.surface, /NaN|Infinity/);
    assert.deepEqual(pointAt(part.curve, 0), part.curve[0]);
    assert.deepEqual(pointAt(part.curve, 1), part.curve[3]);
    const bent = bendCurve(part.curve, 4);
    assert.deepEqual(bent[0], part.curve[0]);
    assert.notDeepEqual(bent[3], part.curve[3]);
  }
});
