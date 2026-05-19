import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord } from "@/infrastructures/channel/IChannelDatabase";

export type ChannelServiceResponse = {
    channel?: ChannelRecord;
    errorDetail: ErrorDetail;
};

export type ChannelsServiceResponse = {
    channels?: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelService {
    getChannels(workspaceId: string): Promise<ChannelsServiceResponse>;
    createChannel(workspaceId: string, channelName?: string): Promise<ChannelServiceResponse>;
    deleteChannel(channelId: string): Promise<ChannelServiceResponse>;
}
