import { Prisma, PrismaClient } from "@prisma/client";
import {
    IWorkspaceDatabase,
    WorkspaceDatabaseResponse,
    WorkspaceRecord,
    WorkspacesDatabaseResponse,
} from "./IWorkspaceDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

export class WorkspaceDatabase implements IWorkspaceDatabase {
    private prisma = new PrismaClient();

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

    async create(userId: string, workspaceName: string): Promise<WorkspaceDatabaseResponse> {
        try {
            const data: Prisma.WorkspaceCreateInput = {
                workspaceName,
                owner: {
                    connect: {
                        userId: userId,
                    },
                },
                workspaceUsers: {
                    create: {
                        userId,
                    },
                },
            };
            const workspace = await this.prisma.workspace.create({ data });

            const errorDetail = new ErrorDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                HttpStatusCode.Created,
                true,
            );
            return { workspace, errorDetail };
        } catch (error) {
            const errorDetail = ErrorDetail.getFromPrismaError(error);
            return { errorDetail };
        }
    }
}
