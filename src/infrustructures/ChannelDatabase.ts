import { PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord, ChannelsDatabaseResponse, IChannelDatabase } from "./IChannelDatabase";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";

export class ChannelDatabase implements IChannelDatabase {
    private prisma = new PrismaClient();

    async findAllByWorkspaceIdId(workspaceId: string): Promise<ChannelsDatabaseResponse> {
        let channels: ChannelRecord[] | undefined;
        let errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
            ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
            HttpStatusCode.NotFound,
        );

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
                errorDetail = ErrorDetail.success();
            }
            return { channels, errorDetail };
        } catch (error) {
            return { channels, errorDetail: ErrorDetail.getFromPrismaError(error) };
        }
    }
}
