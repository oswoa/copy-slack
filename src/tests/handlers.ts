import { LoginApiRequest } from "@/app/api/login/route";
import { UpdateUserApiRequest } from "@/app/api/users/[userId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SafeUser, UserProfile } from "@/app/context/CurrentUserContext";
import { Channel, Workspace } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

const errorDetail = ErrorDetail.success();
const status = HttpStatusCode.Ok;

// ログインAPI
export const mockLoginApi = vi.fn();

// ログアウトAPI
export const mockLogoutApi = vi.fn();

// ユーザ一覧取得API
export const mockGetUserListApi = vi.fn();

// ユーザ更新API
export const mockUpdateUserApi = vi.fn();

// ユーザプロフィール更新API
export const mockUpdateUserProfileApi = vi.fn();

// チャネル一覧取得API
export const mockGetChannelListApi = vi.fn();

// ワークスペース一覧取得API
export const mockGetWorkspaceListApi = vi.fn();

// MSWモック一覧
export const handlers = [
    // 認証API
    http.get("/api/auth", () => {
        const user: UserProfile = {
            userId: "user1",
            displayName: "ユーザー1",
            email: "test1@example.com",
        };
        return HttpResponse.json({ user, errorDetail }, { status });
    }),

    // ログインAPI
    http.post<LoginApiRequest>("/api/login", async ({ request }) => {
        const data = await request.clone().json();
        const { userId, password } = data as LoginApiRequest;

        const user: UserProfile = {
            userId: "user1",
            email: "test1@example.com",
            displayName: "ユーザ1",
        };

        mockLoginApi({
            userId,
            password,
        });
        return HttpResponse.json({ user, errorDetail }, { status });
    }),

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
            const data = await request.clone().json();

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
        const data = await request.clone().formData();
        const file = data.get("file") as File;

        mockUpdateUserProfileApi({
            userId,
            name: file.name,
            type: file.type,
        });
        return HttpResponse.json({ imageUrl: "test.png", errorDetail }, { status });
    }),

    // チャネル一覧取得API
    http.get("/api/channels", async ({ request }) => {
        const url = new URL(request.url);
        const workspaceId = url.searchParams.get("workspaceId");
        const channels: Channel[] = [
            {
                channelId: 1,
                workspaceId: "1",
                channelName: "ch1",
            },
            {
                channelId: 2,
                workspaceId: "1",
                channelName: "ch2",
            },
        ];
        mockGetChannelListApi({ workspaceId });
        return HttpResponse.json({ channels, errorDetail }, { status });
    }),

    // ワークスペース一覧取得API
    http.get("/api/workspaces", async ({ request }) => {
        const url = new URL(request.url);
        const ownerId = url.searchParams.get("ownerId");
        const workspaces: Workspace[] = [
            {
                workspaceId: "1",
                ownerId: "user1",
                workspaceName: "user-wk1",
            },
            {
                workspaceId: "2",
                ownerId: "user1",
                workspaceName: "user-wk2",
            },
        ];
        mockGetWorkspaceListApi({ ownerId });
        return HttpResponse.json({ workspaces, errorDetail }, { status });
    }),

    // Socket.io（単体テストには不要だが、ソケット通信自体もモック化しないとエラーがログに溢れるため）
    http.get("*/socket.io", () => {}),
];
