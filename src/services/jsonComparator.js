/**
 * JSON Comparator Service
 * Provides deep comparison of two JSON documents, identifying all differences.
 */

/**
 * Deep compare two parsed JSON values and return a list of differences.
 * @param {*} val1 - First value.
 * @param {*} val2 - Second value.
 * @param {string} [path=''] - Current JSON path.
 * @returns {Array<{ path: string, type: string, oldValue: *, newValue: * }>}
 */
function deepCompare(val1, val2, path = '') {
  const differences = [];

  // Handle null comparisons
  const type1 = val1 === null ? 'null' : Array.isArray(val1) ? 'array' : typeof val1;
  const type2 = val2 === null ? 'null' : Array.isArray(val2) ? 'array' : typeof val2;

  // Type change
  if (type1 !== type2) {
    differences.push({
      path: path || '/',
      type: 'type_changed',
      oldValue: val1,
      newValue: val2
    });
    return differences;
  }

  // Primitives (including null)
  if (type1 !== 'object' && type1 !== 'array') {
    if (val1 !== val2) {
      differences.push({
        path: path || '/',
        type: 'changed',
        oldValue: val1,
        newValue: val2
      });
    }
    return differences;
  }

  // Arrays
  if (type1 === 'array') {
    const maxLength = Math.max(val1.length, val2.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= val1.length) {
        differences.push({
          path: itemPath,
          type: 'added',
          oldValue: undefined,
          newValue: val2[i]
        });
      } else if (i >= val2.length) {
        differences.push({
          path: itemPath,
          type: 'removed',
          oldValue: val1[i],
          newValue: undefined
        });
      } else {
        const childDiffs = deepCompare(val1[i], val2[i], itemPath);
        differences.push(...childDiffs);
      }
    }
    return differences;
  }

  // Objects
  const allKeys = new Set([...Object.keys(val1), ...Object.keys(val2)]);

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key;
    const inVal1 = key in val1;
    const inVal2 = key in val2;

    if (inVal1 && !inVal2) {
      differences.push({
        path: keyPath,
        type: 'removed',
        oldValue: val1[key],
        newValue: undefined
      });
    } else if (!inVal1 && inVal2) {
      differences.push({
        path: keyPath,
        type: 'added',
        oldValue: undefined,
        newValue: val2[key]
      });
    } else {
      const childDiffs = deepCompare(val1[key], val2[key], keyPath);
      differences.push(...childDiffs);
    }
  }

  return differences;
}

/**
 * Compare two JSON strings and return the differences.
 * @param {string} json1String - First JSON string.
 * @param {string} json2String - Second JSON string.
 * @returns {{ identical: boolean, differences: Array<{ path: string, type: string, oldValue: *, newValue: * }> }}
 */
function compare(json1String, json2String) {
  const parsed1 = JSON.parse(json1String);
  const parsed2 = JSON.parse(json2String);

  const differences = deepCompare(parsed1, parsed2);

  return {
    identical: differences.length === 0,
    differences
  };
}

module.exports = {
  compare,
  deepCompare
};
