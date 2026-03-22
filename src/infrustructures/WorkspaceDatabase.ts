import { PrismaClient } from "@prisma/client";
import {
    IWorkspaceDatabase,
    WorkspaceRecord,
    WorkspacesDatabaseResponse,
} from "./IWorkspaceDatabase";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";

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
}
