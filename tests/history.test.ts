import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companyHistory, validateHistoryApproval } from '../src/data/history';

test('owner history preserves seven milestones and requires separate publication approval', () => {
  assert.deepEqual(
    companyHistory.milestones.map((item) => item.year),
    ['1972', '1972–1992', '1992', '1996', '1999', '2002', '2006'],
  );
  assert.ok(
    companyHistory.milestones.every(
      (item) => item.title.en && item.title.tr && item.description.en && item.description.tr,
    ),
  );
  assert.throws(() => validateHistoryApproval(), /company history/);
  validateHistoryApproval({ ...companyHistory, approved: true });
});
