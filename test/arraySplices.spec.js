const arraySplices = require('../arraySplices.js');
const assert = require('assert');
const {
    deepStrictEqual: equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('arraySplices', function () {

    it('one splice at start', function () {
        const splices = arraySplices(
            [1, 2],
            [0, 1, 2]
        );
        equal([{at: 0, remove: 0, add: [0]}], splices);
    });

    it('one splice at end', function () {
        const splices = arraySplices(
            [1, 2],
            [1, 2, 3]
        );
        equal(splices, [{at: 2, remove: 0, add: [3]}]);
    });

    it('one splice at middle', function () {
        const splices = arraySplices(
            [1, 2],
            [1, 1.5, 2]
        );
        equal(splices, [{at: 1, remove: 0, add: [1.5]}]);
    });

    it('two splices at beginning and end', function () {
        const splices = arraySplices(
            [1, 2],
            [0, 1, 2, 3]
        );
        equal(splices, [
            {at: 0, remove: 0, add: [0]},
            {at: 3, remove: 0, add: [3]},
        ]);
    });

    it('long splices at beginning, middle, and end', function () {
        const splices = arraySplices(
            [1, 2],
            ['a', 'b', 'c', 1, 'x', 'y', 'z', 2, 'you', 'and', 'me']
        );
        equal(splices, [
            {at: 0, remove: 0, add: ['a', 'b', 'c']},
            {at: 4, remove: 0, add: ['x', 'y', 'z']},
            {at: 8, remove: 0, add: ['you', 'and', 'me']},
        ]);
    });

    it('splices-out at beginning', function () {
        const splices = arraySplices(
            [0, 1, 2],
            [1, 2]
        );
        equal([{at: 0, remove: 1, add: []}], splices);
    });

    it('splices-out at end', function () {
        const splices = arraySplices(
            [1, 2, 3],
            [1, 2]
        );
        equal([{at: 2, remove: 1, add: []}], splices);
    });

    it('splices-out at middle', function () {
        const splices = arraySplices(
            [1, 1.5, 2],
            [1, 2]
        );
        equal([{at: 1, remove: 1, add: []}], splices);
    });

    it('splices-out at beginning, middle, and end', function () {
        const splices = arraySplices(
            [0, 1, 1.5, 2, 3],
            [1, 2]
        );
        equal([
            {at: 0, remove: 1, add: []},
            {at: 1, remove: 1, add: []},
            {at: 2, remove: 1, add: []},
        ], splices);
    });

    it('long splices-out at beginning, middle, and end', function () {
        const splices = arraySplices(
            ['a', 'b', 'c', 1, 'x', 'y', 'z', 2, 'you', 'and', 'me'],
            [1, 2]
        );
        equal([
            {at: 0, remove: 3, add: []},
            {at: 1, remove: 3, add: []},
            {at: 2, remove: 3, add: []},
        ], splices);
    });

    it('splice-out and in at start', function () {
        const splices = arraySplices(
            [1, 2],
            [-1, 2]
        );
        equal([{at: 0, remove: 1, add: [-1]}], splices);
    });

    it('long splice-out and in at start', function () {
        const splices = arraySplices(
            [1, 2, 3, 4, 5, 6, 7],
            [-1, -2, -3, 4, 5, 6, 7]
        );
        equal([{at: 0, remove: 3, add: [-1, -2, -3]}], splices);
    });

    it('defaults the start params', function () {
        const splices = arraySplices(
            [1, 2],
            [0, 1, 2]
        );
        equal([{at: 0, remove: 0, add: [0]}], splices);
    });

    it('uses a special matcher', function () {
        const splices = arraySplices(
            ['a1', 'b1'],
            ['c2', 'a2', 'b2'],
            // A matcher that only compares the first character:
            (a, b) => a[0] == b[0]
        );
        equal([{at: 0, remove: 0, add: ['c2']}], splices);
    });

    it('uses a caching matcher', function () {
        let calls = 0;
        const splices = arraySplices(
            [1, 2],
            [0, 1, 2],
            arraySplices.cacheMatcher((a, b) => {
                calls ++;
                return a == b;
            })
        );
        // Normally, there'd be these comparisons
        // 1 == 0 in findMismatch
        // 1 == 0 in findMatch, duplicate
        // 1 == 1 in findMatch
        // 1 == 1 in findMismatch, duplicate
        // 2 == 2 in findMismatch
        // By caching we cut out the two duplicates, leaving 3 calls to our
        // (potentially expensive) matcher.
        equal(calls, 3);
    });
});
