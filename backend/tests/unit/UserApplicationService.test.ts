import { UserApplicationService } from "../../src/application/UserApplicationService";
import bcrypt from "bcryptjs";

const makeUserPortMock = () => {
  let store: any = {};
  let nextId = 1;
  return {
    createUser: async (user: any) => {
      const id = nextId++;
      store[id] = { ...user, id };
      return id;
    },
    getUserByEmail: async (email: string) => {
      const found = Object.values(store).find((u: any) => u.correo === email);
      return found ?? null;
    },
    getUserById: async (id: number) => store[id] ?? null,
    getAllUsers: async () => Object.values(store),
    updateUser: async (id: number, user: any) => {
      if (!store[id]) return false;
      store[id] = { ...store[id], ...user };
      return true;
    },
    deleteUser: async (id: number) => {
      if (!store[id]) return false;
      store[id].estado = 0;
      return true;
    }
  };
};

describe('UserApplicationService', () => {
  test('createUser should hash password and return id', async () => {
    const userPort = makeUserPortMock();
    const service = new UserApplicationService(userPort as any);

    const rawUser = {
      tipoEntidad: 'Individual',
      nombreEntidad: 'Test User',
      correo: 'test@example.com',
      telefono: '',
      ubicacion: '',
      direccion: '',
      password: 'pass1234',
      estado: 1,
    };

    const id = await service.createUser({ ...rawUser });
    expect(typeof id).toBe('number');

    const saved = await userPort.getUserById(id);
    expect(saved).not.toBeNull();
    expect(saved.password).not.toBe(rawUser.password);
    const match = await bcrypt.compare(rawUser.password, saved.password);
    expect(match).toBe(true);
  });

  test('login should return a token for valid credentials', async () => {
    const userPort = makeUserPortMock();
    const hashed = await bcrypt.hash('secret123', 10);
    const id = await userPort.createUser({
      tipoEntidad: 'Individual',
      nombreEntidad: 'Auth User',
      correo: 'auth@example.com',
      telefono: '',
      ubicacion: '',
      direccion: '',
      password: hashed,
      estado: 1,
    });

    const service = new UserApplicationService(userPort as any);
    const token = await service.login('auth@example.com', 'secret123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });
});
