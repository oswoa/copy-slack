import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";

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
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

export type PostsDatabaseResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostDatabase {
    findAllById(userId: string, channelId: string): Promise<PostsDatabaseResponse>;
    create(
        tx: TransactionClient,
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostDatabaseResponse>;
    patch(tx: TransactionClient, postId: string, content: string): Promise<PostDatabaseResponse>;
    delete(postId: string): Promise<PostDatabaseResponse>;
}
