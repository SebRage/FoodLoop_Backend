import { UserPort } from "../domain/UserPort";
import { User } from "../domain/User";
import { AuthApplication } from "./AuthApplication";
import bcrypt from "bcryptjs";

export class UserApplicationService {
    private port: UserPort;
    constructor(port: UserPort) {
        this.port = port;
    }

    async login(correo: string, password: string): Promise<string> {
        const existingUser = await this.port.getUserByEmail(correo);
        if (!existingUser) {
            throw new Error("Credentials are Invalid");
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            throw new Error("Credentials are Invalid");
        }
        const token = AuthApplication.generateToken({
            id: existingUser.id,
            email: existingUser.correo
        });
        return token;
    }

    async loginWithUserData(correo: string, password: string): Promise<{ token: string, user: User }> {
        const existingUser = await this.port.getUserByEmail(correo);
        if (!existingUser) {
            throw new Error("Credentials are Invalid");
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            throw new Error("Credentials are Invalid");
        }
        const token = AuthApplication.generateToken({
            id: existingUser.id,
            email: existingUser.correo
        });
        return { token, user: existingUser };
    }

    async createUser(user: Omit<User, "id">): Promise<number> {
        const existingUser = await this.port.getUserByEmail(user.correo);
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
            return this.port.createUser(user);
        }
        throw new Error("El usuario ya existe");
    }

    async updateUser(id: number, user: Partial<User>): Promise<boolean> {
        const existingUser = await this.port.getUserById(id);
        if (!existingUser) {
            throw new Error("Usuario no encontrado");
        }
        if (user.correo) {
            const emailTaken = await this.port.getUserByEmail(user.correo);
            if (emailTaken && emailTaken.id !== id) {
                throw new Error("Ese email ya está en uso");
            }
        }
        return await this.port.updateUser(id, user);
    }

    async deleteUserById(id: number): Promise<boolean> {
        const existingUser = await this.port.getUserById(id);
        if (!existingUser) {
            throw new Error("Usuario no encontrado");
        }
        return await this.port.deleteUser(id);
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.port.getUserById(id);
    }

    async getUserByEmail(correo: string): Promise<User | null> {
        return await this.port.getUserByEmail(correo);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.port.getAllUsers();
    }
}