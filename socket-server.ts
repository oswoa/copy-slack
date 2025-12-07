import type { Channel, Post, Workspace } from "@prisma/client";
import { Server } from "socket.io";
import { createServer } from "http";
import { Logger } from "./src/app/common/util.ts";

// 正常にimportできないため、別で定義
type UserProfile = {
    userId: string;
    email: string;
    displayName: string;
};
type SafeUser = {
    userId: string;
    displayName: string;
};
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
    let currentUser: UserProfile;
    let currentChannelId: string;
    let userRoomId: string;

    // チャネル参加
    socket.on("join-channel", (user: UserProfile, channelId: number) => {
        currentUser = user;
        currentChannelId = String(channelId);

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

    // チャネル退出
    socket.on("leave-channel", () => {
        Logger.info(`user: ${currentUser.displayName} -> exit ${currentChannelId} ch`);
        socket.leave(currentChannelId);

        Logger.info(`user: ${currentUser.displayName} -> exit ${userRoomId} room`);
        socket.leave(userRoomId);
    });

    // チャット送信
    socket.on("send-message", (post: UserPost) => {
        Logger.info(
            `user: ${currentUser.displayName} -> send to ${currentChannelId} ch -> postId: ${post.postId}`
        );
        socket.to(currentChannelId).emit("receive-message", post);
    });

    // チャット削除
    socket.on("delete-message", (post: Post) => {
        Logger.info(
            `user: ${currentUser.displayName} -> ${currentChannelId} ch -> delete postId: ${post.postId}`
        );
        socket.to(currentChannelId).emit("delete-message", post);
    });

    // チャット更新
    socket.on("edit-message", (post: UserPost) => {
        Logger.info(
            `user: ${currentUser.displayName} -> ${currentChannelId} ch -> edit postId: ${post.postId}`
        );
        socket.to(currentChannelId).emit("edit-message", post);
    });

    // BUG: ワークスペース用のソケットを作成、そっちに通知すること
    // ※ 現在の実装だと違うワークスペースにいても見えてるチャネルに追加されてしまう
    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        Logger.info(`user: ${currentUser.displayName} -> create ${channel.channelId} ch`);
        socket.broadcast.emit("create-channel", channel);
    });

    // BUG: ワークスペース用のソケットを作成、そっちに通知すること
    // ※ 現在の実装だと違うワークスペースにいても見えてるチャネルに影響が出る
    // チャネル削除
    socket.on("delete-channel", (channel: Channel) => {
        Logger.info(`user: ${currentUser.displayName} -> delete ${channel.channelId} ch`);
        socket.broadcast.emit("delete-channel", channel);
    });

    // ワークスペース削除
    socket.on("delete-workspace", (workspace: Workspace) => {
        Logger.info(
            `user: ${currentUser.displayName} -> delete workspace: ${workspace.workspaceName}`
        );
        socket.broadcast.emit("delete-workspace", workspace);
    });

    // ワークスペース招待
    socket.on("invite-workspace", (invitedUser: SafeUser, workspace: Workspace) => {
        Logger.info(
            `user: ${currentUser.displayName} -> invited user: ${invitedUser.displayName} -> workspaceName: ${workspace.workspaceName}`
        );
        const targetUserRoom = `user-${invitedUser.userId}`;
        io.to(targetUserRoom).emit("invite-workspace", workspace);
    });

    // ユーザ表示名更新
    socket.on("change-display-name", (updatedUser: UserProfile) => {
        Logger.info(
            `user: ${currentUser.displayName} -> changed their own display name -> user: ${updatedUser.displayName}`
        );
        currentUser = updatedUser;
        socket.broadcast.emit("change-display-name", updatedUser);
    });
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    Logger.info(`Socket.io server is running on http://localhost:${socketPort}`);
});
