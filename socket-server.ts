import type { Channel, Post, Workspace } from "@prisma/client";
import { Server } from "socket.io";
import { createServer } from "http";
import { Logger } from "./src/app/common/util.ts";

type UserDatabaseWithSecrets = {
    userId: string;
    email: string;
    displayName: string;
    token: string;
    password: string;
};
type UserDatabase = Omit<UserDatabaseWithSecrets, "token" | "password">;

type UserPost = Post & { displayName: string };

const nextPort = process.env.PORT ? process.env.PORT : "3000";
const socketPort = process.env.SOCKET_PORT ? process.env.SOCKET_PORT : "3001";
const httpServer = createServer();

// Socket.ioサーバを作成
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:${nextPort}`,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    let currentUser: UserDatabase;
    let currentWorkspaceId: string;
    let currentChannelId: string;
    let userRoomId: string;

    // ルーム参加
    socket.on("join-room", (user: UserDatabase, workspaceId: string, channelId: number) => {
        currentUser = user;
        currentWorkspaceId = workspaceId;
        currentChannelId = String(channelId);

        // ワークスペースに参加
        if (!socket.rooms.has(currentWorkspaceId)) {
            Logger.info(`user: ${currentUser.displayName} -> join ${currentWorkspaceId} ws`);
            socket.join(currentWorkspaceId);
        }

        // チャネルに参加
        if (!socket.rooms.has(currentChannelId)) {
            Logger.info(`user: ${currentUser.displayName} -> join ${currentChannelId} ch`);
            socket.join(currentChannelId);
        }

        // 直接通信用の専用roomに参加
        userRoomId = `user-${user.userId}`;
        if (!socket.rooms.has(userRoomId)) {
            Logger.info(`user: ${currentUser.displayName} -> join room: ${userRoomId}`);
            socket.join(userRoomId);
        }
    });

    // ルーム退出
    socket.on("leave-room", () => {
        Logger.info(`user: ${currentUser.displayName} -> exit ${currentWorkspaceId} ws`);
        socket.leave(currentWorkspaceId);

        Logger.info(`user: ${currentUser.displayName} -> exit ${currentChannelId} ch`);
        socket.leave(currentChannelId);

        Logger.info(`user: ${currentUser.displayName} -> exit ${userRoomId} room`);
        socket.leave(userRoomId);
    });

    // チャット送信
    socket.on("send-message", (post: UserPost) => {
        Logger.info(
            `user: ${currentUser.displayName} -> send to ${currentChannelId} ch -> postId: ${post.postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("receive-message", post);
    });

    // チャット削除
    socket.on("delete-message", (post: Post) => {
        Logger.info(
            `user: ${currentUser.displayName} -> ${currentChannelId} ch -> delete postId: ${post.postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("delete-message", post);
    });

    // チャット更新
    socket.on("edit-message", (post: UserPost) => {
        Logger.info(
            `user: ${currentUser.displayName} -> ${currentChannelId} ch -> edit postId: ${post.postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("edit-message", post);
    });

    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        Logger.info(
            `user: ${currentUser.displayName} -> create ${channel.channelId} ch on ${currentWorkspaceId} ws`,
        );
        socket.to(currentWorkspaceId).emit("create-channel", channel);
    });

    // チャネル削除
    socket.on("delete-channel", (channel: Channel) => {
        Logger.info(
            `user: ${currentUser.displayName} -> delete ${channel.channelId} ch on ${currentWorkspaceId} ws`,
        );
        socket.to(currentWorkspaceId).emit("delete-channel", channel);
    });

    // ワークスペース削除
    socket.on("delete-workspace", (workspace: Workspace) => {
        Logger.info(
            `user: ${currentUser.displayName} -> delete workspace: ${workspace.workspaceName}`,
        );
        socket.broadcast.emit("delete-workspace", workspace);
    });

    // ワークスペース招待
    socket.on("invite-workspace", (invitedUser: UserDatabase, workspace: Workspace) => {
        Logger.info(
            `user: ${currentUser.displayName} -> invited user: ${invitedUser.displayName} -> workspaceName: ${workspace.workspaceName}`,
        );
        const targetUserRoom = `user-${invitedUser.userId}`;
        io.to(targetUserRoom).emit("invite-workspace", workspace);
    });

    // ユーザ表示名更新
    socket.on("change-display-name", (updatedUser: UserDatabase) => {
        Logger.info(
            `user: ${currentUser.displayName} -> changed their own display name -> user: ${updatedUser.displayName}`,
        );
        currentUser = updatedUser;
        socket.broadcast.emit("change-display-name", updatedUser);
    });
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    Logger.info(`Socket.io server is running on http://localhost:${socketPort}`);
});
