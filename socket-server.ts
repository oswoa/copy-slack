// server.js
import type { Channel, Post, Workspace } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";

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

// イベントハンドラ
io.on("connect", (socket) => {
    // チャット送信
    socket.on("send-message", (post: Post) => {
        console.log("送信チャット", post.content);
        socket.broadcast.emit("receive-message", post);
    });

    // チャット削除
    socket.on("delete-message", (post: Post) => {
        console.log("削除チャット", post.content);
        socket.broadcast.emit("delete-message", post);
    });

    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        console.log("新規チャネル", channel.channelName);
        socket.broadcast.emit("create-channel", channel);
    });

    // チャネル削除
    socket.on("delete-channel", (channel: Channel) => {
        console.log("削除チャネル", channel.channelName);
        socket.broadcast.emit("delete-channel", channel);
    });

    // ワークスペース削除
    socket.on("delete-workspace", (workspace: Workspace) => {
        console.log("削除ワークスペース", workspace.workspaceName);
        socket.broadcast.emit("delete-workspace", workspace);
    });
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    console.log(`Socket.io server is running on http://localhost:${socketPort}`);
});
