const deepDiff = require('deep-diff');
const arraySplices = require('./arraySplices');

const tokenRegexp = /^[a-z_][0-9a-z_]*$/i;

function pathString(path, prefix) {
    path = [...path];
    if (prefix) {
        path = [prefix].concat(path);
    }
    if (path.length === 0) {
        return '';
    }
    return path
        .map((part, i) => {
            if (!tokenRegexp.test(part)) {
                return '[' + part + ']';
            } else if (i === 0) {
                return part;
            } else {
                return '.' + part;
            }
        })
        .join('');
}

const defaultClassStringifier = (constructor) => (constructor.name || '(anonymous class)');

function valueString(value, classStringifier) {
    if (typeof value === 'object') {
        return '<' + (classStringifier(value.constructor) || defaultClassStringifier(value.constructor)) + '>';
    } else if (typeof value === 'string') {
        return JSON.stringify(value);
    } else {
        return value;
    }
}

function arrayDescription(diff, prefix, classStringifier) {
    const {lhs, rhs} = diff.item;
    const {at, remove, add} = diff.item.splice;
    if (at === 0 && remove == 0 && add.length === 1) {
        const path = pathString((diff.path || []).concat('unshift'), prefix);
        return path + '(' + valueString(add[0], classStringifier) + ')';
    } else if (at === 0 && remove === 1 && add.length === 0) {
        const path = pathString((diff.path || []).concat('shift'), prefix);
        return path + '()';
    } else if (at === lhs.length && remove === 0 && add.length === 1) {
        const path = pathString((diff.path || []).concat('push'), prefix);
        return path + '(' + valueString(add[0], classStringifier) + ')';
    } else if (at === lhs.length - 1 && remove === 1 && add.length === 0) {
        const path = pathString((diff.path || []).concat('pop'), prefix);
        return path + '()';
    } else {
        const path = pathString((diff.path || []).concat('splice'), prefix);
        const rest = ', ' + add
                .map(item => valueString(item, classStringifier))
                .join(', ');
        return path + '(' + at + ', ' + remove + (add.length === 0 ? '' : rest) + ')';
    }
}

function regularDescription(diff, prefix, classStringifier) {
    const path = pathString(diff.path || [], prefix);
    const {kind} = diff;
    if (kind === 'E' || kind === 'N') {
        return path + ' = ' + valueString(diff.rhs, classStringifier);
    } else if (kind === 'D') {
        return 'delete ' + path;
    } else {
        console.error('not found', diff);
    }
}

function groupByPath(diffs) {
    const groups = {};
    diffs.forEach(diff => {
        const path = [...(diff.path || [])];
        if (!isNaN(path[path.length - 1])) {
            path.pop();
        }
        const key = path.join('.');
        if (! groups[key]) {
            groups[key] = {path, diffs: []};
        }
        groups[key].diffs.push(diff);
    });
    return Object.values(groups);
}

function convertToArraySplices(diffs, path, before, after) {
    const diffNews = diffs.filter(
        diff => diff.kind === 'A' && ['N', 'D'].includes(diff.item.kind)
    );
    if (diffNews.length === 0) {
        return null;
    }
    const beforeArray = get(before, path);
    const afterArray = get(after, path);
    const splices = arraySplices(
        beforeArray,
        afterArray,
        arraySplices.cacheMatcher((a, b) => ! deepDiff(a, b))
    );
    let intermediate = before;
    return splices.map(splice => {
        const spliced = [...intermediate].splice(
            splice.at,
            splice.remove,
            ...splice.add
        );
        const diff = {
            kind: 'A',
            index: splice.at,
            path,
            item: {
                kind: SPLICE,
                splice,
                lhs: intermediate,
                rhs: spliced,
            },
        };
        intermediate = spliced;
        return diff;
    });
}

function get(object, path) {
    for (let field of path) {
        if (object) {
            object = object[field];
        } else {
            return undefined;
        }
    }
    return object;
}

const SPLICE = Symbol('SPLICE');

module.exports = function diffDescription(before, after, prefix = '', classStringifier = defaultClassStringifier) {
    const diffs = deepDiff(before, after) || [];
    return groupByPath(diffs)
        .map(group => {
            return convertToArraySplices(group.diffs, group.path, before, after)
                || group.diffs;
        })
        .flat()
        .map(diff => {
            if (diff.kind === 'A') {
                return arrayDescription(diff, prefix, classStringifier);
            } else {
                return regularDescription(diff, prefix, classStringifier);
            }
        })
        .join('; ');
};

module.exports.test = {
    arraySplices,
};
