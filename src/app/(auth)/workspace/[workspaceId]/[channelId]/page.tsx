"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HttpStatusCode } from "axios";

import { Grid, Typography } from "@mui/material";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import ChannelList from "./components/Channels/Channels";
import { GetChatHistoriesApiResponse } from "@/app/api/chat/[workspaceId]/[channelId]/route";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { Chat } from "@/app/common/Chat";
import Toast from "@/app/common/components/Toast";
import { Workspace } from "@/app/common/Workspace";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";
import "./page.module.css";
import ChatHistories from "./components/ChatHistories/ChatHistories";

const WorkspaceComponent = () => {
    const { workspaceId, channelId } = useParams<{
        workspaceId: string;
        channelId: string;
    }>();
    const userWorkspaces = useUserWorkspaces();
    const router = useRouter();

    const [chatHistories, setChatHistories] = useState<Chat[]>([]);
    const [channels, setChannels] = useState<string[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const handleChannelOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath === dstPath) {
            return;
        }
        router.push(dstPath);
    };

    const fetchChatHistories = async () => {
        const res = await fetch(`/api/chat/${workspaceId}/${channelId}`);
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
    };

    const fetchChannels = async () => {
        if (userWorkspaces.length === 0) {
            return;
        }

        const workspace = userWorkspaces.find((workspace) => workspace.workspaceId === workspaceId);
        if (!workspace) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        }

        setCurrentWorkspace(workspace);
        setChannels(workspace.channels);
    };

    useEffect(() => {
        fetchChatHistories();
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [userWorkspaces]);

    return (
        <>
            <Grid
                container
                direction={"row"}
                spacing={2}
                sx={{ height: "92vh", mt: 5, mr: 2, pb: 0 }}
            >
                <Grid component={"nav"} size={"auto"}>
                    <WorkspaceSwitcher />
                </Grid>

                {/* チャネルリスト */}
                <Grid component={"aside"} size={2.8} sx={{ border: "1px solid" }}>
                    <Typography variant="h3" component={"h2"} sx={{ pl: 2, pt: 2 }}>
                        {"Channel"}
                    </Typography>
                    <ChannelList
                        channels={channels}
                        workspaceId={workspaceId}
                        onClick={handleChannelOnClick}
                    />
                </Grid>

                <Grid
                    container
                    direction={"column"}
                    component={"main"}
                    size={"grow"}
                    sx={{ justifyContent: "space-between" }}
                >
                    {/* チャット履歴 */}
                    <Grid sx={{ border: "1px solid", height: "73%" }}>
                        <Typography variant="h3" component={"h1"} sx={{ pl: 2, pt: 2 }}>
                            {currentWorkspace?.workspaceName}
                        </Typography>
                        <ChatHistories chatHistories={chatHistories} />
                    </Grid>

                    <Grid sx={{ border: "1px solid", height: "25%", padding: 1 }}>chat input</Grid>
                </Grid>
            </Grid>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default WorkspaceComponent;
