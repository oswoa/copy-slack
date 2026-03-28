import { ErrorDetail } from "@/app/common/ErrorDetail";

// Channelデータ
export type ChannelRecord = {
    channelId: string;
    workspaceId: string;
    channelName: string;
};

// Channelレスポンス
export type ChannelDatabaseResponse = {
    channel?: ChannelRecord;
    errorDetail: ErrorDetail;
};

export type ChannelsDatabaseResponse = {
    channels: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelDatabase {
    findAllByWorkspaceId(workspaceId: string): Promise<ChannelsDatabaseResponse>;
    create(workspaceId: string, channelName?: string): Promise<ChannelDatabaseResponse>;
}
