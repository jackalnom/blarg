import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { childFamilies } from '../static/js/visuals/probability-models.js';
import { tuesdaySelection } from '../static/js/visuals/tuesday-families.js';

const template = readFileSync(new URL('../layouts/shortcodes/probability-vis.html', import.meta.url), 'utf8');
assert.match(template, /"condition" "older-tuesday" "label" "The older child is a boy born on Tuesday"/);
assert.ok(!template.includes('<select'));
assert.ok(!template.includes('"condition" "all"'));
for (const condition of ['older-tuesday', 'tuesday']) {
    assert.ok(template.includes(`"condition" "${condition}"`));
}
const all = childFamilies('all');
assert.equal(all.length, 196);
assert.equal(all.filter(f => f.target).length, 49);
for (const [condition, index, count, targets] of [
    ['older-tuesday', 0, 14, 7],
    ['tuesday', 1, 27, 13]
]) {
    const families = childFamilies(condition);
    const kept = families.filter(f => f.included);
    assert.equal(kept.length, count);
    assert.equal(kept.filter(f => f.target).length, targets);
    for (const f of families) {
        assert.equal(f.included, tuesdaySelection([f.older, f.younger])[index]);
        assert.equal(f.target, f.older < 7 && f.younger < 7);
    }
    if (condition === 'older-tuesday') {
        assert.ok(kept.every(f => f.older === 1), 'Only the BTu row should remain');
        assert.deepEqual(kept.filter(f => f.target).map(f => f.younger), [0, 1, 2, 3, 4, 5, 6]);
    }
}
const added = childFamilies('tuesday').filter(f => f.included && f.older !== 1);
assert.equal(added.length, 13);
assert.equal(added.filter(f => f.target).length, 6);
assert.equal(added.filter(f => !f.target).length, 7);
assert.ok(added.every(f => f.younger === 1));
console.log('Two grid labels, selected cells, and six-boy/seven-girl additions verified.');
