const arraySplices = require('../arraySplices.js');
const assert = require('assert');
const {
    deepStrictEqual: equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe.only('arraySplices', function () {

    it('one splice at start', function () {
        const splices = arraySplices(
            [1, 2],
            [0, 1, 2],
            0,
            0
        );
        equal([{at: 0, remove: 0, add: [0]}], splices);
    });

    it('one splice at end', function () {
        const splices = arraySplices(
            [1, 2],
            [1, 2, 3],
            0,
            0
        );
        equal(splices, [{at: 2, remove: 0, add: [3]}]);
    });
});
