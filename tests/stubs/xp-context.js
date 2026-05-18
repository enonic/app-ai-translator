// Runtime stub for `/lib/xp/context` used by vitest. Tests that exercise
// context paths should mock these functions via vi.mock as needed.
const stub = {
  run: (_context, callback) => callback(),
  get: () => ({}),
};

export default stub;
export const run = stub.run;
export const get = stub.get;
