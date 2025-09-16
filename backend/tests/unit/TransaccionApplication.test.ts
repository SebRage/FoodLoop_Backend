import { TransaccionApplication } from "../../src/application/TransaccionApplication";

const makeTransaccionPortMock = () => {
  let store: any = {};
  let nextId = 1;
  return {
    createTransaccion: async (t: any) => {
      const id = nextId++;
      store[id] = { ...t, id };
      return id;
    },
    getTransaccionById: async (id: number) => store[id] ?? null,
    updateTransaccion: async (id: number, t: any) => {
      if (!store[id]) return false;
      store[id] = { ...store[id], ...t };
      return true;
    },
    deleteTransaccion: async (id: number) => {
      if (!store[id]) return false;
      store[id].estado = 0;
      return true;
    }
  };
};

describe('TransaccionApplication', () => {
  test('createTransaccion should return id', async () => {
    const port = makeTransaccionPortMock();
    const app = new TransaccionApplication(port as any);
    const id = await app.createTransaccion({ publicacionId: 1, donanteVendedorId: 2, beneficiarioCompradorId: 3, estado: 1 });
    expect(typeof id).toBe('number');
  });
});
