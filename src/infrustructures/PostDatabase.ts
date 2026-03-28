import { PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { IPostDatabase, PostDatabaseResponse, PostRecord } from "./IPostDatabase";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

export class PostDatabase implements IPostDatabase {
    private prisma = new PrismaClient();

    async findAllById(userId: string, channelId: string): Promise<PostDatabaseResponse> {
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
}
