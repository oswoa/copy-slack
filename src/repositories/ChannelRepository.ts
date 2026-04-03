import { TransactionClient } from "@/app/lib/init";
import {
    ChannelRepositoryResponse,
    ChannelsRepositoryResponse,
    IChannelRepository,
} from "./IChannelRepository";
import { IChannelDatabase } from "@/infrastructures/IChannelDatabase";

export class ChannelRepository implements IChannelRepository {
    constructor(private db: IChannelDatabase) {}

    async getChannels(workspaceId: string): Promise<ChannelsRepositoryResponse> {
        return await this.db.findAllByWorkspaceId(workspaceId);
    }

    async createChannel(
        tx: TransactionClient,
        workspaceId: string,
        channelName?: string,
    ): Promise<ChannelRepositoryResponse> {
        return await this.db.create(tx, workspaceId, channelName);
    }

    async deleteChannel(channelId: string): Promise<ChannelRepositoryResponse> {
        return await this.db.delete(channelId);
    }
}
