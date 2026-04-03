import { Channel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { channelService } from "@/app/lib/init";

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
    { params }: { params: Promise<{ channelId: string }> },
) {
    const { channelId } = await params;

    const serviceResponse = await channelService.deleteChannel(channelId);
    if (!serviceResponse.errorDetail.status) {
        return NextResponse.json<DeleteChannelApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<DeleteChannelApiResponse>(
        {
            channel: serviceResponse.channel,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
