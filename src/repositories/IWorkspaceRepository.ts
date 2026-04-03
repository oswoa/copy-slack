import { ErrorDetail } from "@/app/common/ErrorDetail";
import { CreatedWorkspaceRecord, WorkspaceRecord } from "@/infrastructures/IWorkspaceDatabase";

// Workspaceレスポンス
export type WorkspaceRepositoryResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesRepositoryResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export type CreatedWorkspaceRepositoryResponse = {
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type InviteUserWorkspaceRepositoryResponse = {
    workspaceId?: string;
    userId?: string;
    errorDetail: ErrorDetail;
};

export interface IWorkspaceRepository {
    getWorkspaces(userId: string): Promise<WorkspacesRepositoryResponse>;
    createWorkspace(
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceRepositoryResponse>;
    deleteWorkspace(workspaceId: string): Promise<WorkspaceRepositoryResponse>;
    inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceRepositoryResponse>;
}
