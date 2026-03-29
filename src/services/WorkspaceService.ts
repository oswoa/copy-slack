import {
    IWorkspaceService,
    CreatedWorkspaceServiceResponse,
    WorkspacesServiceResponse,
    WorkspaceServiceResponse,
    InviteUserWorkspaceServiceResponse,
} from "./IWorkspaceService";
import { IWorkspaceRepository } from "@/repositories/IWorkspaceRepository";

export class WorkspaceService implements IWorkspaceService {
    constructor(private repository: IWorkspaceRepository) {}

    async getWorkspaces(userId: string): Promise<WorkspacesServiceResponse> {
        return await this.repository.getWorkspaces(userId);
    }

    async createWorkspace(
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceServiceResponse> {
        return this.repository.createWorkspace(userId, workspaceName);
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
