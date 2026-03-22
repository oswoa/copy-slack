import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { Logger } from "./util";
import { HttpStatusCode } from "axios";

// バリデーション用
const errorDetailSchema = z.object({
    _errCode: z.string(),
    _errMsg: z.string(),
    _status: z.number(),
    _success: z.boolean(),
});

export class ErrorDetail {
    private _errCode: string;
    private _errMsg: string;
    private _status: HttpStatusCode;
    private _success: boolean;

    constructor(errCode: string, errMsg: string, status: HttpStatusCode, success: boolean = false) {
        this._errCode = errCode;
        this._errMsg = errMsg;
        this._status = status;
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
     * ErrorDetailが保持するステータスコード
     */
    get status(): HttpStatusCode {
        return this._status;
    }

    /**
     * エラーが発生してない状況において、成功したことを示すErrorDetailを返す
     * @returns 正常終了を示すErrorDetail
     */
    static success(): ErrorDetail {
        return new ErrorDetail("", "", HttpStatusCode.Ok, true);
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
                ERROR_MESSAGES.ERROR_SERVER_FAILED_CONNECT_DB,
                HttpStatusCode.InternalServerError,
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            resErr = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_VALIDATION,
                ERROR_MESSAGES.ERROR_SERVER_VALIDATION,
                HttpStatusCode.BadRequest,
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2002":
                    resErr = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_ALREADY_REGISTERED_RECORDS,
                        ERROR_MESSAGES.ERROR_SERVER_ALREADY_REGISTERED_RECORDS,
                        HttpStatusCode.Conflict,
                    );
                    Logger.error(resErr.errMsg);
                    return resErr;

                case "P2021":
                case "P2022":
                case "P2025":
                    resErr = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_FAILED_GET_RECORDS,
                        ERROR_MESSAGES.ERROR_SERVER_FAILED_GET_RECORDS,
                        HttpStatusCode.InternalServerError,
                    );
                    Logger.error(resErr.errMsg);
                    return resErr;

                default:
                    break;
            }
        }

        resErr = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
            HttpStatusCode.InternalServerError,
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
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.Ok,
            );
            Logger.error(resErr.errMsg);
            return resErr;
        }

        const { _errCode, _errMsg, _status, _success } = parsedErrorDetail.data;
        return new ErrorDetail(_errCode, _errMsg, _status, _success);
    }
}
