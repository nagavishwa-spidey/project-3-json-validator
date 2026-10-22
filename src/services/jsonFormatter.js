/**
 * JSON Formatter Service
 * Provides JSON prettification, minification, key sorting, and YAML-like representation.
 */

/**
 * Prettify a JSON string with the specified indentation.
 * @param {string} jsonString - The JSON string to prettify.
 * @param {number} [indent=2] - Number of spaces for indentation.
 * @returns {string} The prettified JSON string.
 */
function prettify(jsonString, indent = 2) {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, indent);
}

/**
 * Minify a JSON string by removing all whitespace.
 * @param {string} jsonString - The JSON string to minify.
 * @returns {string} The minified JSON string.
 */
function minify(jsonString) {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
}

/**
 * Recursively sort all object keys alphabetically.
 * @param {*} value - The parsed JSON value.
 * @returns {*} The value with all object keys sorted.
 */
function sortKeysRecursive(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => sortKeysRecursive(item));
  }

  const sorted = {};
  const keys = Object.keys(value).sort();
  for (const key of keys) {
    sorted[key] = sortKeysRecursive(value[key]);
  }
  return sorted;
}

/**
 * Sort all keys in a JSON string alphabetically (recursive).
 * @param {string} jsonString - The JSON string.
 * @returns {string} JSON string with all keys sorted alphabetically.
 */
function sortKeys(jsonString) {
  const parsed = JSON.parse(jsonString);
  const sorted = sortKeysRecursive(parsed);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Convert a JSON value to a simplified YAML-like representation.
 * @param {*} value - The parsed JSON value.
 * @param {number} [indentLevel=0] - Current indentation level.
 * @returns {string} YAML-like string representation.
 */
function toYamlLikeValue(value, indentLevel = 0) {
  const indent = '  '.repeat(indentLevel);

  if (value === null) return 'null';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return `"${value}"`;

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const lines = value.map(item => {
      const itemStr = toYamlLikeValue(item, indentLevel + 1);
      if (typeof item === 'object' && item !== null) {
        return `${indent}- \n${itemStr}`;
      }
      return `${indent}- ${itemStr}`;
    });
    return lines.join('\n');
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const lines = keys.map(key => {
      const val = value[key];
      const valStr = toYamlLikeValue(val, indentLevel + 1);
      if (typeof val === 'object' && val !== null) {
        return `${indent}${key}:\n${valStr}`;
      }
      return `${indent}${key}: ${valStr}`;
    });
    return lines.join('\n');
  }

  return String(value);
}

/**
 * Convert a JSON string to a simplified YAML-like representation for display.
 * @param {string} jsonString - The JSON string to convert.
 * @returns {string} The YAML-like representation.
 */
function toYamlLike(jsonString) {
  const parsed = JSON.parse(jsonString);
  return toYamlLikeValue(parsed, 0);
}

module.exports = {
  prettify,
  minify,
  sortKeys,
  toYamlLike,
  sortKeysRecursive
};
