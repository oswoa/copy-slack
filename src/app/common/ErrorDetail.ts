import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ERROR_CODES } from "../contants/errorCodes";
import { ERROR_MESSAGES } from "../contants/errorMessages";
import { Logger } from "./util";

// バリデーション用
const errorDetailSchema = z.object({
    _errCode: z.string(),
    _errMsg: z.string(),
    _success: z.boolean(),
});

export class ErrorDetail {
    private _errCode: string;
    private _errMsg: string;
    private _success: boolean;

    constructor(errCode: string, errMsg: string, success: boolean = false) {
        this._errCode = errCode;
        this._errMsg = errMsg;
        this._success = success;
    }

    /**
     * エラーが発生しているか
     */
    get success(): boolean {
        return this._success;
    }

    /**
     * ErrorDetailが保持するエラーメッセージ
     */
    get errMsg(): string {
        return `${this._errCode}: ${this._errMsg}`;
    }

    /**
     * エラーが発生してない状況において、成功したことを示すErrorDetailを返す
     * @returns 正常終了を示すErrorDetail
     */
    static success(): ErrorDetail {
        return new ErrorDetail("", "", true);
    }

    /**
     * Prismaでエラーが発生した際、error情報をErrorDetailに変換して返す
     * @param error Prismaエラー
     * @returns Prismaエラーを変換したErrorDetail
     */
    static getFromPrismaError(error: unknown): ErrorDetail {
        let resErr: ErrorDetail | undefined;

        if (error instanceof Prisma.PrismaClientInitializationError) {
            resErr = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_FAILED_CONNECT_DB,
                ERROR_MESSAGES.ERROR_SERVER_FAILED_CONNECT_DB
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            resErr = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_VALIDATION,
                ERROR_MESSAGES.ERROR_SERVER_VALIDATION
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2002":
                    resErr = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_ALREADY_REGISTERED_RECORDS,
                        ERROR_MESSAGES.ERROR_SERVER_ALREADY_REGISTERED_RECORDS
                    );
                    Logger.error(resErr.errMsg);
                    return resErr;

                case "P2021":
                case "P2022":
                case "P2025":
                    resErr = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_FAILED_GET_RECORDS,
                        ERROR_MESSAGES.ERROR_SERVER_FAILED_GET_RECORDS
                    );
                    Logger.error(resErr.errMsg);
                    return resErr;

                default:
                    break;
            }
        }

        resErr = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN
        );
        Logger.error(resErr.errMsg);
        return resErr;
    }

    /**
     * APIレスポンスのJSONからErrorDetailを復元する
     * @param ErrorDetailのJSONデータ
     * @returns 変換されたErrorDetail
     */
    static getFromJson(value: unknown): ErrorDetail {
        const parsedErrorDetail = errorDetailSchema.safeParse(value);
        if (!parsedErrorDetail.success) {
            const resErr = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        const { _errCode, _errMsg, _success } = parsedErrorDetail.data;
        return new ErrorDetail(_errCode, _errMsg, _success);
    }
}
