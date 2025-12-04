"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Channel, Post, Workspace } from "@prisma/client";

import { Avatar, Box, Grid, IconButton, Stack, Typography } from "@mui/material";
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
import {
    GetChannelListApiResponse,
    RegisterChannelApiRequest,
    RegisterChannelApiResponse,
} from "@/app/api/channels/route";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { getSocket } from "@/app/contants/socket";

import InputDialog, { InputDialogText } from "@/app/common/components/InputDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { useCurrentUser, useCurrentUserUpdate } from "@/app/context/CurrentUserContext";

import "./page.module.css";
import Tooltip from "@/app/common/components/Tooltip";
import InviteUser from "./components/InviteUser/InviteUser";
import ProfileDialog from "@/app/common/components/ProfileDialog";
import { GetUserProfileApiResponse } from "@/app/api/users/[userId]/profile/route";
import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";
import { useErrToast } from "@/app/context/ToastContext";

const WorkspaceComponent = () => {
    const { workspaceId, channelId } = useParams<{
        workspaceId: string;
        channelId: string;
    }>();
    const router = useRouter();
    const refChatScroll = useRef<HTMLDivElement>(null);
    const currentUser = useCurrentUser();
    const currentUserUpdate = useCurrentUserUpdate();
    const userWorkspaces = useUserWorkspaces();
    const userWorkspaceUpdate = useUserWorkspacesUpdate();
    const socket = getSocket();

    const [postList, setPostList] = useState<Post[]>([]);
    const [channelList, setChannelList] = useState<Channel[]>([]);

    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);

    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
    const [currentChannel, setCurrentChannel] = useState<Channel>();

    const [imageUrl, setImageUrl] = useState("");

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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const postedChat = resData.post;
            if (!postedChat) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            setPostList([...postList, postedChat]);
            socket.emit("send-message", postedChat);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        }
    };

    const fetchPostList = async () => {
        let errorDetail: ErrorDetail;

        try {
            const res = await fetch(`/api/posts?channelId=${channelId}`);
            const resData: GetPostsApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
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
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        }
    };

    const fetchChannelList = async () => {
        let errorDetail: ErrorDetail;

        const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
        const data: GetChannelListApiResponse = await res.json();

        errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const channels = data.channels;
        if (channels.length <= 0) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const currentChannel = channels.find((channel) => channel.channelId === Number(channelId));
        setCurrentChannel(currentChannel);
        setChannelList(channels);
    };

    const fetchProfileImage = async () => {
        const res = await fetch(`/api/users/${currentUser.userId}/profile`);
        const data: GetUserProfileApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
        setImageUrl(data.imageUrl!);
    };

    const onDialogOpen = () => setInputDialogOpen(true);
    const onDialogClose = () => setInputDialogOpen(false);
    const onDialogSubmit = async (dialogFormInput: InputDialogText) => {
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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const createdChannel = channelData.channel;
            if (!createdChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            setChannelList([...channelList, createdChannel]);
            socket.emit("create-channel", createdChannel);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        } finally {
            onDialogClose();
        }
    };

    useEffect(() => {
        if (!currentUser.userId) {
            return;
        }
        const targetWorkspace = userWorkspaces.find(
            (workspace) => workspace.workspaceId === workspaceId
        );
        setCurrentWorkspace(targetWorkspace);
        fetchProfileImage();
    }, [currentUser]);

    useEffect(() => {
        fetchChannelList();
        fetchPostList();
    }, []);

    // クロージャーでstateの値が固定されるため、prevで最新状態を取得
    useEffect(() => {
        const onSocketReceiveMessage = (receivedPost: Post) => {
            setPostList((prev) => [...prev, receivedPost]);
        };

        const onSocketDeleteMessage = (deletedPost: Post) => {
            setPostList((prev) => {
                const filteredPostList = prev.filter((post) => post.postId !== deletedPost.postId);
                return filteredPostList;
            });
        };

        const onSocketCreateChannel = (createdChannel: Channel) => {
            setChannelList((prev) => [...prev, createdChannel]);
        };

        const onSocketDeleteChannel = (deletedChannel: Channel) => {
            setChannelList((prev) => {
                const filteredChannelList = prev.filter(
                    (channel) => channel.channelId !== deletedChannel.channelId
                );
                return filteredChannelList;
            });

            let errorDetail: ErrorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER,
                ERROR_MESSAGES.ERROR_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER(
                    deletedChannel.channelName
                )
            );
            if (deletedChannel.channelId === Number(channelId)) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_DELETED_CURRENT_CHANNEL_BY_WORKSPACE_OWNER,
                    ERROR_MESSAGES.ERROR_CLIENT_DELETED_CURRENT_CHANNEL_BY_WORKSPACE_OWNER
                );
            }
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        };

        const onSocketDeleteWorkspace = (deletedWorkspace: Workspace) => {
            userWorkspaceUpdate((prev) => {
                const filteredWorkspaceList = prev.filter(
                    (workspace) => workspace.workspaceId !== deletedWorkspace.workspaceId
                );
                return filteredWorkspaceList;
            });

            let errorDetail: ErrorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER,
                ERROR_MESSAGES.ERROR_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER(
                    deletedWorkspace.workspaceName
                )
            );
            if (deletedWorkspace.workspaceId === workspaceId) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_DELETED_CURRENT_WORKSPACE_BY_WORKSPACE_OWNER,
                    ERROR_MESSAGES.ERROR_CLIENT_DELETED_CURRENT_WORKSPACE_BY_WORKSPACE_OWNER
                );
            }
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        };

        const onSocketInviteWorkspace = (invitedWorkspace: Workspace) => {
            userWorkspaceUpdate((prev) => [...prev, invitedWorkspace]);
        };

        // ハンドラの登録
        socket.on("receive-message", onSocketReceiveMessage);
        socket.on("delete-message", onSocketDeleteMessage);
        socket.on("create-channel", onSocketCreateChannel);
        socket.on("delete-channel", onSocketDeleteChannel);
        socket.on("delete-workspace", onSocketDeleteWorkspace);
        socket.on("invite-workspace", onSocketInviteWorkspace);

        // チャネル参加
        socket.emit("join-channel", currentUser, channelId);
        return () => {
            // ハンドラの削除
            socket.off("receive-message", onSocketReceiveMessage);
            socket.off("delete-message", onSocketDeleteMessage);
            socket.off("create-channel", onSocketCreateChannel);
            socket.off("delete-channel", onSocketDeleteChannel);
            socket.off("delete-workspace", onSocketDeleteWorkspace);
            socket.off("invite-workspace", onSocketInviteWorkspace);

            // チャネル退出
            socket.emit("leave-channel");
        };
    }, []);

    useEffect(() => {
        if (refChatScroll) {
            refChatScroll.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [postList]);

    // ハイドレーションエラー対策。WorkspaceSwitcherでワークスペースを削除するための条件でownerIdとuserIdを比較している
    if (!currentUser.userId) {
        return null;
    }

    return (
        <>
            <Grid container direction={"row"} sx={{ height: "93vh", mt: 5, ml: 1, mr: 3 }}>
                {/* ワークスペースセクション */}
                <Grid size={"auto"}>
                    <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
                        <Box component={"nav"} sx={{ overflowY: "auto" }}>
                            <WorkspaceSwitcher
                                currentUser={currentUser}
                                workspaceId={workspaceId}
                                maxNotCollapsedWorkspaceNum={5}
                            />
                        </Box>

                        <Tooltip title={"プロフィールを表示する"}>
                            <IconButton
                                onClick={() => setProfileDialogOpen(true)}
                                sx={{ scale: 1.3, width: "100%" }}
                            >
                                {imageUrl ? (
                                    <Avatar
                                        src={imageUrl}
                                        sx={{ width: 40, height: 40, borderRadius: 2 }}
                                    />
                                ) : (
                                    <Avatar sx={{ width: 40, height: 40, borderRadius: 2 }} />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>

                {/* チャネルセクション */}
                <Grid
                    container
                    direction={"column"}
                    size={"auto"}
                    component={"aside"}
                    sx={{ minWidth: "20%", height: "100%", color: "#bca8c2", bgcolor: "#1c0f1f" }}
                >
                    <Grid sx={{ flex: 0.5 }}>
                        <Stack
                            direction={"row"}
                            sx={{ justifyContent: "space-between", alignItems: "center" }}
                        >
                            <Typography variant="h3" component={"h2"} sx={{ pl: 2, pt: 2 }}>
                                {"Channel"}
                            </Typography>

                            <Tooltip title={"チャネルを作成する"}>
                                <IconButton sx={{ mt: 2, pr: 3 }} onClick={onDialogOpen}>
                                    <Avatar sx={{ padding: "3px" }}>
                                        <AddIcon color={"action"} />
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Grid>

                    <Grid sx={{ flex: 9.5, overflowY: "auto" }}>
                        <ChannelList
                            workspaceId={workspaceId}
                            channelList={channelList}
                            setChannelList={setChannelList}
                            onClick={handleChannelOnClick}
                        />
                    </Grid>

                    <InviteUser currentWorkspace={currentWorkspace!} />
                </Grid>

                {/* チャットセクション */}
                <Grid
                    container
                    direction={"column"}
                    size={"grow"}
                    component={"main"}
                    sx={{ height: "100%", color: "#d1d2d3", bgcolor: "#1a1d21" }}
                >
                    <Grid sx={{ flex: 1 }}>
                        <Typography variant="h3" component={"h1"} sx={{ pl: 2, pt: 2 }}>
                            # {currentChannel?.channelName}
                        </Typography>
                    </Grid>

                    <Grid sx={{ flex: 8, overflowY: "auto" }}>
                        <PostHistories postList={postList} setPostList={setPostList} />
                        <div ref={refChatScroll} />
                    </Grid>

                    <Grid sx={{ flex: 1 }}>
                        <PostInput onSend={handlePostOnSend} />
                    </Grid>
                </Grid>
            </Grid>

            {inputDialogOpen ? (
                <InputDialog
                    open={inputDialogOpen}
                    title={"新規作成"}
                    content={"チャネル名を入力して下さい"}
                    label={"チャネル名"}
                    btnText={"作成"}
                    onSubmit={onDialogSubmit}
                    onClose={onDialogClose}
                />
            ) : null}
            {profileDialogOpen ? (
                <ProfileDialog
                    open={profileDialogOpen}
                    user={currentUser}
                    updateUser={currentUserUpdate}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    onClose={() => setProfileDialogOpen(false)}
                />
            ) : null}
        </>
    );
};

export default WorkspaceComponent;
