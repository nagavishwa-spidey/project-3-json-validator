const { validateSyntax, validateSchema, getJsonInfo } = require('../src/services/jsonValidator');

describe('JSON Validator Service', () => {
  describe('validateSyntax()', () => {
    test('accepts valid JSON object', () => {
      const res = validateSyntax('{"name": "Alice", "age": 30}');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    test('accepts valid JSON array', () => {
      const res = validateSyntax('[1, 2, 3, "four"]');
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
    });

    test('rejects malformed JSON with syntax error', () => {
      const res = validateSyntax('{"name": "Alice", }');
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
      expect(res.error.message).toBeDefined();
    });

    test('rejects empty string', () => {
      const res = validateSyntax('');
      expect(res.valid).toBe(false);
      expect(res.error.message).toMatch(/empty/i);
    });

    test('rejects non-string input', () => {
      const res = validateSyntax(12345);
      expect(res.valid).toBe(false);
      expect(res.error.message).toMatch(/string/i);
    });
  });

  describe('validateSchema()', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number', minimum: 0 }
      },
      required: ['name', 'age']
    });

    test('validates valid data against schema', () => {
      const data = JSON.stringify({ name: 'Alice', age: 25 });
      const res = validateSchema(data, schema);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    test('returns errors when required property is missing', () => {
      const data = JSON.stringify({ name: 'Alice' });
      const res = validateSchema(data, schema);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(res.errors[0].keyword).toBe('required');
    });

    test('returns errors for wrong data type', () => {
      const data = JSON.stringify({ name: 'Alice', age: 'twenty-five' });
      const res = validateSchema(data, schema);
      expect(res.valid).toBe(false);
      expect(res.errors[0].keyword).toBe('type');
    });

    test('handles invalid schema JSON gracefully', () => {
      const data = JSON.stringify({ name: 'Alice' });
      const res = validateSchema(data, '{invalid-schema}');
      expect(res.valid).toBe(false);
    });
  });

  describe('getJsonInfo()', () => {
    test('extracts info for JSON object', () => {
      const json = JSON.stringify({ a: 1, b: 2, c: { d: 3 } });
      const info = getJsonInfo(json);
      expect(info.type).toBe('object');
      expect(info.keys).toEqual(['a', 'b', 'c']);
      expect(info.depth).toBe(2);
      expect(info.size).toBeGreaterThan(0);
    });

    test('extracts info for JSON array', () => {
      const json = JSON.stringify([1, [2, [3]]]);
      const info = getJsonInfo(json);
      expect(info.type).toBe('array');
      expect(info.length).toBe(2);
      expect(info.depth).toBe(3);
    });

    test('throws for invalid JSON', () => {
      expect(() => getJsonInfo('{invalid')).toThrow();
    });
  });
});
