import { AuditoriaApplication } from '../../src/application/AuditoriaApplication';

describe('AuditoriaApplication', () => {
  it('should create an auditoria and return id', async () => {
    const mockPort: any = {
      createAuditoria: jest.fn().mockResolvedValue(42),
      getAuditoriaById: jest.fn().mockResolvedValue(null),
      getAllAuditorias: jest.fn().mockResolvedValue([]),
      updateAuditoria: jest.fn().mockResolvedValue(true),
      deleteAuditoria: jest.fn().mockResolvedValue(true),
    };

    const app = new AuditoriaApplication(mockPort);

    const id = await app.createAuditoria({
      usuarioId: 1,
      tablaAfectada: 'users',
      registroId: 10,
      accion: 'CREATE',
      descripcion: 'Creado',
      estado: 1,
      fecha: new Date(),
    });

    expect(id).toBe(42);
    expect(mockPort.createAuditoria).toHaveBeenCalled();
  });

  it('No actualizara una auditoria no existente', async () => {
    const mockPort: any = {
      getAuditoriaById: jest.fn().mockResolvedValue(null),
      updateAuditoria: jest.fn(),
    };
    const app = new AuditoriaApplication(mockPort);
    await expect(app.updateAuditoria(1, { descripcion: 'x' })).rejects.toThrow('Auditoría no encontrada');
  });

  it('Actualizara una auditoria existente', async () => {
    const mockAuditoria = { id: 1, accion: 'CREATE', descripcion: 'a', estado: 1, fecha: new Date() };
    const mockPort: any = {
      getAuditoriaById: jest.fn().mockResolvedValue(mockAuditoria),
      updateAuditoria: jest.fn().mockResolvedValue(true),
    };
    const app = new AuditoriaApplication(mockPort);
    const res = await app.updateAuditoria(1, { descripcion: 'updated' });
    expect(res).toBe(true);
    expect(mockPort.updateAuditoria).toHaveBeenCalledWith(1, { descripcion: 'updated' });
  });

  it('Eliminara una auditoria existente', async () => {
    const mockAuditoria = { id: 2, accion: 'DELETE', descripcion: 'd', estado: 1, fecha: new Date() };
    const mockPort: any = {
      getAuditoriaById: jest.fn().mockResolvedValue(mockAuditoria),
      deleteAuditoria: jest.fn().mockResolvedValue(true),
    };
    const app = new AuditoriaApplication(mockPort);
    const res = await app.deleteAuditoria(2);
    expect(res).toBe(true);
    expect(mockPort.deleteAuditoria).toHaveBeenCalledWith(2);
  });

  it('retornara una auditoria existente', async () => {
    const mockPort: any = {
      getAllAuditorias: jest.fn().mockResolvedValue([{ id: 1, accion: 'X', descripcion: 'y', estado: 1, fecha: new Date() }]),
    };
    const app = new AuditoriaApplication(mockPort);
    const list = await app.getAllAuditorias();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllAuditorias).toHaveBeenCalled();
  });

  it('retornara una auditoria por id', async () => {
    const mockPort: any = {
      getAuditoriaById: jest.fn().mockResolvedValue({ id: 5, accion: 'X', descripcion: 'y', estado: 1, fecha: new Date() }),
    };
    const app = new AuditoriaApplication(mockPort);
    const a = await app.getAuditoriaById(5);
    expect(a).not.toBeNull();
    expect(mockPort.getAuditoriaById).toHaveBeenCalledWith(5);
  });
});
