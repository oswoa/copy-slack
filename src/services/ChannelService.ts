import { IChannelRepository } from "@/repositories/IChannelRepository";
import {
    ChannelServiceResponse,
    ChannelsServiceResponse,
    IChannelService,
} from "./IChannelService";
import { AppPrismaClient } from "@/app/lib/init";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export class ChannelService implements IChannelService {
    constructor(
        private prisma: AppPrismaClient,
        private repository: IChannelRepository,
    ) {}

    async getChannels(workspaceId: string): Promise<ChannelsServiceResponse> {
        const repositoryResponse = await this.repository.getChannels(workspaceId);
        if (!repositoryResponse.errorDetail.success) {
            return { errorDetail: repositoryResponse.errorDetail };
        }

        let channels = repositoryResponse.channels;
        if (2 <= channels!.length) {
            const generalChannel = channels?.find((channel) => channel.channelName === "general");
            const filteredChannels = channels?.filter(
                (channel) => channel.channelName !== generalChannel?.channelName,
            );
            filteredChannels?.unshift(generalChannel!);
            channels = filteredChannels;
        }

        return { channels, errorDetail: ErrorDetail.success() };
    }

    async createChannel(
        workspaceId: string,
        channelName?: string,
    ): Promise<ChannelServiceResponse> {
        try {
            return this.prisma.$transaction(async (tx) =>
                this.repository.createChannel(tx, workspaceId, channelName),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async deleteChannel(channelId: string): Promise<ChannelServiceResponse> {
        return await this.repository.deleteChannel(channelId);
    }
}
