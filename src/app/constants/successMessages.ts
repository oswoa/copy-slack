export const SUCCESS_MESSAGES = {
    // クライアント成功
    SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER: (channelName: string) =>
        `チャンネル:${channelName} がワークスペース所有者によって削除されました`,
    SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER: (workspaceName: string) =>
        `ワークスペース:${workspaceName} が所有者によって削除されました`,
} as const;
