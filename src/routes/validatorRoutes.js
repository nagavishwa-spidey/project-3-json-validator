/**
 * Validator Routes
 * Defines all API endpoints for JSON validation, formatting, comparison, and info.
 */

const express = require('express');
const router = express.Router();

const { validateSyntax, validateSchema, getJsonInfo } = require('../services/jsonValidator');
const { prettify, minify, sortKeys, toYamlLike } = require('../services/jsonFormatter');
const { compare } = require('../services/jsonComparator');

/**
 * POST /api/validate
 * Validate JSON syntax.
 * Body: { json: string }
 */
router.post('/validate', (req, res) => {
  try {
    const { json } = req.body;

    if (json === undefined || json === null) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: json'
      });
    }

    const result = validateSyntax(json);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`
    });
  }
});

/**
 * POST /api/validate-schema
 * Validate JSON against a JSON Schema.
 * Body: { json: string, schema: string }
 */
router.post('/validate-schema', (req, res) => {
  try {
    const { json, schema } = req.body;

    if (!json || !schema) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: json, schema'
      });
    }

    const result = validateSchema(json, schema);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`
    });
  }
});

/**
 * POST /api/format
 * Format JSON (prettify, minify, sort-keys, or yaml-like).
 * Body: { json: string, action: string, indent?: number }
 */
router.post('/format', (req, res) => {
  try {
    const { json, action, indent } = req.body;

    if (!json) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: json'
      });
    }

    const validActions = ['prettify', 'minify', 'sort-keys', 'yaml'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    let result;
    switch (action) {
      case 'prettify':
        result = prettify(json, indent || 2);
        break;
      case 'minify':
        result = minify(json);
        break;
      case 'sort-keys':
        result = sortKeys(json);
        break;
      case 'yaml':
        result = toYamlLike(json);
        break;
    }

    return res.json({ success: true, result });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: `Format error: ${err.message}`
    });
  }
});

/**
 * POST /api/compare
 * Compare two JSON documents.
 * Body: { json1: string, json2: string }
 */
router.post('/compare', (req, res) => {
  try {
    const { json1, json2 } = req.body;

    if (!json1 || !json2) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: json1, json2'
      });
    }

    const result = compare(json1, json2);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: `Compare error: ${err.message}`
    });
  }
});

/**
 * POST /api/info
 * Get metadata about a JSON document.
 * Body: { json: string }
 */
router.post('/info', (req, res) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: json'
      });
    }

    const result = getJsonInfo(json);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: `Info error: ${err.message}`
    });
  }
});

module.exports = router;
