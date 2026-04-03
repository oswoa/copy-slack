import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { IProfileDatabase, ProfileDatabaseResponse, ProfileRecord } from "./IProfileDatabase";
import { writeFile } from "fs/promises";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { PROFILE_IMAGE_PATH, PUBLIC } from "@/app/constants/profile";
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";

export class ProfileDatabase implements IProfileDatabase {
    constructor(private readonly prisma = defaultPrisma) {}

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
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async update(
        tx: TransactionClient,
        userId: string,
        file: File,
    ): Promise<ProfileDatabaseResponse> {
        try {
            const arrayBuffer = await file!.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const filePath = [PROFILE_IMAGE_PATH, file.name].join("/");
            const uploadPath = [process.cwd(), PUBLIC, filePath].join("/");
            await writeFile(uploadPath, buffer);

            // 画像のパスをDBに保存
            const data: Prisma.ProfileUpdateInput = {
                imageUrl: "/" + filePath,
            };
            const res = await tx.profile.update({
                data,
                where: {
                    userId,
                },
            });

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
            throw error;
        }
    }
}
