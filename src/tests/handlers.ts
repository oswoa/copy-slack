import { UpdateUserApiRequest } from "@/app/api/users/[userId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SafeUser, UserProfile } from "@/app/context/CurrentUserContext";
import { HttpStatusCode } from "axios";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

const errorDetail = ErrorDetail.success();
const status = HttpStatusCode.Ok;

// ログアウトAPI
export const mockLogoutApi = vi.fn();

// ユーザ一覧取得API
export const mockGetUserListApi = vi.fn();

// ユーザ更新API
export const mockUpdateUserApi = vi.fn();

// ユーザプロフィール更新API
export const mockUpdateUserProfileApi = vi.fn();

// MSWモック一覧
export const handlers = [
    // ログアウトAPI
    http.post("/api/logout", () => {
        mockLogoutApi();
        return HttpResponse.json({ errorDetail }, { status });
    }),

    // ユーザ一覧取得API
    http.get("/api/users", async ({ request }) => {
        const url = new URL(request.url);
        const displayName = url.searchParams.get("displayName");
        const userList: SafeUser[] = [
            {
                userId: "user1",
                displayName: "ユーザ1",
            },
            {
                userId: "user2",
                displayName: "ユーザ2",
            },
            {
                userId: "user3",
                displayName: "ユーザ3",
            },
        ];
        mockGetUserListApi({ displayName });
        return HttpResponse.json({ userList, errorDetail }, { status });
    }),

    // ユーザ更新API
    http.patch<{ userId: string }, UpdateUserApiRequest>(
        "/api/users/:userId",
        async ({ params, request }) => {
            const { userId } = params;
            const data = await request.json();

            const user: UserProfile = {
                userId: userId,
                email: data?.email,
                displayName: data?.displayName,
            };
            mockUpdateUserApi({
                userId: user.userId,
                email: user.email,
                displayName: user.displayName,
            });
            return HttpResponse.json({ user, errorDetail }, { status });
        }
    ),

    // ユーザプロフィール画像更新API
    http.patch<{ userId: string }>("/api/users/:userId/profile", async ({ params, request }) => {
        const { userId } = params;
        const data = await request.formData();
        const file = data.get("file") as File;

        mockUpdateUserProfileApi({
            userId,
            name: file.name,
            type: file.type,
        });
        return HttpResponse.json({ imageUrl: "test.png", errorDetail }, { status });
    }),

    // Socket.io（単体テストには不要だが、ソケット通信自体もモック化しないとエラーがログに溢れるため）
    http.get("*/socket.io", () => {}),
];
