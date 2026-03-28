import { IChannelRepository } from "@/repositories/IChannelRepository";
import {
    ChannelServiceResponse,
    ChannelsServiceResponse,
    IChannelService,
} from "./IChannelService";

export class ChannelService implements IChannelService {
    constructor(private repository: IChannelRepository) {}

    async getChannels(workspaceId: string): Promise<ChannelsServiceResponse> {
        return await this.repository.getChannels(workspaceId);
    }

    async createChannel(channelName: string, workspaceId: string): Promise<ChannelServiceResponse> {
        return await this.repository.createChannel(channelName, workspaceId);
    }
}
