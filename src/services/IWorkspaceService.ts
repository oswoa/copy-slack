import { ErrorDetail } from "@/app/common/ErrorDetail";
import { CreatedWorkspaceRecord, WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

export type WorkspaceServiceResponse = {
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesServiceResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceService {
    getWorkspaces(userId: string): Promise<WorkspacesServiceResponse>;
    createWorkspace(userId: string, workspaceName?: string): Promise<WorkspaceServiceResponse>;
}
