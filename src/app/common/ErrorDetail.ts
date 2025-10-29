import { z } from "zod";

// API -> frontのレスポンス用
export type ErrorDetailResponse = {
    errCode: string;
    errMsg: string;
};

// バリデーション用
const ErrorDetailSchema = z.object({
    errCode: z.string(),
    errMsg: z.string(),
});

export class ErrorDetail {
    private _errCode: string;
    private _errMsg: string;

    constructor(errCode: string, errMsg: string) {
        this._errCode = errCode;
        this._errMsg = errMsg;
    }

    static getFromJson(value: unknown): ErrorDetail | undefined {
        const parsedErrorDetail = ErrorDetailSchema.safeParse(value);
        if (!parsedErrorDetail.success) {
            return undefined;
        }
        const { errCode, errMsg } = parsedErrorDetail.data;
        return new ErrorDetail(errCode, errMsg);
    }

    get errMsg(): string {
        return `${this._errCode}: ${this._errMsg}`;
    }
}

export const getErrorDetail = () => {};
