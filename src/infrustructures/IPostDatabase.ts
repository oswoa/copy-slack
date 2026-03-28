import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ChannelRecord } from "./IChannelDatabase";

// Postデータ
export type PostRecord = {
    postId: string;
    channelId: string;
    userId: string;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    displayName: string;
    imgUrl: string;
};

// Postレスポンス
export type PostDatabaseResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostDatabase {
    findAllById(userId: string, channelId: string): Promise<PostDatabaseResponse>;
}
