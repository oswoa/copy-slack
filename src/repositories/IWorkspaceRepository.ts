import { ErrorDetail } from "@/app/common/ErrorDetail";
import { WorkspaceDatabaseResponse, WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

// Workspaceレスポンス
export type WorkspaceRepositoryResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesRepositoryResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceRepository {
    getWorkspaces(userId: string): Promise<WorkspacesRepositoryResponse>;
    createWorkspace(userId: string, workspaceName: string): Promise<WorkspaceRepositoryResponse>;
}
