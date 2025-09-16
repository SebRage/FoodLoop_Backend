import { ReporteApplication } from "../../src/application/ReporteApplication";

const makeReportePortMock = () => {
  let store: any = {};
  let nextId = 1;
  return {
    createReporte: async (r: any) => {
      const id = nextId++;
      store[id] = { ...r, id };
      return id;
    },
    getReporteById: async (id: number) => store[id] ?? null,
    updateReporte: async (id: number, r: any) => {
      if (!store[id]) return false;
      store[id] = { ...store[id], ...r };
      return true;
    },
    deleteReporte: async (id: number) => {
      if (!store[id]) return false;
      store[id].estado = 0;
      return true;
    }
  };
};

describe('ReporteApplication', () => {
  test('createReporte should return id', async () => {
    const port = makeReportePortMock();
    const app = new ReporteApplication(port as any);
  const id = await app.createReporte({ publicacionId: 1, reportanteId: 2, descripcion: 'X', estado: 1, fechaReporte: new Date() });
    expect(typeof id).toBe('number');
  });
});
