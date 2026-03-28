import {
    ChannelRepositoryResponse,
    ChannelsRepositoryResponse,
    IChannelRepository,
} from "./IChannelRepository";
import { IChannelDatabase } from "@/infrustructures/IChannelDatabase";

export class ChannelRepository implements IChannelRepository {
    constructor(private db: IChannelDatabase) {}

    async getChannels(workspaceId: string): Promise<ChannelsRepositoryResponse> {
        return await this.db.findAllByWorkspaceId(workspaceId);
    }

    async createChannel(
        channelName: string,
        workspaceId: string,
    ): Promise<ChannelRepositoryResponse> {
        return await this.db.create(channelName, workspaceId);
    }
}
