import jwt from "jsonwebtoken";
const JWT_KEY = "OWENMURCIADANIELBARRUETOANDRESAVILA";
export class AuthApplication {
    static generateToken(payload:object):string{
        return jwt.sign(payload, JWT_KEY, {expiresIn: "1h"});
    }

    static verifyToken(token:string):any{
        return jwt.verify(token, JWT_KEY);
    }
}   