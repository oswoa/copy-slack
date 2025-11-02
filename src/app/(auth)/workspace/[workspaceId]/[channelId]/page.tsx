"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HttpStatusCode } from "axios";

import { Grid, Typography } from "@mui/material";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import ChatHistories from "./components/ChatHistories/ChatHistories";
import ChatInput from "./components/ChatInput/ChatInput";
import ChannelList from "./components/ChannelsList/ChannelList";
import { GetChatHistoriesApiResponse } from "@/app/api/chats/[workspaceId]/[channelId]/route";
import { RegisterChatApiRequest, RegisterChatApiResponse } from "@/app/api/chats/route";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { Chat } from "@/app/common/Chat";
import Toast from "@/app/common/components/Toast";

import { useCurrentUser } from "@/app/context/CurrentUserContext";

import "./page.module.css";

const WorkspaceComponent = () => {
    const { workspaceId, channelId } = useParams<{
        workspaceId: string;
        channelId: string;
    }>();
    const router = useRouter();
    const refChatScroll = useRef<HTMLDivElement>(null);
    const currentUser = useCurrentUser();

    const [chatHistories, setChatHistories] = useState<Chat[]>([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const handleChannelOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath === dstPath) {
            return;
        }
        router.push(dstPath);
    };

    const handleChatOnSend = async (msg: string) => {
        try {
            const req: RegisterChatApiRequest = {
                workspaceId,
                channelId,
                userId: currentUser.id,
                content: msg,
                createdAt: new Date(),
            };
            const res = await fetch(`/api/chats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...req }),
            });
            const resData: RegisterChatApiResponse = await res.json();

            if (res.status !== HttpStatusCode.Created) {
                let errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
                if (!errorDetail) {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                        ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                    );
                }
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const chat = Chat.getFromJson(resData.chatHistory);
            if (!chat) {
                return;
            }

            setChatHistories([...chatHistories, chat]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    const fetchChatHistories = async () => {
        try {
            const res = await fetch(`/api/chats/${workspaceId}/${channelId}`);
            const resData: GetChatHistoriesApiResponse = await res.json();

            if (res.status !== HttpStatusCode.Ok) {
                let errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
                if (!errorDetail) {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                        ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                    );
                }
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const extractedChatHistories = resData.chatHistories?.map(
                (chat) =>
                    new Chat(
                        chat.id,
                        chat.workspaceId,
                        chat.channelId,
                        chat.userId,
                        chat.content,
                        chat.createdAt
                    )
            );
            setChatHistories(extractedChatHistories!);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    useEffect(() => {
        fetchChatHistories();
        console.log("fetchChatHistories");
    }, []);

    useEffect(() => {
        if (refChatScroll) {
            refChatScroll.current?.scrollIntoView({ behavior: "smooth" });
        }
        console.log("scroll");
    }, [chatHistories]);

    return (
        <>
            <Grid container direction={"row"} sx={{ height: "90vh", mt: 5, ml: 1, mr: 3 }}>
                <Grid component={"nav"} size={"auto"}>
                    <WorkspaceSwitcher />
                </Grid>

                {/* チャネル */}
                <Grid
                    container
                    direction={"column"}
                    size={2.5}
                    component={"aside"}
                    sx={{ height: "100%", color: "#bca8c2", bgcolor: "#1c0f1f" }}
                >
                    <Grid sx={{ flex: 1 }}>
                        <Typography variant="h3" component={"h2"} sx={{ pl: 2, pt: 2 }}>
                            {"Channel"}
                        </Typography>
                    </Grid>

                    <Grid sx={{ flex: 9, overflowY: "auto" }}>
                        <ChannelList workspaceId={workspaceId} onClick={handleChannelOnClick} />
                    </Grid>
                </Grid>

                {/* チャット */}
                <Grid
                    container
                    direction={"column"}
                    size={"grow"}
                    component={"main"}
                    sx={{ height: "100%", color: "#d1d2d3", bgcolor: "#1a1d21" }}
                >
                    <Grid sx={{ flex: 1 }}>
                        <Typography variant="h3" component={"h1"} sx={{ pl: 2, pt: 2 }}>
                            # {channelId}
                        </Typography>
                    </Grid>

                    <Grid sx={{ flex: 8, overflowY: "auto" }}>
                        <ChatHistories chatHistories={chatHistories} />
                        <div ref={refChatScroll} />
                    </Grid>

                    <Grid sx={{ flex: 1 }}>
                        <ChatInput onSend={handleChatOnSend} />
                    </Grid>
                </Grid>
            </Grid>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default WorkspaceComponent;
