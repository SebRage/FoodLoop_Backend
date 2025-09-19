import { UserApplicationService } from "../../src/application/UserApplicationService";

describe('UserApplicationService', () => {
  it('debería crear un usuario y devolver el id', async () => {
    const mockPort: any = {
      createUser: jest.fn().mockResolvedValue(101),
      getUserByEmail: jest.fn().mockResolvedValue(null),
      getAllUsers: jest.fn().mockResolvedValue([]),
      updateUser: jest.fn().mockResolvedValue(true),
      deleteUser: jest.fn().mockResolvedValue(true),
      getUserById: jest.fn().mockResolvedValue(null),
    };

    const app = new UserApplicationService(mockPort);

    const id = await app.createUser({
      tipoEntidad: 'Individual',
      nombreEntidad: 'Usuario Test',
      correo: 'user@test.com',
      telefono: '12345678',
      ubicacion: 'Ciudad',
      direccion: 'Calle 123',
      password: 'contrasena',
      estado: 1,
      fechaRegistro: new Date().toISOString(),
      publicaciones: [],
      reportes: [],
    } as any);

    expect(id).toBe(101);
    expect(mockPort.createUser).toHaveBeenCalled();
  });

  it('No actualizará un usuario no existente', async () => {
    const mockPort: any = {
      getUserById: jest.fn().mockResolvedValue(null),
      updateUser: jest.fn(),
    };
    const app = new UserApplicationService(mockPort);
    await expect(app.updateUser(1, { nombreEntidad: 'x' })).rejects.toThrow('Usuario no encontrado');
  });

  it('Actualizara un usuario existente', async () => {
    const mockUser = { id: 1, tipoEntidad: 'Individual', nombreEntidad: 'Antes', correo: 'a@b.com', password: 'x', estado: 1 };
    const mockPort: any = {
      getUserById: jest.fn().mockResolvedValue(mockUser),
      updateUser: jest.fn().mockResolvedValue(true),
    };
    const app = new UserApplicationService(mockPort);
    const res = await app.updateUser(1, { nombreEntidad: 'Actualizado' });
    expect(res).toBe(true);
    expect(mockPort.updateUser).toHaveBeenCalledWith(1, { nombreEntidad: 'Actualizado' });
  });

  it('Eliminara un usuario existente', async () => {
    const mockUser = { id: 2, tipoEntidad: 'Individual', nombreEntidad: 'Temp', correo: 't@example.com', password: 'x', estado: 1 };
    const mockPort: any = {
      getUserById: jest.fn().mockResolvedValue(mockUser),
      deleteUser: jest.fn().mockResolvedValue(true),
    };
    const app = new UserApplicationService(mockPort);
    const res = await app.deleteUserById(2);
    expect(res).toBe(true);
    expect(mockPort.deleteUser).toHaveBeenCalledWith(2);
  });

  it('retornará usuarios existentes', async () => {
    const mockPort: any = {
      getAllUsers: jest.fn().mockResolvedValue([{ id: 1, tipoEntidad: 'X', nombreEntidad: 'Y', correo: 'y@example.com', password: 'x', estado: 1 }]),
    };
    const app = new UserApplicationService(mockPort);
    const list = await app.getAllUsers();
    expect(list).toHaveLength(1);
    expect(mockPort.getAllUsers).toHaveBeenCalled();
  });

  it('retornará un usuario por id', async () => {
    const mockPort: any = {
      getUserById: jest.fn().mockResolvedValue({ id: 5, tipoEntidad: 'X', nombreEntidad: 'Y', correo: 'y@example.com', password: 'x', estado: 1 }),
    };
    const app = new UserApplicationService(mockPort);
    const u = await app.getUserById(5);
    expect(u).not.toBeNull();
    expect(mockPort.getUserById).toHaveBeenCalledWith(5);
  });
});
