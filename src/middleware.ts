import { NextResponse, NextRequest } from "next/server";

/**
 * 下記ページにアクセスする際、保持してるtokenと一致するユーザが存在すれば/workspaceに遷移させる
 * - /login
 * - /signup
 *
 * 下記ページにアクセスする際、保持してるtokenと一致するユーザがいなければ/loginに遷移させる
 * - /worspace含め、配下
 */
export default async function proxy(request: NextRequest) {
    const moveToWorkspacePath = ["/login", "/signup"];
    const accessPath = request.nextUrl.pathname;
    const referer = request.headers.get("referer");
    console.log(`middleware: ${referer} => ${accessPath}`);

    const baseUrl = request.nextUrl.origin;
    const token = request.cookies.get("token");
    const userId = request.cookies.get("userId");
    const res = await fetch(`${baseUrl}/api/auth`, {
        headers: {
            Cookie: `${token?.name}=${token?.value}; ${userId?.name}=${userId?.value}`,
        },
    });

    const { user } = await res.json();
    if (user) {
        console.log("middleware: access authorized");
        const isMatched = moveToWorkspacePath.some((path) => accessPath === path);
        if (isMatched) {
            return NextResponse.redirect(new URL("/workspace", request.url));
        }
    } else {
        if (accessPath.startsWith("/workspace")) {
            console.log("middleware: access rejected");
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup"],
};
