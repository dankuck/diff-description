/**
 * Find the first index for which the two arrays do not match. Null if they
 * match entirely.
 *
 * @param  {array} before
 * @param  {array} after
 * @return {index|null}
 */
function findMismatch(before, after, matcher) {
    for (let k = 0; k < before.length || k < after.length; k++) {
        if (! matcher(before[k], after[k])) {
            return k;
        }
    }
    return null;
}

/**
 * Find the first pair of indexes for which the arrays match. Returns an array
 * of [beforeIndex, afterIndex, match], where beforeIndex is an index in
 * before, afterIndex is an index in after, and match is false if a match was
 * not found. If no match is found, beforeIndex and afterIndex will be whatever
 * the length of the arrays is.
 *
 * @param  {array} before
 * @param  {array} after
 * @return {[number, number, bool]}
 */
function findMatch(before, after, matcher) {
    for (let i = 0; i < before.length; i++) {
        for (let j = 0; j < after.length; j++) {
            if (matcher(before[i], after[j])) {
                return [i, j];
            }
        }
    }
    return [before.length, after.length];
}

const cacheMatcher = matcher => {
    const cache = new Map();
    return (a, b) => {
        if (cache.has(a) && cache.get(a).has(b)) {
            return cache.get(a).get(b);
        }

        if (cache.has(b) && cache.get(b).has(a)) {
            return cache.get(b).get(a);
        }

        const result = matcher(a, b);
        if (! cache.has(a)) {
            cache.set(a, new Map());
        }
        cache.get(a).set(b, result);
        return result;
    };
};

const defaultMatcher = (a, b) => a == b;

/**
 * See arraySplices, below
 * @param  {array} before
 * @param  {array} after
 * @param  {Function} matcher
 * @param  {number} afterStart
 * @return {array}
 */
function arraySplicesWorker(before, after, matcher, afterStart) {
    const mismatchStart = findMismatch(before, after, matcher);
    if (mismatchStart === null) {
        // No more mismatches were found
        return [];
    }
    if (mismatchStart !== 0) {
        // Simplify by skipping the matches, and starting this function over
        // with the mismatches at the beginning of the arrays
        return arraySplicesWorker(
            before.slice(mismatchStart),
            after.slice(mismatchStart),
            matcher,
            afterStart + mismatchStart
        );
    }
    // Now we know [0] in the two arrays is a mismatch. So we just need to find
    // out where the next match is. There might not be one, which is fine.
    const [i, j] = findMatch(before, after, matcher);
    const splice = {
        at: afterStart,
        remove: i,
        add: after.slice(0, j),
    };
    // After we find a splice, start the function over from the place where the
    // arrays match
    const moreSplices = arraySplicesWorker(
        before.slice(i),
        after.slice(j),
        matcher,
        afterStart + j,
    );
    return [splice].concat(moreSplices);
}

/**
 * Returns an array of objects that describe splices. Each object has
 * {at, remove, add}, such that this algorithm would change before into after:
 *
 * after = [...before]
 * after.splice(splice[0].at, splice[0].remove, ...splice[0].add)
 * after.splice(splice[1].at, splice[1].remove, ...splice[1].add)
 * // ...
 * after.splice(splice[n].at, splice[n].remove, ...splice[n].add)
 *
 * @param  {array} before
 * @param  {array} after
 * @param  {Function} matcher  Defaults to a function that compares using ==
 * @return {[array]}
 */
module.exports = function arraySplices(before, after, matcher = defaultMatcher) {
    return arraySplicesWorker(before, after, matcher, 0);
};

module.exports.cacheMatcher = cacheMatcher;
module.exports.defaultMatcher = defaultMatcher;
