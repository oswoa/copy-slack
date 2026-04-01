import { NextResponse, NextRequest } from "next/server";
import { AuthApiResponse } from "./app/api/auth/route";
import { ErrorDetail } from "./app/common/ErrorDetail";
import { Logger } from "./app/common/util";
import { ERROR_CODES } from "./app/constants/errorCodes";
import { ERROR_MESSAGES } from "./app/constants/errorMessages";
import { HttpStatusCode } from "axios";

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

    const redirectToWorkspacePath = ["/login", "/signup"];
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
        Logger.info("proxy: redirect to /login");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    Logger.info("proxy: user AUTHORIZED.");
    const expectedPath = `/workspace/${authResponse.workspaceId}/${authResponse.channelId}`;
    if (expectedPath === dstPath) {
        return NextResponse.next();
    } else {
        Logger.info("proxy: redirect to your workspace");
        return NextResponse.redirect(new URL(expectedPath, request.url));
    }
}

const confirmAuthorized = async (request: NextRequest): Promise<AuthApiResponse> => {
    try {
        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");

        // バックエンド間の通信はcookieが設定されないため、明示的に指定
        const baseUrl = request.nextUrl.origin;
        const apiResponse = await fetch(`${baseUrl}/api/auth`, {
            headers: {
                Cookie: `${token?.name}=${token?.value}; ${userId?.name}=${userId?.value}`,
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
