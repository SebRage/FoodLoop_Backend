import { User } from "../../domain/User";
import { User as UserDomain } from "../../domain/User";
import { UserPort } from "../../domain/UserPort";
import { UserEntity } from "../entities/UserEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class UserAdapter implements UserPort {
    private userRepository: Repository<UserEntity>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    // Convertir entidad de persistencia a dominio
    private toDomain(user: UserEntity): UserDomain {
        return {
            id: user.id_usuario,
            tipoEntidad: user.tipo_entidad,
            nombreEntidad: user.nombre_entidad,
            correo: user.correo,
            telefono: user.telefono,
            ubicacion: user.ubicacion,
            direccion: user.direccion,
            password: user.password,
            estado: user.estado,
            fechaRegistro: user.fecha_registro,
        };
    }

    // Convertir datos de dominio en entidad de persistencia
    private toEntity(user: Omit<User, "id">): UserEntity {
        const userEntity = new UserEntity();
        userEntity.tipo_entidad = user.tipoEntidad;
        userEntity.nombre_entidad = user.nombreEntidad;
        userEntity.correo = user.correo;
        userEntity.telefono = user.telefono ?? "";
        userEntity.ubicacion = user.ubicacion ?? "";
        userEntity.direccion = user.direccion ?? "";
        userEntity.password = user.password;
        userEntity.estado = user.estado;
        userEntity.fecha_registro = user.fechaRegistro ?? new Date();
        return userEntity;
    }

    async createUser(user: Omit<User, "id">): Promise<number> {
        try {
            const newUser = this.toEntity(user);
            const savedUser = await this.userRepository.save(newUser);
            return savedUser.id_usuario;
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            throw new Error("Error al crear el usuario");
        }
    }

    async getUserById(id: number): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { id_usuario: id },
            });
            return user ? this.toDomain(user) : null;
        } catch (error) {
            console.error("Error al buscar el usuario por id: ", error);
            throw new Error("Error al buscar el usuario por id");
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { correo: email },
            });
            return user ? this.toDomain(user) : null;
        } catch (error) {
            console.error("Error al buscar el usuario por email: ", error);
            throw new Error("Error al buscar el usuario por email");
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.find();
            return users.map(user => this.toDomain(user));
        } catch (error) {
            console.error("Error al buscar todos los usuarios: ", error);
            throw new Error("Error al buscar todos los usuarios");
        }
    }

    async updateUser(id: number, user: Partial<User>): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { id_usuario: id },
            });
            if (!existingUser) {
                throw new Error("Usuario no encontrado");
            }
            // Actualizamos las propiedades enviadas, manteniendo los valores existentes si son undefined
            Object.assign(existingUser, {
                tipo_entidad: user.tipoEntidad ?? existingUser.tipo_entidad,
                nombre_entidad: user.nombreEntidad ?? existingUser.nombre_entidad,
                correo: user.correo ?? existingUser.correo,
                telefono: user.telefono ?? existingUser.telefono,
                ubicacion: user.ubicacion ?? existingUser.ubicacion,
                direccion: user.direccion ?? existingUser.direccion,
                password: user.password ?? existingUser.password,
                estado: user.estado ?? existingUser.estado,
            });
            await this.userRepository.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error al actualizar usuario: ", error);
            throw new Error("Error al actualizar usuario");
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { id_usuario: id },
            });
            if (!existingUser) {
                throw new Error("Usuario no encontrado");
            }
            // Se actualiza el estado a 0 para marcar el usuario como eliminado
            Object.assign(existingUser, {
                estado: 0,
            });
            await this.userRepository.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error borrando usuario por id", error);
            throw new Error("Error borrando el usuario");
        }
    }
}