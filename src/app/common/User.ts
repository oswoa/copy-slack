export class User {
    private _id: string;
    private _token: string;

    constructor(id: string, token: string) {
        this._id = id;
        this._token = token;
    }

    get id(): string {
        return this.id;
    }

    get token(): string {
        return this._token;
    }
}
