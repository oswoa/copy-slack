import { ErrorDetail } from "@/app/common/ErrorDetail";

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
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesDatabaseResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceDatabase {
    findAllByUserId(ownerId: string): Promise<WorkspacesDatabaseResponse>;
    create(userId: string, workspaceName?: string): Promise<WorkspaceDatabaseResponse>;
}
