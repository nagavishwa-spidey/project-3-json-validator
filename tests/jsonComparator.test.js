const { compare } = require('../src/services/jsonComparator');

describe('JSON Comparator Service', () => {
  test('detects identical objects', () => {
    const json1 = JSON.stringify({ a: 1, b: "test" });
    const json2 = JSON.stringify({ b: "test", a: 1 });
    const res = compare(json1, json2);
    expect(res.identical).toBe(true);
    expect(res.differences).toHaveLength(0);
  });

  test('detects added keys', () => {
    const json1 = JSON.stringify({ a: 1 });
    const json2 = JSON.stringify({ a: 1, b: 2 });
    const res = compare(json1, json2);
    expect(res.identical).toBe(false);
    const added = res.differences.find(d => d.type === 'added');
    expect(added).toBeDefined();
  });

  test('detects removed keys', () => {
    const json1 = JSON.stringify({ a: 1, b: 2 });
    const json2 = JSON.stringify({ a: 1 });
    const res = compare(json1, json2);
    expect(res.identical).toBe(false);
    const removed = res.differences.find(d => d.type === 'removed');
    expect(removed).toBeDefined();
  });

  test('detects changed primitive values', () => {
    const json1 = JSON.stringify({ a: 1 });
    const json2 = JSON.stringify({ a: 2 });
    const res = compare(json1, json2);
    expect(res.identical).toBe(false);
    expect(res.differences[0].type).toBe('changed');
    expect(res.differences[0].oldValue).toBe(1);
    expect(res.differences[0].newValue).toBe(2);
  });

  test('detects type differences', () => {
    const json1 = JSON.stringify({ a: "100" });
    const json2 = JSON.stringify({ a: 100 });
    const res = compare(json1, json2);
    expect(res.identical).toBe(false);
    expect(res.differences[0].type).toBe('type_changed');
  });

  test('detects nested object differences', () => {
    const json1 = JSON.stringify({ user: { name: "Alice", score: 10 } });
    const json2 = JSON.stringify({ user: { name: "Alice", score: 20 } });
    const res = compare(json1, json2);
    expect(res.identical).toBe(false);
    expect(res.differences[0].path).toBe('user.score');
  });
});
