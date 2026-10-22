/**
 * Error Parser Utility
 * Parses and enriches JSON error messages with line numbers, columns, and context snippets.
 */

/**
 * Get line and column number from a character position in text.
 * @param {string} text - The full text string.
 * @param {number} position - The character position (0-based).
 * @returns {{ line: number, column: number }} Line (1-based) and column (1-based).
 */
function getLineFromPosition(text, position) {
  if (!text || position < 0) {
    return { line: 1, column: 1 };
  }

  const clampedPos = Math.min(position, text.length);
  const lines = text.substring(0, clampedPos).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;

  return { line, column };
}

/**
 * Extract a context snippet around a given line.
 * @param {string} text - The full text string.
 * @param {number} line - The target line number (1-based).
 * @param {number} [contextLines=2] - Number of lines before and after to include.
 * @returns {string} The context snippet with line numbers.
 */
function getContextSnippet(text, line, contextLines = 2) {
  if (!text) return '';

  const lines = text.split('\n');
  const startLine = Math.max(1, line - contextLines);
  const endLine = Math.min(lines.length, line + contextLines);

  const snippet = [];
  for (let i = startLine; i <= endLine; i++) {
    const prefix = i === line ? '>> ' : '   ';
    const lineNum = String(i).padStart(4, ' ');
    snippet.push(`${prefix}${lineNum} | ${lines[i - 1]}`);
  }

  return snippet.join('\n');
}

/**
 * Parse a JSON syntax error and enrich it with line number, column, and context.
 * @param {Error} error - The error thrown by JSON.parse or similar.
 * @param {string} jsonString - The original JSON string that caused the error.
 * @returns {{ message: string, line: number, column: number, position: number, context: string }}
 */
function parseJsonError(error, jsonString) {
  const result = {
    message: error.message || 'Unknown error',
    line: 1,
    column: 1,
    position: 0,
    context: ''
  };

  // Try to extract position from the error message
  // Common patterns:
  // "Unexpected token X in JSON at position N"
  // "JSON.parse: ... at line N column M"
  // "Expected ... at position N"
  const positionMatch = error.message.match(/at position (\d+)/i);
  const lineColMatch = error.message.match(/line (\d+) column (\d+)/i);

  if (positionMatch) {
    result.position = parseInt(positionMatch[1], 10);
    const loc = getLineFromPosition(jsonString, result.position);
    result.line = loc.line;
    result.column = loc.column;
  } else if (lineColMatch) {
    result.line = parseInt(lineColMatch[1], 10);
    result.column = parseInt(lineColMatch[2], 10);
  }

  if (jsonString) {
    result.context = getContextSnippet(jsonString, result.line);
  }

  return result;
}

module.exports = {
  parseJsonError,
  getLineFromPosition,
  getContextSnippet
};
