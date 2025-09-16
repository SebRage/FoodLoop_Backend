import { PublicacionApplication } from "../../src/application/PublicacionApplication";

const makePublicacionPortMock = () => {
  let store: any = {};
  let nextId = 1;
  return {
    createPublicacion: async (p: any) => {
      const id = nextId++;
      store[id] = { ...p, id };
      return id;
    },
    getPublicacionById: async (id: number) => store[id] ?? null,
    updatePublicacion: async (id: number, p: any) => {
      if (!store[id]) return false;
      store[id] = { ...store[id], ...p };
      return true;
    },
    deletePublicacion: async (id: number) => {
      if (!store[id]) return false;
      store[id].estado = 0;
      return true;
    }
  };
};

describe('PublicacionApplication', () => {
  test('createPublicacion should return id', async () => {
    const port = makePublicacionPortMock();
    const app = new PublicacionApplication(port as any);
    const id = await app.createPublicacion({
      usuarioId: 1,
      categoriaId: 1,
      titulo: 'Prueba',
      descripcion: '...',
      tipo: 'Donacion',
      cantidad: '1',
      precio: 0,
      fechaCaducidad: new Date(),
      estado: 1,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });
    expect(typeof id).toBe('number');
  });
});
