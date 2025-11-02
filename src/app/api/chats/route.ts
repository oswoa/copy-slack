import { HttpStatusCode } from "axios";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIがDBから受け取る際の型
type ChatHistoryResponse = {
    id: string;
    workspaceId: string;
    channelId: string;
    userId: string;
    content: string;
    createdAt: Date;
};

// APIリクエスト用
export type RegisterChatApiRequest = {
    workspaceId: string;
    channelId: string;
    userId: string;
    content: string;
    createdAt: Date;
};

// APIレスポンス用
export type RegisterChatApiResponse = {
    chatHistory?: ChatHistoryResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * チャット登録API
 * @returns チャット、エラー情報
 */

export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Created;
    let errorDetail: ErrorDetailResponse | undefined;
    let chatHistory: ChatHistoryResponse | undefined;

    try {
        const req: RegisterChatApiRequest = await request.json();
        const jstDate = req.createdAt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        const res = await fetch(`${BASE_URL}/chatHistories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...req,
                createdAt: jstDate,
            }),
        });
        switch (res.status) {
            case HttpStatusCode.Created:
                chatHistory = await res.json();
                break;

            default:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_REGISTER_CHAT,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_REGISTER_CHAT(),
                };
                status = HttpStatusCode.InternalServerError;
                console.error(errorDetail);
                break;
        }
    } catch (_) {
        errorDetail = {
            errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
            errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
        };
        status = HttpStatusCode.InternalServerError;
        console.error(errorDetail);
    } finally {
        return Response.json({ chatHistory, errorDetail }, { status });
    }
}
