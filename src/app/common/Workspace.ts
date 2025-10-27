export class Workspace {
    private _workspaceId: string;
    private _workspaceName: string;

    constructor(workspaceId: string, workspaceName: string) {
        this._workspaceId = workspaceId;
        this._workspaceName = workspaceName;
    }

    get workspaceId(): string {
        return this._workspaceId;
    }

    get workspaceName(): string {
        return this._workspaceName;
    }
}
