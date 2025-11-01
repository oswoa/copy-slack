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
                    errCode: ERROR_CODES.ERROR_SERVER_DOESNT_EXIST_WORKSPACES,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_DOESNT_EXIST_WORKSPACES(),
                };
                status = HttpStatusCode.NotFound;
                console.error(errorDetail);
                break;

            default:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_GET_WORKSPACES,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_GET_WORKSPACES(),
                };
                status = HttpStatusCode.InternalServerError;
                console.error(errorDetail);
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

// APIリクエスト用
export type RegisterWorkspaceApiRequest = {
    workspaceId: string;
    userId: string;
    workspaceName: string;
    channels: string[];
};

// APIレスポンス用
export type RegisterWorkspaceApiResponse = {
    workspace?: WorkspaceResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ワークスペース登録API
 * @returns ワークスペース、エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Created;
    let errorDetail: ErrorDetailResponse | undefined;
    let workspace: WorkspaceResponse | undefined;

    try {
        const req: RegisterWorkspaceApiRequest = await request.json();
        const res = await fetch(`${BASE_URL}/workspaces`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...req }),
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
