import type { Channel, Post, Workspace } from "@prisma/client";
import { Server } from "socket.io";
import { createServer } from "http";
import { Logger } from "./src/app/common/util.ts";

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
    let userName: string;
    let channelId: string;

    // チャネル参加
    socket.on("join-channel", (user: string, currentChannelId: number) => {
        userName = user;
        channelId = String(currentChannelId);

        if (!socket.rooms.has(channelId)) {
            Logger.info(`user: ${userName} -> join channel: ${channelId}`);
            socket.join(channelId);
        }
    });

    // チャネル退出
    socket.on("leave-channel", () => {
        Logger.info(`user: ${userName} -> exit channel: ${channelId}`);
        socket.leave(channelId);
    });

    // チャット送信
    socket.on("send-message", (post: Post) => {
        Logger.info(`user: ${userName} -> send to ${channelId} ch -> postId: ${post.postId}`);
        socket.to(channelId).emit("receive-message", post);
    });

    // チャット削除
    socket.on("delete-message", (post: Post) => {
        Logger.info(`user: ${userName} -> ${channelId} ch -> delete postId: ${post.postId}`);
        socket.to(channelId).emit("delete-message", post);
    });

    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        Logger.info(`user: ${userName} -> create ${channel.channelId} ch`);
        socket.broadcast.emit("create-channel", channel);
    });

    // チャネル削除
    socket.on("delete-channel", (channel: Channel) => {
        Logger.info(`user: ${userName} -> delete ${channel.channelId} ch`);
        socket.broadcast.emit("delete-channel", channel);
    });

    // ワークスペース削除
    socket.on("delete-workspace", (workspace: Workspace) => {
        Logger.info(`user: ${userName} -> delete workspace: ${workspace.workspaceName}`);
        socket.broadcast.emit("delete-workspace", workspace);
    });

    // TODO: ここから
    // ワークスペース招待
    // プロフィール画像更新
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    Logger.info(`Socket.io server is running on http://localhost:${socketPort}`);
});
