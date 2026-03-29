"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Avatar, Box, Grid, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/[channelId]/components/WorkspaceSwitcher/WorkspaceSwitcher";
import PostHistories from "./components/PostHistories/PostHistories";
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

import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";
import { useCurrentUser, useCurrentUserUpdate } from "@/app/context/CurrentUserContext";
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
    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();

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

            const postedChat = new Post(
                resData.post!.postId,
                resData.post!.channelId,
                resData.post!.userId,
                resData.post!.content || "",
                resData.post!.createdAt,
                resData.post!.updatedAt,
                resData.post!.displayName,
                resData.post!.imgUrl,
            );
            setPostList([...postList, postedChat]);
            socket.emit("send-message", postedChat);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_POST,
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
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
                const posts = resData.posts.map((post) => {
                    return new Post(
                        post.postId,
                        post.channelId,
                        post.userId,
                        post.content || "",
                        post.createdAt,
                        post.updatedAt,
                        post.displayName,
                        post.imgUrl,
                    );
                });
                setPostList(posts);
            }
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
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
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }

        const channelList = channels.map(
            (channel) => new Channel(channel.channelId, channel.workspaceId, channel.channelName),
        );
        const currentChannel = channelList.find((channel) => channel.channelId === channelId);
        setCurrentChannel(currentChannel);
        setChannelList(channelList);
    };

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

            const createdChannel = new Channel(
                channelData.channel!.channelId,
                channelData.channel!.workspaceId,
                channelData.channel!.channelName,
            );
            setChannelList([...channelList, createdChannel]);
            socket.emit("create-channel", createdChannel);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_CHANNEL,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_CHANNEL,
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
        }
    };

    useEffect(() => {
        fetchChannelList();
        fetchPostList();
    }, []);

    useEffect(() => {
        const targetWorkspace = userWorkspaces.find(
            (workspace) => workspace.workspaceId === workspaceId,
        );
        setCurrentWorkspace(targetWorkspace);
    }, [userWorkspaces]);

    // クロージャーでstateの値が固定されるため、prevで最新状態を取得
    useEffect(() => {
        const onSocketReceiveMessage = (receivedPost: Post) => {
            setPostList((prev) => [...prev, receivedPost]);
        };

        const onSocketDeleteMessage = (postId: string) => {
            setPostList((prev) => {
                const filteredPostList = prev.filter((post) => post.postId !== postId);
                return filteredPostList;
            });
        };

        const onSocketEditMessage = (editedPost: Post) => {
            setPostList((prev) => {
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
            setChannelList((prev) => [...prev, createdChannel]);
        };

        const onSocketDeleteChannel = (deletedChannel: Channel) => {
            setChannelList((prev) => {
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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
            } else {
                const successDetail: SuccessDetail = new SuccessDetail(
                    SUCCESS_CODES.SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER,
                    SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_OTHER_CHANNEL_BY_WORKSPACE_OWNER(
                        deletedChannel.channelName,
                    ),
                );
                setSuccessToastOpen(true);
                setSuccessToastMsg(successDetail.msg);
            }
        };

        const onSocketDeleteWorkspace = (deletedWorkspace: Workspace) => {
            userWorkspaceUpdate((prev) => {
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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
            } else {
                const successDetail: SuccessDetail = new SuccessDetail(
                    SUCCESS_CODES.SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER,
                    SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_OTHER_WORKSPACE_BY_WORKSPACE_OWNER(
                        deletedWorkspace.workspaceName,
                    ),
                );
                setSuccessToastOpen(true);
                setSuccessToastMsg(successDetail.msg);
            }
        };

        const onSocketInviteWorkspace = (invitedWorkspace: Workspace) => {
            userWorkspaceUpdate((prev) => [...prev, invitedWorkspace]);
        };

        const onSocketChangedUserDisplayName = (updatedUser: User) => {
            setPostList((prev) => {
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
        socket.emit("join-room", currentUser, workspaceId, channelId);
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
    }, [postList]);

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
                                <IconButton
                                    sx={{ mt: 2, pr: 3 }}
                                    onClick={() => setInputDialogOpen(true)}
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
                    onClose={() => setInputDialogOpen(false)}
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
