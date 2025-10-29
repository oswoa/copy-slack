import { NextResponse, NextRequest } from "next/server";
import { User } from "./app/common/User";
import { AuthApiResponse } from "./app/api/auth/route";
import { GetWorkspaceListApiResponse } from "./app/api/workspaces/route";

/**
 * 下記ページにアクセスする際、保持してるtokenと一致するユーザが存在すれば/workspaceに遷移させる
 * - /login
 * - /signup
 * - /
 *
 * 下記ページにアクセスする際、保持してるtokenと一致するユーザがいなければ/loginに遷移させる
 * - /worspace含め、配下
 */
export default async function proxy(request: NextRequest) {
    const referer = request.headers.get("referer");
    const accessPath = request.nextUrl.pathname;
    console.log(`middleware: ${referer} => ${accessPath}`);

    const authorizedUser = await getUserFromCookie(request);
    if (!authorizedUser) {
        if (accessPath.startsWith("/workspace")) {
            console.log("middleware: access rejected");
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }
    console.log("middleware: access authorized");

    const redirectToWorkspace = ["/login", "/signup", "/"];
    const isMatched = redirectToWorkspace.some((redirectPath) => {
        return redirectPath === accessPath;
    });

    if (isMatched) {
        const targetWorkspace = await getTargetWorkspace(request, authorizedUser);
        if (!targetWorkspace) {
            return NextResponse.redirect(new URL("/error", request.url));
        }
        return NextResponse.redirect(
            new URL(`/workspace/${targetWorkspace?.workspaceId}`, request.url)
        );
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup", "/"],
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

const getTargetWorkspace = async (request: NextRequest, user: User) => {
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/workspaces`);
    const data: GetWorkspaceListApiResponse = await res.json();
    return data.workspaces?.find((workspace) => workspace.userId === user.id);
};
