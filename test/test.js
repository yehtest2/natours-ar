const ab = require('./testfu.js');

test('sum', () => {
  expect(ab.a(1, 2)).toBe(3);
});
