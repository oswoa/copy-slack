export class ErrorDetail {
    private _errCode: string;
    private _errMsg: string;

    constructor(errCode: string, errMsg: string) {
        this._errCode = errCode;
        this._errMsg = errMsg;
    }

    static getErrorDetailFromJson(value: unknown): ErrorDetail | undefined {
        if (value == null || typeof value !== "object") {
            return undefined;
        }
        if (!("_errCode" in value) || typeof value._errCode !== "string") {
            return undefined;
        }
        if (!("_errMsg" in value) || typeof value._errMsg !== "string") {
            return undefined;
        }
        return new ErrorDetail(value._errCode, value._errMsg);
    }

    get errMsg(): string {
        return `${this._errCode}: ${this._errMsg}`;
    }
}

export const getErrorDetail = () => {};
