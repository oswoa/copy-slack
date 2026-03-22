import { ErrorDetail } from "@/app/common/ErrorDetail";

// Channelデータ
export type ChannelRecord = {
    channelId: number;
    workspaceId: string;
    channelName: string;
};

// Channelレスポンス
export type ChannelsDatabaseResponse = {
    channels?: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelDatabase {
    findAllByWorkspaceId(workspaceId: string): Promise<ChannelsDatabaseResponse>;
}
