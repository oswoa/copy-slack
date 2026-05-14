import { Prisma } from "@prisma/client";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { IProfileDatabase, ProfileDatabaseResponse, ProfileRecord } from "./IProfileDatabase";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { PROFILE_IMAGE_STORE_PATH, PROFILE_IMAGE_UPLOAD_PATH } from "@/app/constants/profile";
import { prisma as defaultPrisma, TransactionClient } from "@/app/lib/init";
import { ISaveImage } from "@/infrastructures/storage/ISaveImage";

export class ProfileDatabase implements IProfileDatabase {
    constructor(
        private storage: ISaveImage,
        private readonly prisma = defaultPrisma,
    ) {}

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
            // 画像のパスをDBに保存
            const data: Prisma.ProfileUpdateInput = {
                imageUrl: PROFILE_IMAGE_STORE_PATH + "/" + file.name,
            };
            const res = await tx.profile.update({
                data,
                where: {
                    userId,
                },
            });
            // 画像を保存
            this.storage.storeImage(file, PROFILE_IMAGE_UPLOAD_PATH || "");

            const uploadPath = [PROFILE_IMAGE_UPLOAD_PATH, file.name].join("/");
            this.storage.storeImage(file, uploadPath);

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
