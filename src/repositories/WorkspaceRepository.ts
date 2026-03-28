import { IWorkspaceDatabase } from "@/infrustructures/IWorkspaceDatabase";
import {
    WorkspacesRepositoryResponse,
    IWorkspaceRepository,
    WorkspaceRepositoryResponse,
} from "./IWorkspaceRepository";

export class WorkspaceRepository implements IWorkspaceRepository {
    constructor(private db: IWorkspaceDatabase) {}

    async getWorkspaces(ownerId: string): Promise<WorkspacesRepositoryResponse> {
        return await this.db.findAllByUserId(ownerId);
    }

    async createWorkspace(
        userId: string,
        workspaceName: string,
    ): Promise<WorkspaceRepositoryResponse> {
        return await this.db.create(userId, workspaceName);
    }
}
