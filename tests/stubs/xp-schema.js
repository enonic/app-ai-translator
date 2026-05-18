// Runtime stub for `/lib/xp/schema` used by vitest. Tests that exercise
// schema paths should mock these functions via vi.mock as needed.
const stub = {
  getSchema: () => null,
  getComponent: () => null,
};

export default stub;
export const getSchema = stub.getSchema;
export const getComponent = stub.getComponent;
