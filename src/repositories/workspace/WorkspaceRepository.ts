import { IWorkspaceDatabase } from "@/infrastructures/workspace/IWorkspaceDatabase";
import {
    WorkspacesRepositoryResponse,
    IWorkspaceRepository,
    CreatedWorkspaceRepositoryResponse,
    WorkspaceRepositoryResponse,
    InviteUserWorkspaceRepositoryResponse,
} from "./IWorkspaceRepository";
import { TransactionClient } from "@/app/lib/init";

export class WorkspaceRepository implements IWorkspaceRepository {
    constructor(private db: IWorkspaceDatabase) {}

    async getWorkspaces(ownerId: string): Promise<WorkspacesRepositoryResponse> {
        return await this.db.findAllByUserId(ownerId);
    }

    async createWorkspace(
        tx: TransactionClient,
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceRepositoryResponse> {
        return await this.db.create(tx, userId, workspaceName);
    }

    async deleteWorkspace(workspaceId: string): Promise<WorkspaceRepositoryResponse> {
        return await this.db.delete(workspaceId);
    }

    async inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceRepositoryResponse> {
        return await this.db.inviteUserToWorkspace(workspaceId, userId);
    }
}
