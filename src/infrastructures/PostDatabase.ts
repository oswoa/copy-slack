import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import {
    IPostDatabase,
    PostsDatabaseResponse,
    PostRecord,
    PostDatabaseResponse,
} from "./IPostDatabase";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";

export class PostDatabase implements IPostDatabase {
    constructor(private readonly prisma = defaultPrisma) {}

    async findAllById(userId: string, channelId: string): Promise<PostsDatabaseResponse> {
        let errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
            ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
            HttpStatusCode.NotFound,
        );
        let posts: PostRecord[] = [];

        try {
            const res = await this.prisma.post.findMany({
                where: {
                    channelId: channelId,
                    userId,
                },
                select: {
                    postId: true,
                    channelId: true,
                    userId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            displayName: true,
                            profile: {
                                select: {
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
            });

            if (0 <= res.length) {
                posts = res.map((data) => {
                    const postRecord: PostRecord = {
                        postId: data.postId,
                        channelId: data.channelId,
                        userId: data.userId,
                        content: data.content || "",
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        displayName: data.user.displayName,
                        imgUrl: data.user.profile?.imageUrl || "",
                    };
                    return postRecord;
                });
                errorDetail = ErrorDetail.success();
            }

            return { posts, errorDetail };
        } catch (error) {
            return {
                posts,
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async create(
        tx: TransactionClient,
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostDatabaseResponse> {
        try {
            // ポスト登録
            const postData: Prisma.PostCreateInput = {
                channel: {
                    connect: {
                        channelId,
                    },
                },
                user: {
                    connect: {
                        userId,
                    },
                },
                content,
            };
            const postResponse = await tx.post.create({ data: postData });

            // 登録したポストをプロフィール画像付きで取得
            const profileResponse = await tx.post.findUnique({
                where: {
                    postId: postResponse.postId,
                },
                select: {
                    user: {
                        select: {
                            displayName: true,
                            profile: {
                                select: {
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
            });

            const post: PostDatabaseResponse = {
                post: {
                    postId: postResponse.postId,
                    channelId: postResponse.channelId,
                    userId: postResponse.userId,
                    content: postResponse.content || "",
                    createdAt: postResponse.createdAt,
                    updatedAt: postResponse.updatedAt,
                    displayName: profileResponse?.user.displayName || "",
                    imgUrl: profileResponse?.user.profile?.imageUrl || "",
                },
                errorDetail: ErrorDetail.success(),
            };
            return post;
        } catch (error) {
            throw error;
        }
    }

    async patch(
        tx: TransactionClient,
        postId: string,
        content: string,
    ): Promise<PostDatabaseResponse> {
        const data: Prisma.PostUpdateInput = {
            content,
        };

        try {
            const res = await tx.post.update({
                data,
                where: {
                    postId,
                },
                select: {
                    postId: true,
                    channelId: true,
                    userId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            displayName: true,
                            profile: {
                                select: {
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
            });
            const post: PostRecord = {
                postId: res.postId,
                channelId: res.channelId,
                userId: res.userId,
                content: res.content || "",
                createdAt: res.createdAt,
                updatedAt: res.updatedAt,
                displayName: res.user.displayName,
                imgUrl: res.user.profile?.imageUrl || "",
            };
            return { post, errorDetail: ErrorDetail.success() };
        } catch (error) {
            throw error;
        }
    }

    async delete(postId: string): Promise<PostDatabaseResponse> {
        try {
            const findPost = await this.prisma.post.findUnique({
                where: {
                    postId,
                },
            });
            if (!findPost) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                    ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
                    HttpStatusCode.NotFound,
                );
                return { errorDetail };
            }

            await this.prisma.post.delete({
                where: {
                    postId,
                },
            });

            return {
                post: {
                    postId: findPost.postId,
                    channelId: findPost.channelId,
                    userId: findPost.userId,
                    createdAt: findPost.createdAt,
                    updatedAt: findPost.updatedAt,
                    displayName: "",
                    imgUrl: "",
                },
                errorDetail: ErrorDetail.success(),
            };
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }
}
