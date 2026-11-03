// Pure models shared by the illustrations and their probability checks.
export function birthdayProbabilities(students) {
    let distinct = 1;
    for (let i = 1; i < students; i++) distinct *= Math.max(0, (365 - i) / 365);
    return { yours: 1 - (364 / 365) ** (students - 1), any: 1 - distinct };
}

export function childFamilies(condition) {
    return Array.from({ length: 196 }, (_, i) => {
        const older = Math.floor(i / 14);
        const younger = i % 14;
        const included = condition === 'tuesday' ? older === 1 || younger === 1
            : condition === 'older-tuesday' ? older === 1 : true;
        const target = older < 7 && younger < 7;
        return { older, younger, included, target };
    });
}

export function montyGame(knowing, random = Math.random) {
    // By symmetry, always choosing door 0 is equivalent to a random initial choice.
    const car = Math.floor(random() * 3);
    const available = [1, 2].filter(door => !knowing || door !== car);
    const opened = available[Math.floor(random() * available.length)];
    return { included: opened !== car, stay: car === 0, switch: car === 3 - opened };
}
