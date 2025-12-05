export const SUCCESS_MESSAGES = {
    // クライアント成功
    SUCCESS_CLIENT_INVITED_USER: "ユーザの招待に成功しました",

    SUCCESS_CLIENT_CREATED_POST: "ポストの作成に成功しました",
    SUCCESS_CLIENT_CREATED_CHANNEL: "チャネルの作成に成功しました",
    SUCCESS_CLIENT_CREATED_WORKSPACE: "ワークスペースの作成に成功しました",

    SUCCESS_CLIENT_DELETED_CHANNEL: "チャネルの削除に成功しました",
    SUCCESS_CLIENT_DELETED_POST: "ポストの削除に成功しました",
    SUCCESS_CLIENT_DELETED_WORKSPACE: "ワークスペースの削除に成功しました",
    SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER: (channelName: string) =>
        `チャンネル:${channelName} がワークスペース所有者によって削除されました`,
    SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER: (workspaceName: string) =>
        `ワークスペース:${workspaceName} が所有者によって削除されました`,
} as const;
