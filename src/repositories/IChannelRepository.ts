import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord } from "@/infrustructures/IChannelDatabase";

// Channelレスポンス
export type ChannelsRepositoryResponse = {
    channels?: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelRepository {
    getChannels(workspaceId: string): Promise<ChannelsRepositoryResponse>;
}
