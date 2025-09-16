import { CategoriaApplication } from "../../src/application/CategoriaApplication";

const makeCategoriaPortMock = () => {
  let store: any = {};
  let nextId = 1;
  return {
    createCategoria: async (cat: any) => {
      const id = nextId++;
      store[id] = { ...cat, id };
      return id;
    },
    getCategoriaById: async (id: number) => store[id] ?? null,
    updateCategoria: async (id: number, cat: any) => {
      if (!store[id]) return false;
      store[id] = { ...store[id], ...cat };
      return true;
    },
    deleteCategoria: async (id: number) => {
      if (!store[id]) return false;
      store[id].estado = 0;
      return true;
    }
  };
};

describe('CategoriaApplication', () => {
  test('createCategoria should return id', async () => {
    const port = makeCategoriaPortMock();
    const app = new CategoriaApplication(port as any);
    const id = await app.createCategoria({ nombre: 'Comida', estado: 1 });
    expect(typeof id).toBe('number');
  });

  test('updateCategoria should throw when not found', async () => {
    const port = makeCategoriaPortMock();
    const app = new CategoriaApplication(port as any);
    await expect(app.updateCategoria(999, { nombre: 'Nope' })).rejects.toThrow('Categoría no encontrada');
  });
});
