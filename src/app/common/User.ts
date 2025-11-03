import { throwForMissingRequestStore } from "next/dist/server/app-render/work-unit-async-storage.external";
import { z } from "zod";

// バリデーション用
const UserSchema = z.object({
    id: z.string(),
    email: z.email(),
    token: z.string(),
});

export class User {
    private _id: string;
    private _email: string;
    private _token: string;

    constructor(id: string, email: string, token: string) {
        this._id = id;
        this._email = email;
        this._token = token;
    }

    static getFromJson(value: unknown): User | undefined {
        const parsedUser = UserSchema.safeParse(value);
        if (!parsedUser.success) {
            return undefined;
        }
        const { id, email, token } = parsedUser.data;
        return new User(id, email, token);
    }

    get id(): string {
        return this._id;
    }

    get email(): string {
        return this._email;
    }

    get token(): string {
        return this._token;
    }
}
