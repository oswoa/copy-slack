import { Channel, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { prisma } from "@/app/contants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";

// APIレスポンス用
export type GetChannelListApiResponse = {
    channels: Channel[];
    errorDetail: ErrorDetail;
};

/**
 * チャネル一覧取得API
 * @returns チャネル一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let channels: Channel[] = [];
    let status: HttpStatusCode = HttpStatusCode.Ok;

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId") || undefined;

    try {
        const res = await prisma.channel.findMany({
            where: {
                workspaceId,
            },
            orderBy: {
                channelId: "asc",
            },
        });

        if (0 < res.length) {
            channels = res;
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ channels, errorDetail }, { status });
    }
}

// APIリクエスト用
export type RegisterChannelApiRequest = {
    workspaceId: string;
    channelName?: string;
};

// APIレスポンス用
export type RegisterChannelApiResponse = {
    channel: Channel | undefined;
    errorDetail: ErrorDetail;
};

/**
 * チャネル登録API
 * @returns チャネル、エラー情報
 */
export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let channel: Channel | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const { workspaceId, channelName }: RegisterChannelApiRequest = await request.json();
        const data: Prisma.ChannelCreateInput = {
            channelName: channelName || "general",
            workspace: {
                connect: {
                    workspaceId: workspaceId,
                },
            },
        };
        channel = await prisma.channel.create({ data });

        if (channel) {
            status = HttpStatusCode.Created;
        }
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ channel, errorDetail }, { status });
    }
}
