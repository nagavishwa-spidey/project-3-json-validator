const { prettify, minify, sortKeys } = require('../src/services/jsonFormatter');

describe('JSON Formatter Service', () => {
  const sampleJson = '{"z":1,"a":2,"m":{"y":3,"b":4}}';

  test('prettify produces formatted output with indentation', () => {
    const res = prettify(sampleJson, 2);
    expect(res).toContain('\n');
    expect(res).toContain('  "z": 1');
  });

  test('minify produces compact single-line JSON', () => {
    const pretty = prettify(sampleJson, 4);
    const minified = minify(pretty);
    expect(minified).not.toContain('\n');
    expect(JSON.parse(minified)).toEqual(JSON.parse(sampleJson));
  });

  test('sortKeys sorts object keys alphabetically at all levels', () => {
    const res = sortKeys(sampleJson);
    const parsed = JSON.parse(res);
    const keys = Object.keys(parsed);
    expect(keys).toEqual(['a', 'm', 'z']);
    expect(Object.keys(parsed.m)).toEqual(['b', 'y']);
  });

  test('round-trip minify(prettify(x)) produces valid equivalent', () => {
    const res = minify(prettify(sampleJson));
    expect(JSON.parse(res)).toEqual(JSON.parse(sampleJson));
  });

  test('throws error on invalid JSON input', () => {
    expect(() => prettify('{bad json')).toThrow();
    expect(() => minify('{bad json')).toThrow();
  });
});
