import { PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord, ChannelsDatabaseResponse, IChannelDatabase } from "./IChannelDatabase";

export class ChannelDatabase implements IChannelDatabase {
    private prisma = new PrismaClient();

    async findAllByWorkspaceIdId(workspaceId: string): Promise<ChannelsDatabaseResponse> {
        let channels: ChannelRecord[] | undefined;

        try {
            const res = await this.prisma.channel.findMany({
                where: {
                    workspaceId,
                },
                orderBy: {
                    channelId: "asc",
                },
            });

            if (0 < res.length) {
                channels = res;
            }
            return { channels, errorDetail: ErrorDetail.success() };
        } catch (error) {
            return { channels, errorDetail: ErrorDetail.getFromPrismaError(error) };
        }
    }
}
