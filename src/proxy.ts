import { NextResponse, NextRequest } from "next/server";
import { AuthApiResponse } from "./app/api/auth/route";
import { ErrorDetail } from "./app/common/ErrorDetail";
import { Logger } from "./app/common/util";
import { ERROR_CODES } from "./app/constants/errorCodes";
import { ERROR_MESSAGES } from "./app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { Workspace } from "./model/Workspace";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";
import { PageFactory } from "./app/constants/pageUrl";

export const config = {
    matcher: ["/login", "/signup", "/workspace/:path*"],
};

/**
 * ユーザが認証されているかどうかで遷移先を変え、
 * 自分が所属するワークスペース以外へのアクセスは拒否する
 *
 * - ユーザが認証されている時
 * -- /login, /signupへのアクセスは自分のワークスペースに遷移
 * -- 自分のワークスペースへはそのまま遷移
 *
 * - ユーザが認証されていない時
 * -- /loginへ遷移
 */

export default async function proxy(request: NextRequest) {
    const referer = request.headers.get("referer");
    const dstPath = request.nextUrl.pathname;
    Logger.info(`proxy: ${referer} => ${dstPath}`);

    const redirectToWorkspacePath = [PageFactory.GetLoginURL(), PageFactory.GetSignupURL()];
    const isRedirected = redirectToWorkspacePath.some((redirectPath) => {
        return redirectPath === dstPath;
    });

    const authResponse = await confirmAuthorized(request);
    const errorDetail = authResponse.errorDetail;

    if (!errorDetail.success) {
        Logger.info("proxy: user UNAUTHORIZED");
        if (isRedirected) {
            return NextResponse.next();
        }
        Logger.info(`proxy: redirect to ${PageFactory.GetLoginURL()}`);
        return NextResponse.redirect(new URL(PageFactory.GetLoginURL(), request.url));
    }

    Logger.info("proxy: user AUTHORIZED.");
    const yourWorkspaces = await getYourWorkspaces(request, authResponse.user!.userId);
    if (yourWorkspaces.length <= 0) {
        return NextResponse.redirect(new URL(PageFactory.GetErrorURL(), request.url));
    }

    if (yourWorkspaces.some((workspace) => dstPath.includes(workspace.workspaceId))) {
        return NextResponse.next();
    } else {
        Logger.info("proxy: redirect to your workspace");
        const expectedPath = PageFactory.GetWorkspaceURL(
            authResponse.workspaceId!,
            authResponse.channelId!,
        );
        return NextResponse.redirect(new URL(expectedPath, request.url));
    }
}

const confirmAuthorized = async (request: NextRequest): Promise<AuthApiResponse> => {
    try {
        const slackToken = request.cookies.get("slackToken");
        const userId = request.cookies.get("userId");

        // バックエンド間の通信はcookieが設定されないため、明示的に指定
        const baseUrl = request.nextUrl.origin;
        const apiResponse = await fetch(`${baseUrl}/api/auth`, {
            headers: {
                Cookie: `${slackToken?.name}=${slackToken?.value}; ${userId?.name}=${userId?.value}`,
            },
        });

        const data: AuthApiResponse = await apiResponse.json();
        const errorDetail = ErrorDetail.getFromJson(data.errorDetail);

        if (!errorDetail.success) {
            return { errorDetail };
        }

        return {
            user: data.user,
            workspaceId: data.workspaceId,
            channelId: data.channelId,
            errorDetail,
        };
    } catch (error) {
        Logger.error(error as string);
        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
            HttpStatusCode.Unauthorized,
        );
        return { errorDetail };
    }
};

const getYourWorkspaces = async (request: NextRequest, userId: string): Promise<Workspace[]> => {
    const baseUrl = request.nextUrl.origin;
    const apiResponse = await fetch(`${baseUrl}/api/workspaces?ownerId=${userId}`);
    const data: GetWorkspaceListApiResponse = await apiResponse.json();

    const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
    if (!errorDetail.success) {
        return [];
    }

    return data.workspaces.map((workspace) => {
        return new Workspace(workspace.workspaceId, workspace.ownerId, workspace.workspaceName);
    });
};
