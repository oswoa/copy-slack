import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import {
    ChannelDatabaseResponse,
    ChannelRecord,
    ChannelsDatabaseResponse,
    IChannelDatabase,
} from "./IChannelDatabase";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

export class ChannelDatabase implements IChannelDatabase {
    private prisma = new PrismaClient();

    async findAllByWorkspaceId(workspaceId: string): Promise<ChannelsDatabaseResponse> {
        let channels: ChannelRecord[] = [];
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

            if (0 <= res.length) {
                channels = res;
                errorDetail = ErrorDetail.success();
            }
            return { channels, errorDetail };
        } catch (error) {
            return {
                channels,
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async create(workspaceId: string, channelName?: string): Promise<ChannelDatabaseResponse> {
        try {
            const data: Prisma.ChannelCreateInput = {
                channelName: channelName || "general",
                workspace: {
                    connect: {
                        workspaceId,
                    },
                },
            };
            const channel = await this.prisma.channel.create({ data });

            const errorDetail = new ErrorDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_CHANNEL,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_CHANNEL,
                HttpStatusCode.Created,
                true,
            );
            return { channel, errorDetail };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async delete(channelId: string): Promise<ChannelDatabaseResponse> {
        try {
            const findRes = await this.prisma.channel.findUnique({
                where: {
                    channelId,
                },
            });
            if (!findRes) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                    ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
                    HttpStatusCode.NotFound,
                );
                return { errorDetail };
            }

            const deletedCchannel = await this.prisma.channel.delete({
                where: {
                    channelId,
                },
            });
            const errorDetail = new ErrorDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_CHANNEL,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_CHANNEL,
                HttpStatusCode.Ok,
                true,
            );
            return {
                channel: deletedCchannel,
                errorDetail,
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
