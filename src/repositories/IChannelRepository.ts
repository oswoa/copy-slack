import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord } from "@/infrastructures/IChannelDatabase";

// Channelレスポンス
export type ChannelRepositoryResponse = {
    channel?: ChannelRecord;
    errorDetail: ErrorDetail;
};

export type ChannelsRepositoryResponse = {
    channels?: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelRepository {
    getChannels(workspaceId: string): Promise<ChannelsRepositoryResponse>;
    createChannel(workspaceId: string, channelName?: string): Promise<ChannelRepositoryResponse>;
    deleteChannel(channelId: string): Promise<ChannelRepositoryResponse>;
}
