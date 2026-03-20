import { ErrorDetail } from "@/app/common/ErrorDetail";
import { WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

// Workspaceレスポンス
export type WorkspacesRepositoryResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceRepository {
    getWorkspaces(userId: string): Promise<WorkspacesRepositoryResponse>;
}
