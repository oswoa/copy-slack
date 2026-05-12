import { ErrorDetail } from "@/app/common/ErrorDetail";
import {
    CreatedWorkspaceRecord,
    WorkspaceRecord,
} from "@/infrastructures/workspace/IWorkspaceDatabase";

export type WorkspaceServiceResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type WorkspacesServiceResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export type CreatedWorkspaceServiceResponse = {
    workspace?: CreatedWorkspaceRecord;
    errorDetail: ErrorDetail;
};

export type InviteUserWorkspaceServiceResponse = {
    workspaceId?: string;
    userId?: string;
    errorDetail: ErrorDetail;
};

export interface IWorkspaceService {
    getWorkspaces(userId: string): Promise<WorkspacesServiceResponse>;
    createWorkspace(
        userId: string,
        workspaceName?: string,
    ): Promise<CreatedWorkspaceServiceResponse>;
    deleteWorkspace(workspaceId: string): Promise<WorkspaceServiceResponse>;
    inviteUserToWorkspace(
        workspaceId: string,
        userId: string,
    ): Promise<InviteUserWorkspaceServiceResponse>;
}
