import { NextResponse, NextRequest } from "next/server";
import { AuthApiResponse } from "./app/api/auth/route";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";
import { User } from "@prisma/client";
import { ErrorDetail } from "./app/common/ErrorDetail";
import { GetChannelListApiResponse } from "./app/api/channels/route";

/**
 * 自分が所属するワークスペース以外へのアクセスは拒否する
 * また、アクセス先が下記の時、条件に応じて遷移先を変える
 *
 * - /worspace含め、配下
 * -- cookieから認証されたユーザであることが確認できなければ/loginに遷移
 *
 * - /login, /signup
 * -- ユーザが認証されている時、自分の/workspaceに遷移
 *
 */
export default async function proxy(request: NextRequest) {
    const referer = request.headers.get("referer");
    const accessPath = request.nextUrl.pathname;
    const baseUrl = request.nextUrl.origin;

    console.log(`middleware: ${referer} => ${accessPath}`);

    // ユーザが認証されているか
    const authorizedUser = await confirmAuthorized(request);
    if (!authorizedUser) {
        if (accessPath.startsWith("/workspace")) {
            console.log("middleware: access rejected");
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    const ownedWorkspaceList = await getOwnedWorkspaceList(baseUrl, authorizedUser);
    if (ownedWorkspaceList.length <= 0) {
        return NextResponse.redirect(new URL("/error", request.url));
    }
    const isAccessAuthorized = ownedWorkspaceList.some((workspace) =>
        accessPath.includes(workspace.workspaceId)
    );
    if (isAccessAuthorized) {
        console.log("middleware: access authorized");
        return NextResponse.next();
    }

    const redirectToWorkspacePath = ["/login", "/signup"];
    const isMatched = redirectToWorkspacePath.some((redirectPath) => {
        return redirectPath === accessPath;
    });
    if (isMatched) {
        console.log("middleware: redirected to your workspace");

        const targetWorkspaceId = ownedWorkspaceList[0].workspaceId;
        const channelList = await getOwnedChannelList(baseUrl, targetWorkspaceId);
        if (channelList.length <= 0) {
            return NextResponse.redirect(new URL("/error", request.url));
        }

        const targetChannelId = channelList[0].channelId;
        return NextResponse.redirect(
            new URL(`/workspace/${targetWorkspaceId}/${targetChannelId}`, request.url)
        );
    }

    console.log("middleware: access rejected");
    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup"],
};

const confirmAuthorized = async (request: NextRequest) => {
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
};

const getOwnedWorkspaceList = async (baseUrl: string, user: Omit<User, "password">) => {
    const res = await fetch(`${baseUrl}/api/workspaces?ownerId=${user.userId}`);
    const data: GetWorkspaceListApiResponse = await res.json();

    const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
    if (!errorDetail.success) {
        return [];
    }
    return data.workspaces;
};

const getOwnedChannelList = async (baseUrl: string, worksapceId: string) => {
    const res = await fetch(`${baseUrl}/api/channels?workspaceId=${worksapceId}`);
    const data: GetChannelListApiResponse = await res.json();

    const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
    if (!errorDetail.success) {
        return [];
    }
    return data.channels;
};
