import { Prisma, PrismaClient } from "@prisma/client";
import {
    CreatedWorkspaceRecord,
    IWorkspaceDatabase,
    CreatedWorkspaceDatabaseResponse,
    WorkspaceRecord,
    WorkspacesDatabaseResponse,
    WorkspaceDatabaseResponse,
    InviteUserWorkspaceDatabaseResponse,
} from "./IWorkspaceDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";

export class WorkspaceDatabase implements IWorkspaceDatabase {
    constructor(private readonly prisma = defaultPrisma) {}

    async findAllByUserId(ownerId: string): Promise<WorkspacesDatabaseResponse> {
        try {
            // 所属する全てのワークスペースを取得（所有ワークスペース、招待されたワークスペース）
            const res = await this.prisma.workspaceUser.findMany({
                where: {
                    userId: ownerId,
                },
                orderBy: {
                    workspaceId: "asc",
                },
                include: {
                    workspace: true,
                },
            });
            if (res.length <= 0) {
                return {
                    errorDetail: new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                        ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
                        HttpStatusCode.NotFound,
                    ),
                };
            }

            const workspaces: WorkspaceRecord[] = res.map((record) => ({
                workspaceId: record.workspace.workspaceId,
                ownerId: record.workspace.ownerId,
                workspaceName: record.workspace.workspaceName,
            }));

            return {
                workspaces,
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async create(
        tx: TransactionClient,
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceDatabaseResponse> {
        try {
            const data: Prisma.WorkspaceCreateInput = {
                workspaceName: workspaceName || `${userId}-workspace`,
                owner: {
                    connect: {
                        userId: userId,
                    },
                },
                channels: {
                    create: {
                        channelName: "general",
                    },
                },
                workspaceUsers: {
                    create: {
                        userId,
                    },
                },
            };
            const workspace = await tx.workspace.create({
                data,
                select: {
                    workspaceId: true,
                    ownerId: true,
                    workspaceName: true,
                    channels: {
                        select: {
                            channelId: true,
                            channelName: true,
                        },
                    },
                },
            });

            const errorDetail = new ErrorDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                HttpStatusCode.Created,
                true,
            );

            const response: CreatedWorkspaceRecord = {
                workspaceId: workspace.workspaceId,
                ownerId: workspace.ownerId,
                workspaceName: workspace.workspaceName,
                channelId: workspace.channels[0].channelId,
                channelName: workspace.channels[0].channelName,
            };
            return { workspace: response, errorDetail };
        } catch (error) {
            throw error;
        }
    }

    async delete(workspaceId: string): Promise<WorkspaceDatabaseResponse> {
        try {
            const findRes = await this.prisma.workspace.findUnique({
                where: {
                    workspaceId,
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

            const deletedWorkspace = await this.prisma.workspace.delete({
                where: {
                    workspaceId,
                },
            });

            return {
                workspace: deletedWorkspace,
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceDatabaseResponse> {
        try {
            const data: Prisma.WorkspaceUserCreateInput = {
                user: {
                    connect: {
                        userId,
                    },
                },
                workspace: {
                    connect: {
                        workspaceId,
                    },
                },
            };
            const res = await this.prisma.workspaceUser.create({ data });

            return {
                workspaceId: res.workspaceId,
                userId: res.userId,
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
