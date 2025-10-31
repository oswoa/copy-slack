import { NextResponse, NextRequest } from "next/server";
import { User } from "./app/common/User";
import { AuthApiResponse } from "./app/api/auth/route";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";

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
    console.log(`middleware: ${referer} => ${accessPath}`);

    // ユーザが認証されているか
    const authorizedUser = await getUserFromCookie(request);
    if (!authorizedUser) {
        if (accessPath.startsWith("/workspace")) {
            console.log("middleware: access rejected");
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // アクセス先が自分が所属するワークスペースか
    const userWorkspaces = await getUserWorkspaces(request, authorizedUser);
    if (!userWorkspaces) {
        return NextResponse.redirect(new URL("/error", request.url));
    }
    const isAccessAuthorized = userWorkspaces.some((workspace) =>
        accessPath.includes(workspace.workspaceId)
    );
    if (!isAccessAuthorized) {
        // アクセス先がログイン、サインアップか
        const redirectToWorkspace = ["/login", "/signup"];
        const isMatched = redirectToWorkspace.some((redirectPath) => {
            return redirectPath === accessPath;
        });
        if (isMatched) {
            console.log("middleware: access authorized");
            return NextResponse.redirect(
                new URL(`/workspace/${userWorkspaces[0]?.workspaceId}/general`, request.url)
            );
        }

        console.log("middleware: access rejected");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log("middleware: access authorized");
    return NextResponse.next();
}

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup"],
};

const getUserFromCookie = async (request: NextRequest) => {
    const token = request.cookies.get("token");
    const userId = request.cookies.get("userId");
    const baseUrl = request.nextUrl.origin;

    const res = await fetch(`${baseUrl}/api/auth`, {
        headers: {
            Cookie: `${token?.name}=${token?.value}; ${userId?.name}=${userId?.value}`,
        },
    });
    const authData: AuthApiResponse = await res.json();

    return User.getFromJson(authData.user);
};

const getUserWorkspaces = async (request: NextRequest, user: User) => {
    const baseUrl = request.nextUrl.origin;

    const res = await fetch(`${baseUrl}/api/workspaces`);
    const data: GetWorkspaceListApiResponse = await res.json();

    return data.workspaces?.filter((workspace) => workspace.userId === user.id);
};
