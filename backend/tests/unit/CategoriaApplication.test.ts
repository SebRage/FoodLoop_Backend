import { CategoriaApplication } from "../../src/application/CategoriaApplication";

describe('CategoriaApplication', () => {
  it('debería crear una categoría y devolver el id', async () => {
    const mockPort: any = {
      createCategoria: jest.fn().mockResolvedValue(7),
      getCategoriaById: jest.fn().mockResolvedValue(null),
      getAllCategorias: jest.fn().mockResolvedValue([]),
      updateCategoria: jest.fn().mockResolvedValue(true),
      deleteCategoria: jest.fn().mockResolvedValue(true),
    };

    const app = new CategoriaApplication(mockPort);
    const id = await app.createCategoria({ 
      nombre: 'Alimentos',
      estado: 1 });
    expect(id).toBe(7);
    expect(mockPort.createCategoria).toHaveBeenCalled();
  });

  it('No actualizará una categoría no existente', async () => {
    const mockPort: any = {
      getCategoriaById: jest.fn().mockResolvedValue(null),
      updateCategoria: jest.fn(),
    };
    const app = new CategoriaApplication(mockPort);
    await expect(app.updateCategoria(1, { nombre: 'x' })).rejects.toThrow('Categoría no encontrada');
  });

  it('Actualizara una categoría existente', async () => {
    const mockCategoria = { id: 1, nombre: 'Antes', estado: 1 };
    const mockPort: any = {
      getCategoriaById: jest.fn().mockResolvedValue(mockCategoria),
      updateCategoria: jest.fn().mockResolvedValue(true),
    };
    const app = new CategoriaApplication(mockPort);
    const res = await app.updateCategoria(1, { nombre: 'Actualizado' });
    expect(res).toBe(true);
    expect(mockPort.updateCategoria).toHaveBeenCalledWith(1, { nombre: 'Actualizado' });
  });

  it('Eliminara una categoría existente', async () => {
    const mockCategoria = { id: 2, nombre: 'Temp', estado: 1 };
    const mockPort: any = {
      getCategoriaById: jest.fn().mockResolvedValue(mockCategoria),
      deleteCategoria: jest.fn().mockResolvedValue(true),
    };
    const app = new CategoriaApplication(mockPort);
    const res = await app.deleteCategoria(2);
    expect(res).toBe(true);
    expect(mockPort.deleteCategoria).toHaveBeenCalledWith(2);
  });

  it('retornará categorías existentes', async () => {
    const mockPort: any = {
      getAllCategorias: jest.fn().mockResolvedValue([{ id: 1, nombre: 'X', estado: 1 }]),
    };
    const app = new CategoriaApplication(mockPort);
    const list = await app.getAllCategorias();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllCategorias).toHaveBeenCalled();
  });

  it('retornará una categoría por id', async () => {
    const mockPort: any = {
      getCategoriaById: jest.fn().mockResolvedValue({ id: 5, nombre: 'Y', estado: 1 }),
    };
    const app = new CategoriaApplication(mockPort);
    const c = await app.getCategoriaById(5);
    expect(c).not.toBeNull();
    expect(mockPort.getCategoriaById).toHaveBeenCalledWith(5);
  });
});
