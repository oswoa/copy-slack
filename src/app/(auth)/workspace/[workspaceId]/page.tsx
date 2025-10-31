"use client";

import { Avatar, Box, Grid, List, ListItem, ListItemAvatar, Typography } from "@mui/material";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/components/WorkspaceSwitcher";
import "./page.module.css";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HttpStatusCode } from "axios";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { GetChatHistoriesApiResponse } from "@/app/api/chat/[workspaceId]/route";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import Toast from "@/app/common/components/Toast";
import { Chat } from "@/app/common/Chat";
import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";

const Workspace = () => {
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
    const [chatHistories, setChatHistories] = useState<Chat[]>([]);
    const [channels, setChannels] = useState<string[]>([]);

    const userWorkspaces = useUserWorkspaces();
    const currentPath = usePathname();

    const fetchChannels = async () => {
        if (userWorkspaces.length === 0) {
            return;
        }

        const splits = currentPath.split("/workspace/");
        const currentWorkspaceId = splits[splits.length - 1];

        const workspace = userWorkspaces.find(
            (workspace) => workspace.workspaceId === currentWorkspaceId
        );
        if (!workspace) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        }
        setChannels(workspace.channels);
    };

    const fetchChatHistories = async () => {
        const splits = currentPath.split("/workspace/");
        const currentWorkspaceId = splits[splits.length - 1];

        const res = await fetch(`/api/chat/${currentWorkspaceId}`);
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
                    chat.chatId,
                    chat.workspaceId,
                    chat.channelId,
                    chat.userId,
                    chat.content,
                    chat.createdAt
                )
        );
        setChatHistories(extractedChatHistories!);
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
                sx={{ height: "100vh", mt: 2, mr: 2, pb: 4 }}
            >
                <Grid component={"nav"} size={"auto"}>
                    <WorkspaceSwitcher />
                </Grid>

                <Grid component={"aside"} size={2.8} sx={{ border: "1px solid", padding: 1 }}>
                    {/* サイドバー */}
                    <List>
                        {channels.map((channel) => {
                            return <ListItem key={channel}>{channel}</ListItem>;
                        })}
                    </List>
                </Grid>

                <Grid
                    container
                    direction={"column"}
                    component={"main"}
                    size={"grow"}
                    sx={{ justifyContent: "space-between" }}
                >
                    <Grid sx={{ border: "1px solid", height: "73%", padding: 1 }}>
                        <Suspense fallback={<div>loading...</div>}>
                            {/* チャット履歴 */}
                            <List>
                                {chatHistories.map((chat) => {
                                    return (
                                        <ListItem key={chat.chatId}>
                                            <Box>
                                                <ListItemAvatar>
                                                    <Avatar>{chat.userId}</Avatar>
                                                </ListItemAvatar>
                                                <Typography>{chat.content}</Typography>
                                            </Box>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Suspense>
                    </Grid>

                    <Grid sx={{ border: "1px solid", height: "25%", padding: 1 }}>chat input</Grid>
                </Grid>
            </Grid>
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default Workspace;
