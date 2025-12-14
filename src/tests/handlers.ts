import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

const success = ErrorDetail.success();

// ユーザプロフィール画像更新API
export const mockUpdateUserProfileImage = vi.fn();

// MSWモック一覧
export const handlers = [
    // ユーザプロフィール画像更新API
    http.patch<{ userId: string }>("*/api/users/:userId/profile", async ({ params, request }) => {
        const { userId } = params;
        const data = await request.formData();
        const file = data.get("file") as File;

        mockUpdateUserProfileImage({
            userId,
            name: file.name,
            type: file.type,
        });
        return HttpResponse.json(
            { imageUrl: "test.png", errorDetail: success },
            { status: HttpStatusCode.Ok }
        );
    }),

    // Socket.io
    http.get("*/socket.io", () => {}),
];
