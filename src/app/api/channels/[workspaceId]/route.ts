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
export type GetChannelListApiResponse = {
    channels?: string[];
    errorDetail?: ErrorDetailResponse;
};

/**
 * チャネル一覧取得API
 * @returns チャネル一覧、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let channels: string[] | undefined;

    try {
        const { workspaceId } = await params;
        const res = await fetch(`${BASE_URL}/workspaces`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                const resData: WorkspaceResponse[] = await res.json();
                const targetWorkspace = resData?.find(
                    (workspace) => workspace.workspaceId === workspaceId
                );
                if (!targetWorkspace) {
                    errorDetail = {
                        errCode: ERROR_CODES.ERROR_SERVER_DOESNT_EXIST_USER_WORKSPACE,
                        errMsg: ERROR_MESSAGES.ERROR_SERVER_DOESNT_EXIST_USER_WORKSPACE(),
                    };
                    status = HttpStatusCode.NotFound;
                    console.error(errorDetail);
                    break;
                }
                channels = targetWorkspace?.channels;
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
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_GET_CHANNELS,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_GET_CHANNELS(),
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
        return Response.json({ channels, errorDetail }, { status });
    }
}
