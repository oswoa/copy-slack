import { z } from "zod";

// バリデーション用
const ChatSchema = z.object({
    id: z.string(),
    chatId: z.string(),
    workspaceId: z.string(),
    channelId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.date(),
});

export class Chat {
    private _id: string;
    private _chatId: string;
    private _workspaceId: string;
    private _channelId: string;
    private _userId: string;
    private _content: string;
    private _createdAt: Date;

    constructor(
        id: string,
        chatId: string,
        workspaceId: string,
        channelId: string,
        userId: string,
        content: string,
        createdAt: Date
    ) {
        this._id = id;
        this._chatId = chatId;
        this._workspaceId = workspaceId;
        this._channelId = channelId;
        this._userId = userId;
        this._content = content;
        this._createdAt = createdAt;
    }

    static getFromJson(value: unknown): Chat | undefined {
        const parsedChat = ChatSchema.safeParse(value);
        if (!parsedChat.success) {
            return undefined;
        }
        const { id, chatId, workspaceId, channelId, userId, content, createdAt } = parsedChat.data;
        return new Chat(id, chatId, workspaceId, channelId, userId, content, createdAt);
    }

    get id() {
        return this._id;
    }

    get chatId() {
        return this._chatId;
    }

    get workspaceId() {
        return this._workspaceId;
    }

    get channelId() {
        return this._channelId;
    }

    get userId() {
        return this._userId;
    }

    get content() {
        return this._content;
    }

    get createdAt() {
        return this._createdAt;
    }
}
