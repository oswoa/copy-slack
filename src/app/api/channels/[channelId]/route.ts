import { Channel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { prisma } from "@/app/constants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

// APIレスポンス用
export type DeleteChannelApiResponse = {
    channel?: Channel;
    errorDetail: ErrorDetail;
};

/**
 * チャネル削除API
 * @returns 削除されたチャネル、エラー情報
 */
export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let channel: Channel | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    const { channelId } = await params;
    const parsedChannelId = Number(channelId);

    try {
        const findRes = await prisma.channel.findUnique({
            where: {
                channelId: parsedChannelId,
            },
        });
        if (!findRes) {
            status = HttpStatusCode.NotFound;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS
            );
            return NextResponse.json({ channel, errorDetail }, { status });
        }

        channel = await prisma.channel.delete({
            where: {
                channelId: parsedChannelId,
            },
        });
        status = HttpStatusCode.Ok;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ channel, errorDetail }, { status });
    }
}
