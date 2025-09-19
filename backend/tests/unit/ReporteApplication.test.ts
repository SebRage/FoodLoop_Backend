import { ReporteApplication } from "../../src/application/ReporteApplication";

describe('ReporteApplication', () => {
  it('debería crear un reporte y devolver el id', async () => {
    const mockPort: any = {
      createReporte: jest.fn().mockResolvedValue(21),
      getReporteById: jest.fn().mockResolvedValue(null),
      getAllReportes: jest.fn().mockResolvedValue([]),
      updateReporte: jest.fn().mockResolvedValue(true),
      deleteReporte: jest.fn().mockResolvedValue(true),
    };

    const app = new ReporteApplication(mockPort);
    const id = await app.createReporte({ 
      publicacionId: 1,
      reportanteId: 2,
      descripcion: 'X',
      estado: 1,
      fechaReporte: new Date() } as any);
    expect(id).toBe(21);
    expect(mockPort.createReporte).toHaveBeenCalled();
  });

  it('No actualizará un reporte no existente', async () => {
    const mockPort: any = {
      getReporteById: jest.fn().mockResolvedValue(null),
      updateReporte: jest.fn(),
    };
    const app = new ReporteApplication(mockPort);
    await expect(app.updateReporte(1, { descripcion: 'x' })).rejects.toThrow('Reporte no encontrado');
  });

  it('Actualizara un reporte existente', async () => {
    const mockReporte = { id: 1, descripcion: 'Antes', estado: 1 };
    const mockPort: any = {
      getReporteById: jest.fn().mockResolvedValue(mockReporte),
      updateReporte: jest.fn().mockResolvedValue(true),
    };
    const app = new ReporteApplication(mockPort);
    const res = await app.updateReporte(1, { descripcion: 'Actualizado' });
    expect(res).toBe(true);
    expect(mockPort.updateReporte).toHaveBeenCalledWith(1, { descripcion: 'Actualizado' });
  });

  it('Eliminara un reporte existente', async () => {
    const mockReporte = { id: 2, descripcion: 'Temp', estado: 1 };
    const mockPort: any = {
      getReporteById: jest.fn().mockResolvedValue(mockReporte),
      deleteReporte: jest.fn().mockResolvedValue(true),
    };
    const app = new ReporteApplication(mockPort);
    const res = await app.deleteReporte(2);
    expect(res).toBe(true);
    expect(mockPort.deleteReporte).toHaveBeenCalledWith(2);
  });

  it('retornará reportes existentes', async () => {
    const mockPort: any = {
      getAllReportes: jest.fn().mockResolvedValue([{ id: 1, descripcion: 'X', estado: 1 }]),
    };
    const app = new ReporteApplication(mockPort);
    const list = await app.getAllReportes();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllReportes).toHaveBeenCalled();
  });

  it('retornará un reporte por id', async () => {
    const mockPort: any = {
      getReporteById: jest.fn().mockResolvedValue({ id: 5, descripcion: 'Y', estado: 1 }),
    };
    const app = new ReporteApplication(mockPort);
    const r = await app.getReporteById(5);
    expect(r).not.toBeNull();
    expect(mockPort.getReporteById).toHaveBeenCalledWith(5);
  });
});
