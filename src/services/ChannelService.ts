import { IChannelRepository } from "@/repositories/IChannelRepository";
import { ChannelServiceResponse, IChannelService } from "./IChannelService";

export class ChannelService implements IChannelService {
    constructor(private repository: IChannelRepository) {}

    async getChannels(workspaceId: string): Promise<ChannelServiceResponse> {
        return await this.repository.getChannels(workspaceId);
    }
}
