import { ErrorDetail } from "@/app/common/ErrorDetail";
import { CreatedWorkspaceRecord, WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

// Workspaceレスポンス
export type WorkspaceRepositoryResponse = {
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesRepositoryResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceRepository {
    getWorkspaces(userId: string): Promise<WorkspacesRepositoryResponse>;
    createWorkspace(userId: string, workspaceName?: string): Promise<WorkspaceRepositoryResponse>;
}
