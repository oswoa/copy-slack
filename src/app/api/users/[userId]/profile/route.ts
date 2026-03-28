import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/constants/api";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

import { Prisma } from "@prisma/client";
import { UPLOAD_PATH } from "@/app/constants/profile";
import { writeFile } from "fs/promises";

// APIレスポンス用
export type GetUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロフィール取得API
 * @param param1 ユーザID
 * @returns プロフィール画像のURL、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
}

// APIレスポンス用
export type RegisterUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロフィール登録API
 * @returns プロフィール画像のURL、エラー情報
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    const { userId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // 画像をローカルに保存
    if (file) {
        const imageUrl = `/${UPLOAD_PATH}/${file.name}`;
    }
}

// APIレスポンス用
export type UpdateUserProfileApiResponse = {
    imageUrl?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザプロフィール更新API
 * @returns プロフィール画像のURL、エラー情報
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
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
                ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                HttpStatusCode.InternalServerError,
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
