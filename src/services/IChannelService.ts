import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord } from "@/infrustructures/IChannelDatabase";

export type ChannelServiceResponse = {
    channels?: ChannelRecord[];
    errorDetail: ErrorDetail;
};

export interface IChannelService {
    getChannels(workspaceId: string): Promise<ChannelServiceResponse>;
}
