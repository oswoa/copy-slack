import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";

// Workspaceデータ
export type WorkspaceRecord = {
    workspaceId: string;
    ownerId: string;
    workspaceName: string;
};

export type CreatedWorkspaceRecord = {
    workspaceId: string;
    ownerId: string;
    workspaceName: string;
    channelId: string;
    channelName: string;
};

// Workspaceレスポンス
export type WorkspaceDatabaseResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesDatabaseResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export type CreatedWorkspaceDatabaseResponse = {
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type InviteUserWorkspaceDatabaseResponse = {
    workspaceId?: string;
    userId?: string;
    errorDetail: ErrorDetail;
};

export interface IWorkspaceDatabase {
    findAllByUserId(ownerId: string): Promise<WorkspacesDatabaseResponse>;
    create(
        tx: TransactionClient,
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceDatabaseResponse>;
    delete(workspaceId: string): Promise<WorkspaceDatabaseResponse>;
    inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceDatabaseResponse>;
}
