"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HttpStatusCode } from "axios";

import { Grid, Typography } from "@mui/material";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import ChatHistories from "./components/ChatHistories/ChatHistories";
import ChatInput from "./components/ChatInput/ChatInput";
import ChannelList from "./components/Channels/Channels";
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
    }, []);

    return (
        <>
            <Grid
                container
                direction={"row"}
                spacing={2}
                sx={{ height: "90vh", mt: 5, ml: 1, mr: 3 }}
            >
                <Grid component={"nav"} size={"auto"}>
                    <WorkspaceSwitcher />
                </Grid>

                {/* チャネルリスト */}
                <Grid
                    component={"aside"}
                    size={2.8}
                    sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid" }}
                >
                    <Typography variant="h3" component={"h2"} sx={{ pl: 2, pt: 2 }}>
                        {"Channel"}
                    </Typography>
                    <ChannelList workspaceId={workspaceId} onClick={handleChannelOnClick} />
                </Grid>

                <Grid
                    container
                    direction={"column"}
                    component={"main"}
                    size={"grow"}
                    sx={{ justifyContent: "space-between", ml: 1 }}
                >
                    {/* チャット履歴 */}
                    <Grid
                        sx={{
                            bgcolor: "background.paper",
                            borderRadius: 2,
                            height: "83%",
                            border: "1px solid",
                        }}
                    >
                        <Typography variant="h3" component={"h1"} sx={{ pl: 2, pt: 2 }}>
                            Workspace
                        </Typography>
                        <ChatHistories chatHistories={chatHistories} />
                    </Grid>

                    <Grid>
                        <ChatInput onSend={handleChatOnSend} />
                    </Grid>
                </Grid>
            </Grid>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default WorkspaceComponent;
