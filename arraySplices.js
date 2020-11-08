function findMismatch(before, after) {
    for (let k = 0; k < before.length || k < after.length; k++) {
        const match = before[k] == after[k];
        if (! match) {
            return k;
        }
    }
    return null;
}

function findMatch(before, after) {
    let i = 0, j = 0;
    for (i = 0; i <= before.length; i++) {
        for (j = 0; j <= after.length; j++) {
            let match = before[i] == after[j];
            if (match) {
                return [i, j, true];
            }
        }
    }
    return [i, j, false];
}

module.exports = function arraySplices(before, after, beforeStart, afterStart) {
    const mismatchStart = findMismatch(before, after);
    if (mismatchStart === null) {
        return [];
    }
    if (mismatchStart !== 0) {
        return arraySplices(
            before.slice(mismatchStart),
            after.slice(mismatchStart),
            beforeStart + mismatchStart,
            afterStart + mismatchStart
        );
    }
    let [i, j, match] = findMatch(before, after);
    const splice = {
        at: afterStart,
        remove: i,
        add: after.slice(0, j),
    };
    const moreSplices = arraySplices(
        before.slice(i + 1),
        after.slice(j + 1),
        beforeStart + i,
        afterStart + j
    );
    return [splice].concat(moreSplices);
}
