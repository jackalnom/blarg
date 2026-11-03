import { initSelectionPiles } from './selection-piles.js';

export function sampleMontyComparison(random = Math.random) {
    // Both hosts get the same car location and the contestant always picks door 1.
    const car = Math.floor(random() * 3);
    const goats = [1, 2].filter(door => door !== car);
    const knowing = goats[Math.floor(random() * goats.length)];
    const unaware = 1 + Math.floor(random() * 2);
    return { car, opened: [knowing, unaware] };
}

export function montySelection(game) {
    return game.opened.map(door => door !== game.car);
}

export function initMontyPiles({ id }) {
    initSelectionPiles({ id, model: {
        itemName: 'Game',
        probabilityColumn: 1,
        sourceShape: 'door',
        sourceLabels: ['Door 1: picked', 'Door 2', 'Door 3'],
        sourceFontSize: 14,
        sourceText: (game, i) => game.car === i ? 'Car' : 'Goat',
        titles: ['Host knows where the car is', 'Host opens randomly'],
        columnLabels: ['Stay wins', 'Switch wins', 'Discarded'],
        emptyText: 'Play a game to compare both hosts.',
        sample: sampleMontyComparison,
        selection: montySelection,
        isTarget: game => game.car === 0,
        panelDetail: (game, i) => `Opens door ${game.opened[i] + 1} (${game.opened[i] === game.car ? 'car' : 'goat'})`,
        tileText: (game, i) => `D${game.opened[i] + 1}`,
        describe: game => `you picked door 1; car at door ${game.car + 1}. Knowing host opens door ${game.opened[0] + 1} (goat); random host opens door ${game.opened[1] + 1} (${game.opened[1] === game.car ? 'car' : 'goat'})`
    }});
}
