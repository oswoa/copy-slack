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
                    errCode: ERROR_CODES.ERROR_SERVER_CHAT_HISTORY_DOESNT_EXIST,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_CHAT_HISTORY_DOESNT_EXIST(),
                };
                status = HttpStatusCode.NotFound;
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

/*
// APIレスポンス用
export type RegisterChannelApiResponse = {
    channel?: ChannelResponse;
    errorDetail?: ErrorDetailResponse;
};
*/

/**
 * チャット登録API
 * @returns チャネル、エラー情報
 */
/*
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Created;
    let errorDetail: ErrorDetailResponse | undefined;
    let workspace: WorkspaceResponse | undefined;

    try {
        const req = await request.json();
        const res = await fetch(`${BASE_URL}/workspaces`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });
        switch (res.status) {
            case HttpStatusCode.Created:
                workspace = await res.json();
                break;

            default:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_REGISTER_WORKSPACE,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_REGISTER_WORKSPACE(),
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
        return Response.json({ workspace, errorDetail }, { status });
    }
}
*/
