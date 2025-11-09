import { NextResponse, NextRequest } from "next/server";
import { AuthApiResponse } from "./app/api/auth/route";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";
import { User } from "@prisma/client";

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

    const ownedWorkspaces = await getOwnedWorkspaces(baseUrl, authorizedUser);
    if (!ownedWorkspaces) {
        return NextResponse.redirect(new URL("/error", request.url));
    }
    const isAccessAuthorized = ownedWorkspaces.some((workspace) =>
        accessPath.includes(workspace.workspaceId)
    );
    if (isAccessAuthorized) {
        console.log("middleware: access authorized");
        return NextResponse.next();
    }

    const redirectToWorkspace = ["/login", "/signup"];
    const isMatched = redirectToWorkspace.some((redirectPath) => {
        return redirectPath === accessPath;
    });
    if (isMatched) {
        console.log("middleware: redirected to your workspace");
        return NextResponse.redirect(
            new URL(`/workspace/${ownedWorkspaces[0]?.workspaceId}/general`, request.url)
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
    const authData: AuthApiResponse = await res.json();
    return authData.user;
};

const getOwnedWorkspaces = async (baseUrl: string, user: Omit<User, "password">) => {
    const res = await fetch(`${baseUrl}/api/workspaces?ownerId=${user.userId}`);
    const data: GetWorkspaceListApiResponse = await res.json();
    return data.workspaces;
};
