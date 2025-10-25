import { NextResponse, NextRequest } from "next/server";
import { User } from "./app/common/User";

/**
 * /worspace含め、配下のページにアクセスする際、
 * 保持してるtokenと一致するユーザがいなければ/loginに遷移させる
 */
export default async function proxy(request: NextRequest) {
    const moveToWorkspacePath = ["/login", "/signup"];
    const accessPath = request.nextUrl.pathname;
    console.log(`=> ${accessPath}`);

    const isLogined = await confirmLogined(request);
    if (isLogined) {
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

const confirmLogined = async (request: NextRequest): Promise<boolean> => {
    const isTokenContained = request.cookies.has("token");
    const isUserIdContained = request.cookies.has("userId");
    if (!isTokenContained || !isUserIdContained) {
        return false;
    }

    const token = request.cookies.get("token");
    const userId = request.cookies.get("userId");
    if (token!.value.length === 0 || userId!.value.length === 0) {
        return false;
    }

    // 指定されたIDのユーザが保持するトークンとcookie内のトークンが一致するか確認
    const baseUrl = request.nextUrl.origin;
    const resData = await fetch(`${baseUrl}/api/users/${userId!.value}`);
    const resObj = await resData.json();

    const user = User.getUserFromJson(resObj.user);
    if (!user) {
        return false;
    }
    return user.token === token!.value;
};
