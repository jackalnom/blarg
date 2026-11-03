import { initSelectionPiles } from './selection-piles.js';

export function sampleDice(random = Math.random) {
    return [1 + Math.floor(random() * 6), 1 + Math.floor(random() * 6)];
}
export function sumsToSeven(dice) {
    return dice[0] + dice[1] === 7;
}

export function initDiceCounting({ id }) {
    initSelectionPiles({ id, model: {
        itemName: 'Roll',
        sourceShape: 'die',
        sourceLabels: ['First die', 'Second die'],
        sourceText: (dice, i) => dice[i],
        titles: ['Do the two dice add up to seven?'],
        columnLabels: ['Sum is 7', 'Other sums'],
        denominatorLabel: 'rolls',
        emptyText: 'Roll two dice to add a result.',
        sample: sampleDice,
        selection: () => [true],
        isTarget: sumsToSeven,
        tileText: dice => dice.join('+'),
        describe: dice => `first die ${dice[0]}, second die ${dice[1]}, sum ${dice[0] + dice[1]}`
    }});
}
