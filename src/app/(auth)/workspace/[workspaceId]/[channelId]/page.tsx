"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Channel, Post } from "@prisma/client";

import { Avatar, Grid, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import PostHistories from "./components/PostHistories/PostHistories";
import PostInput from "./components/PostInput/PostInput";
import ChannelList from "./components/ChannelsList/ChannelList";

import {
    GetPostsApiResponse,
    RegisterPostApiRequest,
    RegisterPostApiResponse,
} from "@/app/api/posts/route";
import { RegisterChannelApiRequest, RegisterChannelApiResponse } from "@/app/api/channels/route";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import Dialog, { DialogFormInput } from "@/app/common/components/Dialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
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

    const [postList, setPostList] = useState<Post[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleChannelOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath === dstPath) {
            return;
        }
        router.push(dstPath);
    };

    const handlePostOnSend = async (msg: string) => {
        let errorDetail: ErrorDetail;

        try {
            const req: RegisterPostApiRequest = {
                userId: currentUser.userId,
                channelId,
                content: msg,
            };
            const res = await fetch(`/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...req }),
            });
            const resData: RegisterPostApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const postedChat = resData.post;
            if (!postedChat) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            setPostList([...postList, postedChat]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    const fetchPostList = async () => {
        let errorDetail: ErrorDetail;

        try {
            const res = await fetch(`/api/posts?channelId=${channelId}`);
            const resData: GetPostsApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            if (0 < resData.posts.length) {
                setPostList(resData.posts);
            }
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    const onDialogOpen = () => setDialogOpen(true);
    const onDialogClose = () => setDialogOpen(false);
    const onDialogSubmit = async (dialogFormInput: DialogFormInput) => {
        let errorDetail: ErrorDetail;

        try {
            // チャネル登録
            const registerChannelReq: RegisterChannelApiRequest = {
                workspaceId,
                channelName: dialogFormInput.text,
            };
            const registerChannelRes = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerChannelReq }),
            });
            const channelData: RegisterChannelApiResponse = await registerChannelRes.json();

            errorDetail = ErrorDetail.getFromJson(channelData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdChannel = channelData.channel;
            if (!createdChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            setChannels([...channels, createdChannel]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        } finally {
            onDialogClose();
        }
    };

    useEffect(() => {
        fetchPostList();
    }, []);

    useEffect(() => {
        if (refChatScroll) {
            refChatScroll.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [postList]);

    return (
        <>
            <Grid container direction={"row"} sx={{ height: "90vh", mt: 5, ml: 1, mr: 3 }}>
                {/* ワークスペース切替 */}
                <Grid component={"nav"} size={"auto"} sx={{ height: "100%", overflowY: "auto" }}>
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
                    <Grid sx={{ flex: 0.5 }}>
                        <Stack
                            direction={"row"}
                            sx={{ justifyContent: "space-between", alignItems: "center" }}
                        >
                            <Typography variant="h3" component={"h2"} sx={{ pl: 2, pt: 2 }}>
                                {"Channel"}
                            </Typography>

                            <IconButton sx={{ mt: 2, pr: 2 }} onClick={onDialogOpen}>
                                <Avatar sx={{ padding: "3px" }}>
                                    <AddIcon color={"action"} />
                                </Avatar>
                            </IconButton>
                        </Stack>
                    </Grid>

                    <Grid sx={{ flex: 9.5, overflowY: "auto" }}>
                        <ChannelList
                            workspaceId={workspaceId}
                            channels={channels}
                            setChannels={setChannels}
                            onClick={handleChannelOnClick}
                        />
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
                        <PostHistories postList={postList} />
                        <div ref={refChatScroll} />
                    </Grid>

                    <Grid sx={{ flex: 1 }}>
                        <PostInput onSend={handlePostOnSend} />
                    </Grid>
                </Grid>
            </Grid>

            <Dialog
                open={dialogOpen}
                title={"新規作成"}
                content={"チャネル名を入力して下さい"}
                label={"チャネル名"}
                btnText={"作成"}
                onSubmit={onDialogSubmit}
                onClose={onDialogClose}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default WorkspaceComponent;
