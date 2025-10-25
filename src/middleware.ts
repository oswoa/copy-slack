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
    const isContained = request.cookies.has("token");
    if (!isContained) {
        return false;
    }

    const token = request.cookies.get("token");
    if (token!.value.length === 0) {
        return false;
    }

    const baseUrl = request.nextUrl.origin;
    const resData = await fetch(`${baseUrl}/api/users`);
    const resObj = await resData.json();

    const array: [] = resObj.userList;
    const userList: (User | undefined)[] = array.map((user) => User.getUserFromJson(user));
    return userList.some((user) => user!.token === token?.value);
};
