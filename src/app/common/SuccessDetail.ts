export class SuccessDetail {
    private _code: string;
    private _msg: string;

    constructor(code: string, msg: string) {
        this._code = code;
        this._msg = msg;
    }

    /**
     * SuccessDetailが保持する成功メッセージ
     */
    get msg(): string {
        return `${this._code}: ${this._msg}`;
    }
}
