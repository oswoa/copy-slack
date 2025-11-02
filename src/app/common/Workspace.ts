import { z } from "zod";

// バリデーション用
const WorkspaceSchema = z.object({
    workspaceId: z.string(),
    userId: z.string(),
    workspaceName: z.string(),
    channels: z.array(z.string()),
});

export class Workspace {
    private _workspaceId: string;
    private _userId: string;
    private _workspaceName: string;
    private _channels: string[];

    constructor(workspaceId: string, userId: string, workspaceName: string, channels: string[]) {
        this._workspaceId = workspaceId;
        this._userId = userId;
        this._workspaceName = workspaceName;
        this._channels = channels;
    }

    static getFromJson(value: unknown): Workspace {
        const parsedWorkspace = WorkspaceSchema.safeParse(value);
        if (!parsedWorkspace.success) {
            throw new Error(parsedWorkspace.error.message);
        }
        const { workspaceId, userId, workspaceName, channels } = parsedWorkspace.data;
        return new Workspace(workspaceId, userId, workspaceName, channels);
    }

    get workspaceId(): string {
        return this._workspaceId;
    }

    get userId(): string {
        return this._userId;
    }

    get workspaceName(): string {
        return this._workspaceName;
    }

    get channels(): string[] {
        return this._channels;
    }
}
