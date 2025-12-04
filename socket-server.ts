import type { Channel, Post, Workspace } from "@prisma/client";
import { Server } from "socket.io";
import { createServer } from "http";
import { Logger } from "./src/app/common/util.ts";

// tsxからimportできないため、別で定義
type UserProfile = {
    userId: string;
    email: string;
    displayName: string;
};

type SafeUser = {
    userId: string;
    displayName: string;
};

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
    let userRoom: string;

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
        userRoom = `user-${user.userId}`;
        if (!socket.rooms.has(userRoom)) {
            Logger.info(`user: ${currentUser.displayName} -> join room: ${userRoom}`);
            socket.join(userRoom);
        }
    });

    // チャネル退出
    socket.on("leave-channel", () => {
        Logger.info(`user: ${currentUser.displayName} -> exit ${currentChannelId} ch`);
        socket.leave(currentChannelId);

        Logger.info(`user: ${currentUser.displayName} -> exit ${userRoom} room`);
        socket.leave(userRoom);
    });

    // チャット送信
    socket.on("send-message", (post: Post) => {
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

    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        Logger.info(`user: ${currentUser.displayName} -> create ${channel.channelId} ch`);
        socket.broadcast.emit("create-channel", channel);
    });

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

    // TODO: ここから
    // プロフィール画像更新
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    Logger.info(`Socket.io server is running on http://localhost:${socketPort}`);
});
