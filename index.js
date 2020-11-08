const deepDiff = require('deep-diff');

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
    if (kind === 'N') {
        const path = pathString((diff.path || []).concat('push'), prefix);
        return path + '(' + valueString(diff.item.rhs, classStringifier) + ')';
    } else if (kind === 'D') {
        const path = pathString((diff.path || []).concat('pop'), prefix);
        return path + '()';
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
        console.error(diff);
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

function convertToArrayInsert(diffs) {
    diffs = [...diffs];
    const arrayDiffs = diffs.filter(diff => diff.kind === 'A');
    arrayDiffs.forEach(arrayDiff => {
        diffs = diffs.filter(diff => diff !== arrayDiff);
        const {index} = arrayDiff;
        let n = index;
        // const
    });

}

module.exports = function diffDescription(before, after, prefix = '', classStringifier = defaultClassStringifier) {
    const diffs = deepDiff(before, after) || [];
    console.log(
    groupByPath(diffs)
        .map(group => {
            const arrayConverted = convertToArrayInsert(group.diffs);
            if (arrayConverted) {
                return arrayConverted;
            } else {
                return group.diffs;
            }
        })
    );
        // .flat()
    return diffs
        .map(diff => {
    console.log(diff);
            // if (diff.kind === 'A') {
            //     return arrayDescription(diff, prefix, classStringifier);
            // } else {
                return regularDescription(diff, prefix, classStringifier);
            // }
        })
        .join('; ');
};
