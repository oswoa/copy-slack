export class User {
    private _id: string;
    private _email: string;
    private _token: string;

    constructor(id: string, email: string, token: string) {
        this._id = id;
        this._email = email;
        this._token = token;
    }

    static getUserFromJson(value: unknown): User | undefined {
        if (value == null || typeof value !== "object") {
            return undefined;
        }
        if (!("_id" in value) || typeof value._id !== "string") {
            return undefined;
        }
        if (!("_email" in value) || typeof value._email !== "string") {
            return undefined;
        }
        if (!("_token" in value) || typeof value._token !== "string") {
            return undefined;
        }
        return new User(value._id, value._email, value._token);
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
