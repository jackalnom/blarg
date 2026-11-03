import { initSelectionPiles } from './selection-piles.js';

export function coinSelection(pair) {
    return [pair[0] === 'H', pair.includes('H')];
}

export function initCoinFlips({ id }) {
    initSelectionPiles({ id, model: {
        itemName: 'Pair',
        sourceLabels: ['First coin', 'Second coin'],
        sourceText: (pair, i) => pair[i],
        titles: ['First coin is heads', 'At least one coin is heads'],
        columnLabels: ['Two heads', 'One head', 'Discarded'],
        emptyText: 'Each click adds one pair immediately to a column under each rule.',
        sample: () => [0, 1].map(() => Math.random() < 0.5 ? 'H' : 'T').join(''),
        selection: coinSelection,
        isTarget: pair => pair === 'HH',
        tileText: pair => pair,
        describe: pair => `first ${pair[0] === 'H' ? 'heads' : 'tails'}, second ${pair[1] === 'H' ? 'heads' : 'tails'}`
    }});
}
