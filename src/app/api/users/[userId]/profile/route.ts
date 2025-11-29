import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { writeFile } from "fs/promises";
import { Prisma } from "@prisma/client";
import { UPLOAD_PATH } from "@/app/contants/profile";

// APIレスポンス用
export type GetUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロファイル画像取得API
 * @param param1 ユーザID
 * @returns プロファイル画像のURL、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
    let errorDetail: ErrorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
        ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS
    );
    let imageUrl: string | undefined;
    let status: HttpStatusCode = HttpStatusCode.NotFound;

    try {
        const { userId } = await params;
        const res = await prisma.profile.findUnique({
            where: {
                userId,
            },
        });
        if (res) {
            imageUrl = res.imageUrl || undefined;
            status = HttpStatusCode.Ok;
            errorDetail = ErrorDetail.success();
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ imageUrl, errorDetail }, { status });
    }
}

// APIレスポンス用
export type RegisterUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロフィール画像登録API
 * @returns プロファイル画像のURL、エラー情報
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    let errorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let imageUrl: string | undefined;

    try {
        const { userId } = await params;
        const formData = await request.formData();
        const file = formData.get("file") as File;

        // 画像をローカルに保存
        if (file) {
            imageUrl = `/${UPLOAD_PATH}/${file.name}`;
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
        const res = await prisma.profile.create({ data });

        imageUrl = res.imageUrl || undefined;
        return NextResponse.json({ imageUrl, errorDetail }, { status });
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ imageUrl, errorDetail }, { status });
    }
}

// APIレスポンス用
export type UpdateUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロフィール画像更新API
 * @returns プロファイル画像のURL、エラー情報
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    let errorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let imageUrl: string | undefined;

    try {
        const { userId } = await params;
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            status = HttpStatusCode.InternalServerError;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_UNKNOWN,
                ERROR_MESSAGES.ERROR_SERVER_UNKNOWN
            );
            return NextResponse.json({ imageUrl, errorDetail }, { status });
        }

        // 画像をローカルに保存
        imageUrl = `/${UPLOAD_PATH}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = [process.cwd(), imageUrl].join("/public");
        await writeFile(filePath, buffer);

        // 画像のパスをDBに保存
        const data: Prisma.ProfileUpdateInput = {
            imageUrl,
            user: {
                connect: {
                    userId,
                },
            },
        };
        const res = await prisma.profile.update({
            where: {
                userId,
            },
            data,
        });
        imageUrl = res.imageUrl || undefined;
        return NextResponse.json({ imageUrl, errorDetail }, { status });
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ imageUrl, errorDetail }, { status });
    }
}
