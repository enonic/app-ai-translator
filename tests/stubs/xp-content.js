// Runtime stub for `/lib/xp/content` used by vitest. Tests that exercise
// content paths should mock these functions via vi.mock as needed.
const stub = {
  get: () => null,
  getType: () => null,
};

export default stub;
export const get = stub.get;
export const getType = stub.getType;
