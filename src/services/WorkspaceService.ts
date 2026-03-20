import { IWorkspaceService, WorkspaceServiceResponse } from "./IWorkspaceService";
import { IWorkspaceRepository } from "@/repositories/IWorkspaceRepository";

export class WorkspaceService implements IWorkspaceService {
    constructor(private repository: IWorkspaceRepository) {}

    async getWorkspaces(userId: string): Promise<WorkspaceServiceResponse> {
        return await this.repository.getWorkspaces(userId);
    }
}
