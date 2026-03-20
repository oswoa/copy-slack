import { ErrorDetail } from "@/app/common/ErrorDetail";

// Workspaceデータ
export type WorkspaceRecord = {
    workspaceId: string;
    ownerId: string;
    workspaceName: string;
};

// Workspaceレスポンス
export type WorkspacesDatabaseResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceDatabase {
    findAllByUserId(ownerId: string): Promise<WorkspacesDatabaseResponse>;
}
