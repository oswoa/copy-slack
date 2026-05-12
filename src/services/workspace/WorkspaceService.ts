import { AppPrismaClient } from "@/app/lib/init";
import {
    IWorkspaceService,
    CreatedWorkspaceServiceResponse,
    WorkspacesServiceResponse,
    WorkspaceServiceResponse,
    InviteUserWorkspaceServiceResponse,
} from "./IWorkspaceService";
import { IWorkspaceRepository } from "@/repositories/workspace/IWorkspaceRepository";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export class WorkspaceService implements IWorkspaceService {
    constructor(
        private prisma: AppPrismaClient,
        private repository: IWorkspaceRepository,
    ) {}

    async getWorkspaces(userId: string): Promise<WorkspacesServiceResponse> {
        return await this.repository.getWorkspaces(userId);
    }

    async createWorkspace(
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceServiceResponse> {
        try {
            return this.prisma.$transaction(async (tx) =>
                this.repository.createWorkspace(tx, userId, workspaceName),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async deleteWorkspace(workspaceId: string): Promise<WorkspaceServiceResponse> {
        return await this.repository.deleteWorkspace(workspaceId);
    }

    async inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceServiceResponse> {
        return await this.repository.inviteUserToWorkspace(workspaceId, userId);
    }
}
