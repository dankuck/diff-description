const diffDescription = require('../index.js');
const assert = require('assert');
const {
    deepStrictEqual: equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('diffDescription', function () {

    describe('object changes', function () {

        it('describes simple object edits', function () {
            const before = {
                x: 1,
            };
            const after = {
                x: 2,
            };
            const desc = diffDescription(before, after);
            equal('x = 2', desc);
        });

        it('uses prefixes', function () {
            const before = {
                x: 1,
            };
            const after = {
                x: 2,
            };
            const desc = diffDescription(before, after, 'this');
            equal('this.x = 2', desc);
        });

        it('describes simple object additions', function () {
            const before = {
                x: 1,
            };
            const after = {
                x: 1,
                y: 2,
            };
            const desc = diffDescription(before, after);
            equal('y = 2', desc);
        });

        it('describes simple object deletions', function () {
            const before = {
                x: 1,
            };
            const after = {
            };
            const desc = diffDescription(before, after);
            equal('delete x', desc);
        });

        it('describes deep object edits', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                    y: {
                        z: 2,
                    },
                },
            };
            const desc = diffDescription(before, after);
            equal('x.y.z = 2', desc);
        });

        it('describes deep object additions', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                    y: {
                        z: 1,
                        a: 2,
                    },
                },
            };
            const desc = diffDescription(before, after);
            equal('x.y.a = 2', desc);
        });

        it('describes deep object deletions', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                    y: {
                    },
                },
            };
            const desc = diffDescription(before, after);
            equal('delete x.y.z', desc);
        });

        it('describes middle object edits', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                    y: 1,
                },
            };
            const desc = diffDescription(before, after);
            equal('x.y = 1', desc);
        });

        it('describes middle object additions', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                    y: {
                        z: 1,
                    },
                    a: 1,
                },
            };
            const desc = diffDescription(before, after);
            equal('x.a = 1', desc);
        });

        it('describes middle object deletions', function () {
            const before = {
                x: {
                    y: {
                        z: 1,
                    },
                },
            };
            const after = {
                x: {
                },
            };
            const desc = diffDescription(before, after);
            equal('delete x.y', desc);
        });
    });

    describe('array changes', function () {
        it('describes an array push', function () {
            const before = [1];
            const after = [1, 2];
            const desc = diffDescription(before, after);
            equal('push(2)', desc);
        });

        it('describes an array pop', function () {
            const before = [1, 2];
            const after = [1];
            const desc = diffDescription(before, after);
            equal('pop()', desc);
        });

        it('describes an array assignment at end', function () {
            const before = [1, 2];
            const after = [1, 3];
            const desc = diffDescription(before, after);
            equal('[1] = 3', desc);
        });

        it('describes an array assignment at start', function () {
            const before = [1, 2];
            const after = [0, 2];
            const desc = diffDescription(before, after);
            equal('[0] = 0', desc);
        });

        it.only('describes an array unshift', function () {
            const before = [1, 2];
            const after = [0, 1, 2];
            const desc = diffDescription(before, after);
            equal('unshift(0)', desc);
        });
    });

    describe('path looks like JS', function () {
        it('regular tokens');

        it('numeric fields');

        it('non-token alphabetic fields');
    });

    describe('values', function () {

        it('stringifies objects', function () {
            class X {};
            const before = {
            };
            const after = {
                x: new X(),
            };
            const desc = diffDescription(before, after);
            equal('x = <X>', desc);
        });

        it('stringifies objects with anonymous constructors', function () {
            const X = {};
            X.x = function () {};
            const before = {
            };
            const after = {
                x: new X.x(),
            };
            const desc = diffDescription(before, after);
            equal('x = <(anonymous class)>', desc);
        });

        it('stringifies built-in objects', function () {
            const before = {
            };
            const after = {
                x: new Date(),
            };
            const desc = diffDescription(before, after);
            equal('x = <Date>', desc);
        });

        it('stringifies strings', function () {
            const before = {
            };
            const after = {
                x: 'abc',
            };
            const desc = diffDescription(before, after);
            equal('x = "abc"', desc);
        });

        it('stringifies NaN', function () {
            const before = {
            };
            const after = {
                x: NaN,
            };
            const desc = diffDescription(before, after);
            equal('x = NaN', desc);
        });

        it('stringifies Infinity', function () {
            const before = {
            };
            const after = {
                x: Infinity,
            };
            const desc = diffDescription(before, after);
            equal('x = Infinity', desc);
        });

        it('stringifies a float', function () {
            const before = {
            };
            const after = {
                x: 0.2,
            };
            const desc = diffDescription(before, after);
            equal('x = 0.2', desc);
        });

        it('stringifes objects with a callback', function () {
            class X {};
            const before = {
            };
            const after = {
                x: new X(),
            };
            const desc = diffDescription(before, after, '', (constructor) => {
                if (constructor === X) {
                    return 'Xavier';
                } else {
                    return null;
                }
            });
            equal('x = <Xavier>', desc);
        });

        it('stringifes objects with a callback that returns null', function () {
            // it falls back to the default stringification
            class X {};
            const before = {
            };
            const after = {
                x: new X(),
            };
            const desc = diffDescription(before, after, '', (constructor) => null);
            equal('x = <X>', desc);
        });
    });
});
