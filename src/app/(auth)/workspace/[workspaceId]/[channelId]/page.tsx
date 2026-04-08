"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { Avatar, Box, Grid, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import PostList from "./components/PostList/PostList";
import PostInput from "./components/PostInput/PostInput";
import ChannelList from "./components/ChannelsList/ChannelList";

import {
    GetChannelListApiResponse,
    RegisterChannelApiRequest,
    RegisterChannelApiResponse,
} from "@/app/api/channels/route";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { getSocket } from "@/app/constants/socket";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

import InputDialog, { InputDialogText } from "@/app/common/components/InputDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import Tooltip from "@/app/common/components/Tooltip";
import InviteUser from "./components/InviteUser/InviteUser";
import ProfileDialog from "@/app/common/components/ProfileDialog";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import {
    useLoginUserWorkspaces,
    useLoginUserWorkspacesUpdate,
} from "@/app/context/LoginUserWorkspacesContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";
import { useLoginUser } from "@/app/context/LoginUserContext";
import { User } from "@/model/User";
import { HttpStatusCode } from "axios";
import { Post } from "@/model/Post";
import {
    GetPostsApiResponse,
    RegisterPostApiRequest,
    RegisterPostApiResponse,
} from "@/app/api/posts/route";
import { Channel } from "@/model/Channel";
import { Workspace } from "@/model/Workspace";

const WorkspaceComponent = () => {
    const { workspaceId, channelId } = useParams<{
        workspaceId: string;
        channelId: string;
    }>();

    const refChatScroll = useRef<HTMLDivElement>(null);

    const loginUser = useLoginUser();
    const loginUserWorkspaces = useLoginUserWorkspaces();
    const loginUserWorkspaceUpdate = useLoginUserWorkspacesUpdate();
    const socket = getSocket();

    const { setOpenErrToast, setErrToastMsg } = useErrToast();
    const { setOpenSuccessToast, setSuccesssToastMsg } = useSuccessToast();

    const [currentChannel, setCurrentChannel] = useState<Channel>();
    const [currentChannelList, setCurrentChannelList] = useState<Channel[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
    const [currentPostList, setCurrentPostList] = useState<Post[]>([]);

    const [openCreateChannelDialog, setOpenCreateChannelDialog] = useState(false);
    const [openUpdateProfileDialog, setOpenUpdateProfileDialog] = useState(false);

    const handleOnSendPost = async (msg: string) => {
        let errorDetail: ErrorDetail;

        try {
            const req: RegisterPostApiRequest = {
                userId: loginUser.userId,
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
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const postedChat = new Post(
                resData.post!.postId,
                resData.post!.channelId,
                resData.post!.userId,
                resData.post!.content || "",
                new Date(resData.post!.createdAt),
                new Date(resData.post!.updatedAt),
                resData.post!.displayName,
                resData.post!.imgUrl,
            );
            setCurrentPostList([...currentPostList, postedChat]);
            socket.emit("send-message", postedChat);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_POST,
            );
            setOpenSuccessToast(true);
            setSuccesssToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
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
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            if (0 < resData.posts.length) {
                const posts = resData.posts.map((post) => {
                    return new Post(
                        post.postId,
                        post.channelId,
                        post.userId,
                        post.content || "",
                        new Date(post.createdAt),
                        new Date(post.updatedAt),
                        post.displayName,
                        post.imgUrl,
                    );
                });
                setCurrentPostList(posts);
            }
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
        }
    };

    const fetchChannelList = async () => {
        let errorDetail: ErrorDetail;

        const res = await fetch(`/api/channels?workspaceId=${workspaceId}`);
        const data: GetChannelListApiResponse = await res.json();

        errorDetail = ErrorDetail.getFromJson(data.errorDetail);
        if (!errorDetail.success) {
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const channels = data.channels;
        if (channels.length <= 0) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const channelList = channels.map(
            (channel) => new Channel(channel.channelId, channel.workspaceId, channel.channelName),
        );
        const currentChannel = channelList.find((channel) => channel.channelId === channelId);
        setCurrentChannel(currentChannel);
        setCurrentChannelList(channelList);
    };

    const handleOnSubmitCreateChannelDialog = async (dialogFormInput: InputDialogText) => {
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
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const createdChannel = new Channel(
                channelData.channel!.channelId,
                channelData.channel!.workspaceId,
                channelData.channel!.channelName,
            );
            setCurrentChannelList([...currentChannelList, createdChannel]);
            socket.emit("create-channel", createdChannel);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_CHANNEL,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_CHANNEL,
            );
            setOpenSuccessToast(true);
            setSuccesssToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
        }
    };

    useEffect(() => {
        fetchChannelList();
        fetchPostList();

        const targetWorkspace = loginUserWorkspaces.find(
            (workspace) => workspace.workspaceId === workspaceId,
        );
        setCurrentWorkspace(targetWorkspace);
    }, []);

    // クロージャーでstateの値が固定されるため、prevで最新状態を取得
    useEffect(() => {
        const onSocketReceiveMessage = (receivedPost: Post) => {
            setCurrentPostList((prev) => [...prev, receivedPost]);
        };

        const onSocketDeleteMessage = (postId: string) => {
            setCurrentPostList((prev) => {
                const filteredPostList = prev.filter((post) => post.postId !== postId);
                return filteredPostList;
            });
        };

        const onSocketEditMessage = (editedPost: Post) => {
            setCurrentPostList((prev) => {
                const newPostList = prev.map((post) => {
                    if (post.postId !== editedPost.postId) {
                        return post;
                    }
                    return new Post(
                        post.postId,
                        post.channelId,
                        post.userId,
                        editedPost.content,
                        post.createdAt,
                        editedPost.updatedAt,
                        post.displayName,
                        post.imgUrl,
                    );
                });
                return newPostList;
            });
        };

        const onSocketCreateChannel = (createdChannel: Channel) => {
            setCurrentChannelList((prev) => [...prev, createdChannel]);
        };

        const onSocketDeleteChannel = (deletedChannel: Channel) => {
            setCurrentChannelList((prev) => {
                const filteredChannelList = prev.filter(
                    (channel) => channel.channelId !== deletedChannel.channelId,
                );
                return filteredChannelList;
            });

            if (deletedChannel.channelId === channelId) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_DELETED_CURRENT_CHANNEL_BY_WORKSPACE_OWNER,
                    ERROR_MESSAGES.ERROR_CLIENT_DELETED_CURRENT_CHANNEL_BY_WORKSPACE_OWNER,
                    HttpStatusCode.Ok,
                );
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
            } else {
                const successDetail: SuccessDetail = new SuccessDetail(
                    SUCCESS_CODES.SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER,
                    SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER(
                        deletedChannel.channelName,
                    ),
                );
                setOpenSuccessToast(true);
                setSuccesssToastMsg(successDetail.msg);
            }
        };

        const onSocketDeleteWorkspace = (deletedWorkspace: Workspace) => {
            loginUserWorkspaceUpdate((prev) => {
                const filteredWorkspaceList = prev.filter(
                    (workspace) => workspace.workspaceId !== deletedWorkspace.workspaceId,
                );
                return filteredWorkspaceList;
            });

            if (deletedWorkspace.workspaceId === workspaceId) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_DELETED_CURRENT_WORKSPACE_BY_WORKSPACE_OWNER,
                    ERROR_MESSAGES.ERROR_CLIENT_DELETED_CURRENT_WORKSPACE_BY_WORKSPACE_OWNER,
                    HttpStatusCode.Ok,
                );
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
            } else {
                const successDetail: SuccessDetail = new SuccessDetail(
                    SUCCESS_CODES.SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER,
                    SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER(
                        deletedWorkspace.workspaceName,
                    ),
                );
                setOpenSuccessToast(true);
                setSuccesssToastMsg(successDetail.msg);
            }
        };

        const onSocketInviteWorkspace = (invitedWorkspace: Workspace) => {
            loginUserWorkspaceUpdate((prev) => [...prev, invitedWorkspace]);
        };

        const onSocketChangedUserDisplayName = (updatedUser: User) => {
            setCurrentPostList((prev) => {
                const user = prev.find((post) => post.userId === updatedUser.userId);
                if (!user) {
                    return prev;
                }

                return prev
                    .filter((post) => post.userId === updatedUser.userId)
                    .map((post) => {
                        return new Post(
                            post.postId,
                            post.channelId,
                            post.userId,
                            post.content,
                            post.createdAt,
                            post.updatedAt,
                            updatedUser.displayName,
                            post.imgUrl,
                        );
                    });
            });
        };

        // ハンドラの登録
        socket.on("receive-message", onSocketReceiveMessage);
        socket.on("delete-message", onSocketDeleteMessage);
        socket.on("edit-message", onSocketEditMessage);
        socket.on("create-channel", onSocketCreateChannel);
        socket.on("delete-channel", onSocketDeleteChannel);
        socket.on("delete-workspace", onSocketDeleteWorkspace);
        socket.on("invite-workspace", onSocketInviteWorkspace);
        socket.on("change-display-name", onSocketChangedUserDisplayName);

        // ルーム参加
        socket.emit("join-room", loginUser, workspaceId, channelId);
        return () => {
            // ハンドラの削除
            socket.off("receive-message", onSocketReceiveMessage);
            socket.off("delete-message", onSocketDeleteMessage);
            socket.off("edit-message", onSocketEditMessage);
            socket.off("create-channel", onSocketCreateChannel);
            socket.off("delete-channel", onSocketDeleteChannel);
            socket.off("delete-workspace", onSocketDeleteWorkspace);
            socket.off("invite-workspace", onSocketInviteWorkspace);
            socket.off("change-display-name", onSocketChangedUserDisplayName);

            // ルーム退出
            socket.emit("leave-room");
        };
    }, []);

    useEffect(() => {
        if (refChatScroll) {
            refChatScroll.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentPostList]);

    return (
        <>
            <Grid container direction={"row"} sx={{ height: "93vh", mt: 5, ml: 1, mr: 3 }}>
                {/* ワークスペースセクション */}
                <Grid size={"auto"}>
                    <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
                        <Box component={"nav"} sx={{ overflowY: "auto" }}>
                            <WorkspaceSwitcher
                                currentWorkspaceId={workspaceId}
                                maxNotCollapsedWorkspaceNum={5}
                            />
                        </Box>

                        <Tooltip title={"プロフィールを表示する"}>
                            <IconButton
                                onClick={() => setOpenUpdateProfileDialog(true)}
                                sx={{ scale: 1.3, width: "100%" }}
                            >
                                <Avatar
                                    src={loginUser.imageUrl}
                                    sx={{ width: 40, height: 40, borderRadius: 2 }}
                                />
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
                                <IconButton
                                    sx={{ mt: 2, pr: 3 }}
                                    onClick={() => setOpenCreateChannelDialog(true)}
                                >
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
                            channelList={currentChannelList}
                            setChannelList={setCurrentChannelList}
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
                        <PostList postList={currentPostList} setPostList={setCurrentPostList} />
                        <div ref={refChatScroll} />
                    </Grid>

                    <Grid sx={{ flex: 1 }}>
                        <PostInput onSend={handleOnSendPost} />
                    </Grid>
                </Grid>
            </Grid>

            {openCreateChannelDialog && (
                <InputDialog
                    open={openCreateChannelDialog}
                    title={"新規作成"}
                    content={"チャネル名を入力して下さい"}
                    label={"チャネル名"}
                    btnText={"作成"}
                    onSubmit={handleOnSubmitCreateChannelDialog}
                    onClose={() => setOpenCreateChannelDialog(false)}
                />
            )}
            {openUpdateProfileDialog && (
                <ProfileDialog
                    open={openUpdateProfileDialog}
                    onClose={() => setOpenUpdateProfileDialog(false)}
                />
            )}
        </>
    );
};

export default WorkspaceComponent;
