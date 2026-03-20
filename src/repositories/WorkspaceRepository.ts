import { IWorkspaceDatabase } from "@/infrustructures/IWorkspaceDatabase";
import { WorkspacesRepositoryResponse, IWorkspaceRepository } from "./IWorkspaceRepository";

export class WorkspaceRepository implements IWorkspaceRepository {
    constructor(private db: IWorkspaceDatabase) {}

    async getWorkspaces(ownerId: string): Promise<WorkspacesRepositoryResponse> {
        return await this.db.findAllByUserId(ownerId);
    }
}
