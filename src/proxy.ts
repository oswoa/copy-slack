import { NextResponse, NextRequest } from "next/server";
import { AuthApiResponse } from "./app/api/auth/route";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";
import { ErrorDetail } from "./app/common/ErrorDetail";
import { GetChannelListApiResponse } from "./app/api/channels/route";
import { Logger } from "./app/common/util";
import { User } from "./model/User";

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup"],
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
    const baseUrl = request.nextUrl.origin;

    Logger.info(`proxy: ${referer} => ${dstPath}`);

    const redirectPath = ["/login", "/signup"];
    const isRedirected = redirectPath.some((path) => {
        return path === dstPath;
    });

    const authorizedUser = await confirmAuthorized(request);
    if (!authorizedUser) {
        if (isRedirected) {
            return NextResponse.next();
        }
        Logger.info("proxy: user UNAUTHORIZED. redirected to /login");
        return NextResponse.redirect(new URL("/login", request.url));
    } else {
        Logger.info("proxy: user AUTHORIZED");
    }

    const yourWorkspaceList = await getYourWorkspaceList(baseUrl, authorizedUser);
    if (yourWorkspaceList.length <= 0) {
        return NextResponse.redirect(new URL("/error", request.url));
    }

    if (isRedirected) {
        const targetWorkspaceId = yourWorkspaceList[0].workspaceId;
        const channelList = await getRelationedChannelList(baseUrl, targetWorkspaceId);
        if (channelList.length <= 0) {
            return NextResponse.redirect(new URL("/error", request.url));
        }

        Logger.info("proxy: redirected to your workspace");
        const targetChannelId = channelList[0].channelId;
        return NextResponse.redirect(
            new URL(`/workspace/${targetWorkspaceId}/${targetChannelId}`, request.url),
        );
    } else {
        const isDstPathYourWorkspace = yourWorkspaceList.some((workspace) =>
            dstPath.includes(workspace.workspaceId),
        );
        if (isDstPathYourWorkspace) {
            Logger.info("proxy: access AUTHRORIZED");
            return NextResponse.next();
        } else {
            Logger.info("proxy: access REJECTED. you can't access except for your workspaces");
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
}

const confirmAuthorized = async (request: NextRequest) => {
    try {
        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        const baseUrl = request.nextUrl.origin;

        // バックエンド間の通信はcookieが設定されないため、明示的に指定
        const res = await fetch(`${baseUrl}/api/auth`, {
            headers: {
                Cookie: `${token?.name}=${token?.value}; ${userId?.name}=${userId?.value}`,
            },
        });
        const data: AuthApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            return undefined;
        }
        return data.user;
    } catch (error) {
        Logger.error(error as string);
        return undefined;
    }
};

const getYourWorkspaceList = async (baseUrl: string, user: User) => {
    try {
        const res = await fetch(`${baseUrl}/api/workspaces?ownerId=${user.userId}`);
        const data: GetWorkspaceListApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            return [];
        }
        return data.workspaces;
    } catch (error) {
        Logger.error(error as string);
        return [];
    }
};

const getRelationedChannelList = async (baseUrl: string, worksapceId: string) => {
    try {
        const res = await fetch(`${baseUrl}/api/channels?workspaceId=${worksapceId}`);
        const data: GetChannelListApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            return [];
        }
        return data.channels;
    } catch (error) {
        Logger.error(error as string);
        return [];
    }
};
