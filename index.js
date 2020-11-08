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
    const {kind} = diff.item;
    console.log('item', diff.item);
    if (kind === 'N') {
        const path = pathString((diff.path || []).concat('push'), prefix);
        return path + '(' + valueString(diff.item.rhs, classStringifier) + ')';
    } else if (kind === 'D') {
        const path = pathString((diff.path || []).concat('pop'), prefix);
        return path + '()';
    // } else if (kind === UNSHIFT) {
    //     const path = pathString((diff.path || []).concat('unshift'), prefix);
    //     return path + '(' + valueString(diff.item.rhs, classStringifier) + ')';
    } else {
        console.error(diff);
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

function convertToArrayInsert(diffs, path, before, after) {
    const diffsByIndex = {};
    diffs.forEach(diff => {
        const path = diff.path || [];
        const index = Reflect.has(diff, 'index')
                ? diff.index
                : path[path.length - 1];
        diffsByIndex[index] = diff;
    });
    diffs = [...diffs];
    // DiffDeleted and DiffNew in an array diff always happen at the end.
    // There may be several DiffDeleted, or several DiffNew, but there will
    // never be both, because otherwise they would be assignments.
    // So to detect an insert, we only need to find the earliest DiffNew and
    // follow back to the earliest edit before that.
    const indexes = Object.keys(diffsByIndex).sort();
    const diffNews = indexes.filter(
        index => diffsByIndex[index].kind === 'A' && diffsByIndex[index].item.kind === 'N'
    );
    if (diffNews.length === 0) {
        return null;
    }
    const begin = indexes[0];
    const beforeArray = get(before, path);
    const afterArray = get(after, path);
    // Everything before `begin` matches. arraySplices will check if anything in the
    // remaining area matches.
    return arraySplices(
        beforeArray.slice(begin),
        afterArray.slice(begin),
        begin,
        begin,
        path
    );
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
    const groups = groupByPath(diffs)
        .map(group => {
            const arrayConverted = convertToArrayInsert(group.diffs, group.path, before, after);
            if (arrayConverted) {
                return arrayConverted;
            } else {
                return group.diffs;
            }
        });
    console.log(groups);
    // return diffs
    return groups
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
