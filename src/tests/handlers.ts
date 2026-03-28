import { HttpStatusCode } from "axios";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

import { RegisterChannelApiRequest } from "@/app/api/channels/route";
import { LoginApiRequest } from "@/app/api/login/route";
import { UpdateUserApiRequest } from "@/app/api/users/[userId]/route";
import { RegisterWorkspaceApiRequest } from "@/app/api/workspaces/route";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { Channel, Workspace } from "@prisma/client";
import { UserRecord } from "@/infrustructures/IUserDatabase";
import { RegisterUserApiRequest } from "@/app/api/signup/route";

const errorDetail = ErrorDetail.success();
const status = HttpStatusCode.Ok;

// ログインAPI
export const mockLoginApi = vi.fn();

// ログアウトAPI
export const mockLogoutApi = vi.fn();

// ユーザ一覧取得API
export const mockGetUserListApi = vi.fn();

// ユーザ登録API
export const mockSignupApi = vi.fn();

// ユーザ更新API
export const mockUpdateUserApi = vi.fn();

// ユーザプロフィール更新API
export const mockUpdateUserProfileApi = vi.fn();

// チャネル一覧取得API
export const mockGetChannelListApi = vi.fn();

// チャネル登録API
export const mockRegisterChannelApi = vi.fn();

// ワークスペース一覧取得API
export const mockGetWorkspaceListApi = vi.fn();

// ワークスペース登録API
export const mockRegisterWorkspaceApi = vi.fn();

// ワークスペースユーザ登録API
export const mockRegisterWorkspaceUserApi = vi.fn();

// ユーザプロフィール登録API
export const mockRegisterProfileApi = vi.fn();

// MSWモック一覧
export const handlers = [
    // 認証API
    http.get("/api/auth", () => {
        const user: UserRecord = {
            userId: "user1",
            displayName: "ユーザー1",
            email: "test1@example.com",
            imageUrl: "",
        };
        return HttpResponse.json({ user, errorDetail }, { status });
    }),

    // ログインAPI
    http.post("/api/login", async ({ request }) => {
        const data = await request.clone().json();
        const { userId, password } = data as LoginApiRequest;

        const user: UserRecord = {
            userId: "user1",
            email: "test1@example.com",
            displayName: "ユーザ1",
            imageUrl: "",
        };

        mockLoginApi({
            userId,
            password,
        });
        return HttpResponse.json(
            { user, workspaceId: "1", channelId: "1", errorDetail },
            { status },
        );
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
        const users: UserRecord[] = [
            {
                userId: "user1",
                email: "",
                displayName: "ユーザ1",
                imageUrl: "",
            },
            {
                userId: "user2",
                email: "",
                displayName: "ユーザ2",
                imageUrl: "",
            },
            {
                userId: "user3",
                email: "",
                displayName: "ユーザ3",
                imageUrl: "",
            },
        ];
        mockGetUserListApi({ displayName });
        return HttpResponse.json({ users, errorDetail }, { status });
    }),

    // ユーザ登録API
    http.post("/api/signup", async ({ request }) => {
        const data = await request.clone().json();
        const { userId, email, password } = data as RegisterUserApiRequest;

        mockSignupApi({
            userId,
            email,
            password,
        });
        return HttpResponse.json(
            {
                user: {
                    userId,
                    email,
                    displayName: userId,
                    imageUrl: "",
                },
                workspaceId: "1",
                channelId: "2",
                errorDetail,
            },
            { status },
        );
    }),

    // ユーザ更新API
    http.patch<{ userId: string }, UpdateUserApiRequest>(
        "/api/users/:userId",
        async ({ params, request }) => {
            const { userId } = params;
            const data = await request.clone().json();

            const user: UserRecord = {
                userId: userId,
                email: data?.email,
                displayName: data?.displayName,
                imageUrl: "",
            };
            mockUpdateUserApi({
                userId: user.userId,
                email: user.email,
                displayName: user.displayName,
            });
            return HttpResponse.json({ user, errorDetail }, { status });
        },
    ),

    // ユーザプロフィール画像更新API
    http.patch<{ userId: string }>("/api/users/:userId/profile", async ({ params, request }) => {
        const { userId } = params;

        mockUpdateUserProfileApi({ userId });
        return HttpResponse.json({ imageUrl: "test.png", errorDetail }, { status });
    }),

    // チャネル一覧取得API
    http.get("/api/channels", async ({ request }) => {
        const url = new URL(request.url);
        const workspaceId = url.searchParams.get("workspaceId");
        const channels: Channel[] = [
            {
                channelId: "1",
                workspaceId: "1",
                channelName: "ch1",
            },
            {
                channelId: "2",
                workspaceId: "1",
                channelName: "ch2",
            },
        ];
        mockGetChannelListApi({ workspaceId });
        return HttpResponse.json({ channels, errorDetail }, { status });
    }),

    // チャネル登録API
    http.post("/api/channels", async ({ request }) => {
        const data = await request.clone().json();
        const { workspaceId, channelName } = data as RegisterChannelApiRequest;
        const channel: Channel = {
            channelId: "1",
            workspaceId,
            channelName: channelName!,
        };

        mockRegisterChannelApi({
            workspaceId,
            channelName,
        });
        return HttpResponse.json({ channel, errorDetail }, { status });
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

    // ワークスペース登録API
    http.post("/api/workspaces", async ({ request }) => {
        const data = await request.clone().json();
        const { userId, workspaceName } = data as RegisterWorkspaceApiRequest;

        const workspace: Workspace = {
            // workspaceIdは自動設定のため手動で設定しておく
            workspaceId: "auto",
            ownerId: userId,
            workspaceName: workspaceName!,
        };
        mockRegisterWorkspaceApi({
            workspaceId: "auto",
            ownerId: userId,
            workspaceName,
        });
        return HttpResponse.json({ workspace, errorDetail }, { status });
    }),

    // ワークスペースユーザ登録API
    http.post<{ workspaceId: string; userId: string }>(
        "/api/workspaces/:workspaceId/:userId",
        async ({ params }) => {
            const { workspaceId, userId } = await params;
            mockRegisterWorkspaceUserApi({
                workspaceId,
                userId,
            });
            return HttpResponse.json({ workspaceId, userId, errorDetail }, { status });
        },
    ),

    // ユーザプロフィール登録API
    http.post<{ userId: string }>("/api/users/:userId/profile", async ({ params }) => {
        const { userId } = await params;
        const imageUrl = "/test.png";
        mockRegisterProfileApi({ userId });
        return HttpResponse.json({ imageUrl, errorDetail }, { status });
    }),

    // Socket.io（単体テストには不要だが、ソケット通信自体もモック化しないとエラーがログに溢れるため）
    http.get("*/socket.io", () => {}),
];
