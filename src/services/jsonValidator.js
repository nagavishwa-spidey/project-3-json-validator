/**
 * JSON Validator Service
 * Provides JSON syntax validation, JSON Schema validation, and JSON info extraction.
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { parseJsonError } = require('../utils/errorParser');

// Initialize Ajv with allErrors for comprehensive validation
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

/**
 * Validate JSON syntax.
 * @param {string} jsonString - The JSON string to validate.
 * @returns {{ valid: boolean, error: { message: string, line: number, column: number, position: number } | null }}
 */
function validateSyntax(jsonString) {
  if (typeof jsonString !== 'string') {
    return {
      valid: false,
      error: { message: 'Input must be a string', line: 1, column: 1, position: 0 }
    };
  }

  if (jsonString.trim() === '') {
    return {
      valid: false,
      error: { message: 'Input is empty', line: 1, column: 1, position: 0 }
    };
  }

  try {
    JSON.parse(jsonString);
    return { valid: true, error: null };
  } catch (err) {
    const enrichedError = parseJsonError(err, jsonString);
    return {
      valid: false,
      error: {
        message: enrichedError.message,
        line: enrichedError.line,
        column: enrichedError.column,
        position: enrichedError.position,
        context: enrichedError.context
      }
    };
  }
}

/**
 * Validate a JSON string against a JSON Schema (draft-07).
 * @param {string} jsonString - The JSON data string.
 * @param {string} schemaString - The JSON Schema string.
 * @returns {{ valid: boolean, errors: Array<{ path: string, message: string, keyword: string, params: object }> }}
 */
function validateSchema(jsonString, schemaString) {
  // Parse JSON data
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    const enrichedError = parseJsonError(err, jsonString);
    return {
      valid: false,
      errors: [{
        path: '',
        message: `Invalid JSON data: ${enrichedError.message}`,
        keyword: 'syntax',
        params: { line: enrichedError.line, column: enrichedError.column }
      }]
    };
  }

  // Parse Schema
  let schema;
  try {
    schema = JSON.parse(schemaString);
  } catch (err) {
    const enrichedError = parseJsonError(err, schemaString);
    return {
      valid: false,
      errors: [{
        path: '',
        message: `Invalid JSON Schema: ${enrichedError.message}`,
        keyword: 'syntax',
        params: { line: enrichedError.line, column: enrichedError.column }
      }]
    };
  }

  // Compile and validate schema
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (err) {
    return {
      valid: false,
      errors: [{
        path: '',
        message: `Schema compilation error: ${err.message}`,
        keyword: 'schema',
        params: {}
      }]
    };
  }

  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = validate.errors.map(err => ({
    path: err.instancePath || '/',
    message: err.message || 'Validation error',
    keyword: err.keyword,
    params: err.params || {}
  }));

  return { valid: false, errors };
}

/**
 * Calculate the maximum nesting depth of a JSON value.
 * @param {*} value - The parsed JSON value.
 * @returns {number} Maximum depth.
 */
function calculateDepth(value) {
  if (value === null || typeof value !== 'object') {
    return 0;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 1;
    let maxChildDepth = 0;
    for (const item of value) {
      const childDepth = calculateDepth(item);
      if (childDepth > maxChildDepth) maxChildDepth = childDepth;
    }
    return 1 + maxChildDepth;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) return 1;
  let maxChildDepth = 0;
  for (const key of keys) {
    const childDepth = calculateDepth(value[key]);
    if (childDepth > maxChildDepth) maxChildDepth = childDepth;
  }
  return 1 + maxChildDepth;
}

/**
 * Get metadata information about a JSON string.
 * @param {string} jsonString - The JSON string to analyze.
 * @returns {{ type: string, keys?: string[], length?: number, depth: number, size: number }}
 */
function getJsonInfo(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  const size = Buffer.byteLength(jsonString, 'utf8');
  const depth = calculateDepth(parsed);
  const type = parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed;

  const info = { type, depth, size };

  if (type === 'object') {
    info.keys = Object.keys(parsed);
  } else if (type === 'array') {
    info.length = parsed.length;
  }

  return info;
}

module.exports = {
  validateSyntax,
  validateSchema,
  getJsonInfo,
  calculateDepth
};
