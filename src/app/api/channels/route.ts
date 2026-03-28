import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { channelService } from "@/app/lib/init";
import { ChannelRecord } from "@/infrustructures/IChannelDatabase";

// APIレスポンス用
export type GetChannelListApiResponse = {
    channels: ChannelRecord[];
    errorDetail: ErrorDetail;
};

/**
 * チャネル一覧取得API
 * @returns チャネル一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    const serviceResponse = await channelService.getChannels(workspaceId!);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<GetChannelListApiResponse>(
            { channels: [], errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<GetChannelListApiResponse>(
        {
            channels: serviceResponse.channels!,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}

// APIリクエスト用
export type RegisterChannelApiRequest = {
    workspaceId: string;
    channelName?: string;
};

// APIレスポンス用
export type RegisterChannelApiResponse = {
    channel?: ChannelRecord;
    errorDetail: ErrorDetail;
};

/**
 * チャネル登録API
 * @returns チャネル、エラー情報
 */
export async function POST(request: NextRequest) {
    const { workspaceId, channelName }: RegisterChannelApiRequest = await request.json();

    const serviceResponse = await channelService.createChannel(workspaceId!, channelName!);
    if (!serviceResponse.errorDetail.status) {
        return NextResponse.json<RegisterChannelApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<RegisterChannelApiResponse>(
        {
            channel: serviceResponse.channel,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
