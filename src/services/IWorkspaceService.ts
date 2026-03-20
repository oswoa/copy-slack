import { ErrorDetail } from "@/app/common/ErrorDetail";
import { WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

export type WorkspaceServiceResponse = {
    workspaces?: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

export interface IWorkspaceService {
    getWorkspaces(userId: string): Promise<WorkspaceServiceResponse>;
}
