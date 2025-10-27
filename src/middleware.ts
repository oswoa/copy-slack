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
    console.log(`=> ${accessPath}`);

    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/auth`);
    const { user } = await res.json();

    const isAuthed = user != undefined;
    if (isAuthed) {
        console.log("middleware: access confirmed");
        const isMatched = moveToWorkspacePath.some((path) => accessPath === path);
        if (isMatched) {
            return NextResponse.redirect(new URL("/workspace", request.url));
        }
    } else {
        console.log("middleware: access rejected");
        if (accessPath.startsWith("/workspace")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/workspace/:path*", "/login", "/signup"],
};
