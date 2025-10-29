import { HttpStatusCode } from "axios";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIがDBから受け取る際の型
type WorkspaceResponse = {
    workspaceId: string;
    userId: string;
    workspaceName: string;
    channels: string[];
};

// APIレスポンス用
export type GetWorkspaceListApiResponse = {
    workspaces?: WorkspaceResponse[];
    errorDetail?: ErrorDetailResponse;
};

/**
 * ワークスペース一覧取得API
 * @returns ワークスペース一覧、エラー情報
 */
export async function GET() {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let workspaces: WorkspaceResponse[] = [];

    try {
        const res = await fetch(`${BASE_URL}/workspaces`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                workspaces = await res.json();
                break;

            case HttpStatusCode.NotFound:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_WORKSPACES_DOESNT_EXIST,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_WORKSPACES_DOESNT_EXIST(),
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
        return Response.json({ workspaces, errorDetail }, { status });
    }
}
