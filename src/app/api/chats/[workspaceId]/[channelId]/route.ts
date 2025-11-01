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

// APIレスポンス用
export type GetChatHistoriesApiResponse = {
    chatHistories?: ChatHistoryResponse[];
    errorDetail?: ErrorDetailResponse;
};

/**
 * チャット一覧取得API
 * @returns チャット一覧、エラー情報
 */
export async function GET(
    _: Request,
    { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let chatHistories: ChatHistoryResponse[] = [];

    try {
        const res = await fetch(`${BASE_URL}/chatHistories`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                const { workspaceId, channelId } = await params;
                const resData: ChatHistoryResponse[] = await res.json();

                chatHistories = resData.filter(
                    (chat) => chat.workspaceId === workspaceId && chat.channelId === channelId
                );
                break;

            case HttpStatusCode.NotFound:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_DOESNT_EXIST_CHAT_HISTORY,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_DOESNT_EXIST_CHAT_HISTORY(),
                };
                status = HttpStatusCode.NotFound;
                console.error(errorDetail);
                break;

            default:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_GET_CHAT_HISTORY,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_GET_CHAT_HISTORY(),
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
        return Response.json({ chatHistories, errorDetail }, { status });
    }
}
