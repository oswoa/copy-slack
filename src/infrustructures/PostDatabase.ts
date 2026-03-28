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

export class PostDatabase implements IPostDatabase {
    private prisma = new PrismaClient();

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
            return { posts, errorDetail: ErrorDetail.getFromPrismaError(error) };
        }
    }

    async createPost(
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
            const postResponse = await this.prisma.post.create({ data: postData });

            // 登録したポストをプロフィール画像付きで取得
            const profileResponse = await this.prisma.post.findUnique({
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
            const errorDetail = ErrorDetail.getFromPrismaError(error);
            return { errorDetail };
        }
    }
}
