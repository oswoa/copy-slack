import { UpdateUserApiRequest } from "@/app/api/users/[userId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserProfile } from "@/app/context/CurrentUserContext";
import { HttpStatusCode } from "axios";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

const errorDetail = ErrorDetail.success();
const status = HttpStatusCode.Ok;

// ログアウトAPI
export const mockLogoutApi = vi.fn();

// ユーザプロフィール画像更新API
export const mockUpdateUserProfileImageApi = vi.fn();

// ユーザ更新API
export const mockUpdateUserApi = vi.fn();

// MSWモック一覧
export const handlers = [
    // ログアウトAPI
    http.post("/api/logout", () => {
        mockLogoutApi();
        return HttpResponse.json({ errorDetail }, { status });
    }),

    // ユーザプロフィール画像更新API
    http.patch<{ userId: string }>("/api/users/:userId/profile", async ({ params, request }) => {
        const { userId } = params;
        const data = await request.formData();
        const file = data.get("file") as File;

        mockUpdateUserProfileImageApi({
            userId,
            name: file.name,
            type: file.type,
        });
        return HttpResponse.json({ imageUrl: "test.png", errorDetail }, { status });
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

    // Socket.io（単体テストには不要だが、ソケット通信自体もモック化しないとエラーがログに溢れるため）
    http.get("*/socket.io", () => {}),
];
