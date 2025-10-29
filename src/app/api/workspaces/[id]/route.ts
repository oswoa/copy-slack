import { HttpStatusCode } from "axios";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIがDBから受け取る際の型
type WorkspaceResponse = {
    id: string;
    userId: string;
    workspaceName: string;
    channels: string[];
};

// APIレスポンス用
export type GetWorkspaceApiResponse = {
    workspace?: WorkspaceResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ワークスペース取得API
 * @returns ワークスペース一覧、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let workspace: WorkspaceResponse | undefined;

    try {
        const { id } = await params;
        const res = await fetch(`${BASE_URL}/workspaces/${id}`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                workspace = await res.json();
                break;

            case HttpStatusCode.NotFound:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_CLIENT_WORKSPACE_DOESNT_EXIST,
                    errMsg: ERROR_MESSAGES.ERROR_CLIENT_WORKSPACE_DOESNT_EXIST(),
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
        return Response.json({ workspace, errorDetail }, { status });
    }
}
