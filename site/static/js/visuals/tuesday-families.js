import { initSelectionPiles } from './selection-piles.js';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shortDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// 0–6 encode boys, 7–13 girls; within each group days run Monday–Sunday.
export function tuesdaySelection(family) {
    return [family[0] === 1, family.includes(1)];
}
export function sampleFamily(random = Math.random) {
    return [Math.floor(random() * 14), Math.floor(random() * 14)];
}
const sex = child => child < 7 ? 'B' : 'G';
const childText = child => `${sex(child)} ${shortDays[child % 7]}`;

export function initTuesdayFamilies({ id }) {
    initSelectionPiles({ id, model: {
        itemName: 'Family',
        sourceLabels: ['Older child', 'Younger child'],
        sourceFontSize: 13,
        sourceText: (family, i) => childText(family[i]),
        titles: ['Older child is a Tuesday boy', 'At least one is a Tuesday boy'],
        columnLabels: ['Two boys', 'One boy', 'Discarded'],
        emptyText: 'Add a family to check both Tuesday-boy rules.',
        sample: sampleFamily,
        selection: tuesdaySelection,
        isTarget: family => family.every(child => child < 7),
        tileText: family => family.map(sex).join(''),
        describe: family => family.map((child, i) => `${i ? 'younger' : 'older'} ${child < 7 ? 'boy' : 'girl'} born ${days[child % 7]}`).join(', ')
    }});
}
