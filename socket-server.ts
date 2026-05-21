import { Server } from "socket.io";
import { createServer } from "http";
import { Logger } from "./src/app/common/util.ts";

type UserRecordWithSecrets = {
    userId: string;
    email: string;
    displayName: string;
    slackToken: string;
    password: string;
};
type UserRecord = Omit<UserRecordWithSecrets, "slackToken" | "password">;

type Workspace = {
    workspaceId: string;
    ownerId: string;
    workspaceName: string;
};

type Channel = {
    channelId: string;
    workspaceId: string;
    channelName: string;
};

type Post = {
    postId: string;
    channelId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    displayName: string;
    imgUrl: string;
};

const nextPort = process.env.NEXT_PUBLIC_PORT;
const socketPort = process.env.NEXT_PUBLIC_SOCKET_PORT;
const httpServer = createServer();

// Socket.ioサーバを作成
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:${nextPort}`,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    let loginUser: UserRecord;
    let currentWorkspaceId: string;
    let currentChannelId: string;
    let userRoomId: string;

    // ルーム参加
    socket.on("join-room", (user: UserRecord, workspaceId: string, channelId: number) => {
        loginUser = user;
        currentWorkspaceId = workspaceId;
        currentChannelId = String(channelId);

        // ワークスペースに参加
        if (!socket.rooms.has(currentWorkspaceId)) {
            Logger.info(`user: ${loginUser.displayName} -> join ${currentWorkspaceId} ws`);
            socket.join(currentWorkspaceId);
        }

        // チャネルに参加
        if (!socket.rooms.has(currentChannelId)) {
            Logger.info(`user: ${loginUser.displayName} -> join ${currentChannelId} ch`);
            socket.join(currentChannelId);
        }

        // 直接通信用の専用roomに参加
        userRoomId = `user-${user.userId}`;
        if (!socket.rooms.has(userRoomId)) {
            Logger.info(`user: ${loginUser.displayName} -> join room: ${userRoomId}`);
            socket.join(userRoomId);
        }
    });

    // ルーム退出
    socket.on("leave-room", () => {
        Logger.info(`user: ${loginUser.displayName} -> exit ${currentWorkspaceId} ws`);
        socket.leave(currentWorkspaceId);

        Logger.info(`user: ${loginUser.displayName} -> exit ${currentChannelId} ch`);
        socket.leave(currentChannelId);

        Logger.info(`user: ${loginUser.displayName} -> exit ${userRoomId} room`);
        socket.leave(userRoomId);
    });

    // チャット送信
    socket.on("send-message", (post: Post) => {
        Logger.info(
            `user: ${loginUser.displayName} -> send to ${currentChannelId} ch -> postId: ${post.postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("receive-message", post);
    });

    // チャット削除
    socket.on("delete-message", (postId: string) => {
        Logger.info(
            `user: ${loginUser.displayName} -> ${currentChannelId} ch -> delete postId: ${postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("delete-message", postId);
    });

    // チャット更新
    socket.on("edit-message", (post: Post) => {
        Logger.info(
            `user: ${loginUser.displayName} -> ${currentChannelId} ch -> edit postId: ${post.postId} on ${currentWorkspaceId} ws`,
        );
        socket.to(currentChannelId).emit("edit-message", post);
    });

    // チャネル作成
    socket.on("create-channel", (channel: Channel) => {
        Logger.info(
            `user: ${loginUser.displayName} -> create ${channel.channelId} ch on ${currentWorkspaceId} ws`,
        );
        socket.to(currentWorkspaceId).emit("create-channel", channel);
    });

    // チャネル削除
    socket.on("delete-channel", (channel: Channel) => {
        Logger.info(
            `user: ${loginUser.displayName} -> delete ${channel.channelId} ch on ${currentWorkspaceId} ws`,
        );
        socket.to(currentWorkspaceId).emit("delete-channel", channel);
    });

    // ワークスペース削除
    socket.on("delete-workspace", (workspace: Workspace) => {
        Logger.info(
            `user: ${loginUser.displayName} -> delete workspace: ${workspace.workspaceName}`,
        );
        socket.broadcast.emit("delete-workspace", workspace);
    });

    // ワークスペース招待
    socket.on("invite-workspace", (invitedUser: UserRecord, workspace: Workspace) => {
        Logger.info(
            `user: ${loginUser.displayName} -> invited user: ${invitedUser.displayName} -> workspaceName: ${workspace.workspaceName}`,
        );
        const targetUserRoom = `user-${invitedUser.userId}`;
        io.to(targetUserRoom).emit("invite-workspace", workspace);
    });

    // ユーザ表示名更新
    socket.on("change-display-name", (updatedUser: UserRecord) => {
        Logger.info(
            `user: ${loginUser.displayName} -> changed their own display name -> user: ${updatedUser.displayName}`,
        );
        loginUser = updatedUser;
        socket.broadcast.emit("change-display-name", updatedUser);
    });
});

// Socket.ioサーバを起動
httpServer.listen(socketPort, () => {
    Logger.info(`Socket.io server is running on http://localhost:${socketPort}`);
});
