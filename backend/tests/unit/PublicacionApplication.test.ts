import { PublicacionApplication } from "../../src/application/PublicacionApplication";

describe('PublicacionApplication', () => {
  it('debería crear una publicación y devolver el id', async () => {
    const mockPort: any = {
      createPublicacion: jest.fn().mockResolvedValue(11),
      getPublicacionById: jest.fn().mockResolvedValue(null),
      getAllPublicaciones: jest.fn().mockResolvedValue([]),
      updatePublicacion: jest.fn().mockResolvedValue(true),
      deletePublicacion: jest.fn().mockResolvedValue(true),
    };

    const app = new PublicacionApplication(mockPort);
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
    } as any);

    expect(id).toBe(11);
    expect(mockPort.createPublicacion).toHaveBeenCalled();
  });

  it('No actualizará una publicación no existente', async () => {
    const mockPort: any = {
      getPublicacionById: jest.fn().mockResolvedValue(null),
      updatePublicacion: jest.fn(),
    };
    const app = new PublicacionApplication(mockPort);
    await expect(app.updatePublicacion(1, { titulo: 'x' })).rejects.toThrow('Publicación no encontrada');
  });

  it('Actualizara una publicación existente', async () => {
    const mockPublicacion = { id: 1, titulo: 'Antes', estado: 1 };
    const mockPort: any = {
      getPublicacionById: jest.fn().mockResolvedValue(mockPublicacion),
      updatePublicacion: jest.fn().mockResolvedValue(true),
    };
    const app = new PublicacionApplication(mockPort);
    const res = await app.updatePublicacion(1, { titulo: 'Actualizado' });
    expect(res).toBe(true);
    expect(mockPort.updatePublicacion).toHaveBeenCalledWith(1, { titulo: 'Actualizado' });
  });

  it('Eliminara una publicación existente', async () => {
    const mockPublicacion = { id: 2, titulo: 'Temp', estado: 1 };
    const mockPort: any = {
      getPublicacionById: jest.fn().mockResolvedValue(mockPublicacion),
      deletePublicacion: jest.fn().mockResolvedValue(true),
    };
    const app = new PublicacionApplication(mockPort);
    const res = await app.deletePublicacion(2);
    expect(res).toBe(true);
    expect(mockPort.deletePublicacion).toHaveBeenCalledWith(2);
  });

  it('retornará publicaciones existentes', async () => {
    const mockPort: any = {
      getAllPublicaciones: jest.fn().mockResolvedValue([{ id: 1, titulo: 'X', estado: 1 }]),
    };
    const app = new PublicacionApplication(mockPort);
    const list = await app.getAllPublicaciones();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllPublicaciones).toHaveBeenCalled();
  });

  it('retornará una publicación por id', async () => {
    const mockPort: any = {
      getPublicacionById: jest.fn().mockResolvedValue({ id: 5, titulo: 'Y', estado: 1 }),
    };
    const app = new PublicacionApplication(mockPort);
    const p = await app.getPublicacionById(5);
    expect(p).not.toBeNull();
    expect(mockPort.getPublicacionById).toHaveBeenCalledWith(5);
  });
});
