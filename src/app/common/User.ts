export class User {
    private _id: string;
    private _token: string;

    constructor(id: string, token: string) {
        this._id = id;
        this._token = token;
    }

    static getUserFromJson(value: unknown): User | undefined {
        if (value == null || typeof value !== "object") {
            return undefined;
        }
        if (!("_id" in value) || typeof value._id !== "string") {
            return undefined;
        }
        if (!("_token" in value) || typeof value._token !== "string") {
            return undefined;
        }
        return new User(value._id, value._token);
    }

    get id(): string {
        return this.id;
    }

    get token(): string {
        return this._token;
    }
}
