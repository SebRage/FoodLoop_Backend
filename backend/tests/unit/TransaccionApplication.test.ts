import { TransaccionApplication } from "../../src/application/TransaccionApplication";

describe('TransaccionApplication', () => {
  it('debería crear una transacción y devolver el id', async () => {
    const mockPort: any = {
      createTransaccion: jest.fn().mockResolvedValue(31),
      getTransaccionById: jest.fn().mockResolvedValue(null),
      getAllTransacciones: jest.fn().mockResolvedValue([]),
      updateTransaccion: jest.fn().mockResolvedValue(true),
      deleteTransaccion: jest.fn().mockResolvedValue(true),
    };

    const app = new TransaccionApplication(mockPort);
    const id = await app.createTransaccion({
      publicacionId: 1,
      donanteVendedorId: 2,
      beneficiarioCompradorId: 3,
      estado: 1,
      fechaTransaccion: new Date(),
    } as any);

    expect(id).toBe(31);
    expect(mockPort.createTransaccion).toHaveBeenCalled();
  });

  it('No actualizará una transacción no existente', async () => {
    const mockPort: any = {
      getTransaccionById: jest.fn().mockResolvedValue(null),
      updateTransaccion: jest.fn(),
    };
    const app = new TransaccionApplication(mockPort);
    await expect(app.updateTransaccion(1, { estado: 2 })).rejects.toThrow('Transacción no encontrada');
  });

  it('Actualizara una transacción existente', async () => {
    const mockTransaccion = { id: 1, publicacionId: 1, donanteVendedorId: 2, beneficiarioCompradorId: 3, estado: 1 };
    const mockPort: any = {
      getTransaccionById: jest.fn().mockResolvedValue(mockTransaccion),
      updateTransaccion: jest.fn().mockResolvedValue(true),
    };
    const app = new TransaccionApplication(mockPort);
    const res = await app.updateTransaccion(1, { estado: 2 });
    expect(res).toBe(true);
    expect(mockPort.updateTransaccion).toHaveBeenCalledWith(1, { estado: 2 });
  });

  it('Eliminara una transacción existente', async () => {
    const mockTransaccion = { id: 2, publicacionId: 1, donanteVendedorId: 2, beneficiarioCompradorId: 3, estado: 1 };
    const mockPort: any = {
      getTransaccionById: jest.fn().mockResolvedValue(mockTransaccion),
      deleteTransaccion: jest.fn().mockResolvedValue(true),
    };
    const app = new TransaccionApplication(mockPort);
    const res = await app.deleteTransaccion(2);
    expect(res).toBe(true);
    expect(mockPort.deleteTransaccion).toHaveBeenCalledWith(2);
  });

  it('retornará transacciones existentes', async () => {
    const mockPort: any = {
      getAllTransacciones: jest.fn().mockResolvedValue([{ id: 1, publicacionId: 1, donanteVendedorId: 2, beneficiarioCompradorId: 3, estado: 1 }]),
    };
    const app = new TransaccionApplication(mockPort);
    const list = await app.getAllTransacciones();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllTransacciones).toHaveBeenCalled();
  });

  it('retornará una transacción por id', async () => {
    const mockPort: any = {
      getTransaccionById: jest.fn().mockResolvedValue({ id: 5, publicacionId: 2, donanteVendedorId: 3, beneficiarioCompradorId: 4, estado: 1 }),
    };
    const app = new TransaccionApplication(mockPort);
    const t = await app.getTransaccionById(5);
    expect(t).not.toBeNull();
    expect(mockPort.getTransaccionById).toHaveBeenCalledWith(5);
  });
});
