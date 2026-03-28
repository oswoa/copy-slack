import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { IProfileDatabase, ProfileDatabaseResponse, ProfileRecord } from "./IProfileDatabase";
import { writeFile } from "fs/promises";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

export class ProfileDatabase implements IProfileDatabase {
    private prisma = new PrismaClient();

    async findByUserId(userId: string): Promise<ProfileDatabaseResponse> {
        let errorDetail: ErrorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
            ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
            HttpStatusCode.NotFound,
        );

        try {
            let profile: ProfileRecord | undefined;

            const res = await this.prisma.profile.findUnique({
                where: {
                    userId,
                },
            });
            if (res) {
                profile = {
                    profileId: res.profileId,
                    userId: res.userId,
                    imageUrl: res.imageUrl || "",
                };
            }
            return { profile, errorDetail };
        } catch (error) {
            errorDetail = ErrorDetail.getFromPrismaError(error);
            return { errorDetail };
        }
    }

    async create(userId: string, imageUrl: string, file?: File): Promise<ProfileDatabaseResponse> {
        try {
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const filePath = [process.cwd(), imageUrl].join("/public");
                await writeFile(filePath, buffer);
            }

            // 画像のパスをDBに保存
            const data: Prisma.ProfileCreateInput = {
                imageUrl,
                user: {
                    connect: {
                        userId,
                    },
                },
            };
            const res = await this.prisma.profile.create({ data });

            const profile: ProfileRecord = {
                profileId: res.profileId,
                userId: res.userId,
                imageUrl: res.imageUrl || "",
            };
            const errorDetail = new ErrorDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_PROFILE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_PROFILE,
                HttpStatusCode.Created,
                true,
            );
            return { profile, errorDetail };
        } catch (error) {
            const errorDetail = ErrorDetail.getFromPrismaError(error);
            return { errorDetail };
        }
    }
}
