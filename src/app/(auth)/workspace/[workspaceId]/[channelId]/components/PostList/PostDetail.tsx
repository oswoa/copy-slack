"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { Avatar, Box, IconButton, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import InputDialog, { InputDialogText } from "@/app/common/components/InputDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import {
    DeletePostApiResponse,
    UpdatePostApiRequest,
    UpdatePostApiResponse,
} from "@/app/api/posts/[postId]/route";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { getSocket } from "@/app/lib/socket";

import { useLoginUser } from "@/app/context/LoginUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import styles from "../../page.module.css";
import { HttpStatusCode } from "axios";
import { Post } from "@/model/Post";

type PostDetailProps = {
    groupedPostList: Post[];
    basePostList: Post[];
    setBasePostList: Dispatch<SetStateAction<Post[]>>;
};

const PostDetail = ({ groupedPostList, basePostList, setBasePostList }: PostDetailProps) => {
    const loginUser = useLoginUser();

    const { setOpenErrToast, setErrToastMsg } = useErrToast();
    const { setOpenSuccessToast, setSuccessToastMsg } = useSuccessToast();
    const socket = getSocket();

    const [openUpdatePostDialog, setOpenUpdatePostDialog] = useState(false);
    const [openDeletePostDialog, setOpenDeletePostDialog] = useState(false);

    const [selectedUserPost, setSelectedUserPost] = useState<Post>();
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, post: Post) => {
        setMenuAnchorEl(e);
        setSelectedUserPost(post);
    };

    const onDeletePost = async () => {
        try {
            const res = await fetch(`/api/posts/${selectedUserPost?.postId}`, {
                method: "DELETE",
            });
            const data: DeletePostApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedPost = new Post(
                data.post!.postId,
                data.post!.channelId,
                data.post!.userId,
                data.post!.content || "",
                new Date(data.post!.createdAt),
                new Date(data.post!.updatedAt),
                data.post!.displayName,
                data.post!.imgUrl,
            );
            const existPostList = basePostList.filter((post) => post.postId !== deletedPost.postId);
            setBasePostList(existPostList);
            socket.emit("delete-message", deletedPost.postId);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_POST,
            );
            setOpenSuccessToast(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
    };

    const onUpdatePost = async (dialogFormInput: InputDialogText) => {
        try {
            const req: UpdatePostApiRequest = {
                content: dialogFormInput.text,
            };
            const res = await fetch(`/api/posts/${selectedUserPost?.postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...req }),
            });
            const data: UpdatePostApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setOpenErrToast(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const editedPost = new Post(
                data.post!.postId,
                data.post!.channelId,
                data.post!.userId,
                data.post!.content || "",
                new Date(data.post!.createdAt),
                new Date(data.post!.updatedAt),
                data.post!.displayName,
                data.post!.imgUrl,
            );

            const editedPostList = basePostList.map((post) => {
                if (post.postId === editedPost.postId) {
                    return editedPost;
                }
                return post;
            });
            setBasePostList(editedPostList);
            socket.emit("edit-message", editedPost);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_UPDATED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_UPDATED_POST,
            );
            setOpenSuccessToast(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
    };

    return (
        <>
            {groupedPostList.map((post) => {
                const isEdited = post.createdAt.getTime() < post.updatedAt.getTime();

                return (
                    <ListItem
                        key={post.postId}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            pb: 1.3,
                        }}
                    >
                        <Stack direction={"row"} gap={1} sx={{ alignItems: "flex-start" }}>
                            <Box paddingTop={0.8}>
                                {/*
                                    制約：
                                    プロフィール画像はDBから取得したURLを基に表示するため、
                                    リロード or チャネルの変更で自動的に更新するものとする
                                */}
                                <Avatar
                                    src={post.imgUrl || ""}
                                    sx={{ width: 40, height: 40, borderRadius: 2 }}
                                />
                            </Box>

                            <Box>
                                <Stack
                                    direction={"row"}
                                    sx={{
                                        alignItems: "center",
                                        fontSize: 14,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            color: "#f8f8f8",
                                            paddingRight: 1,
                                        }}
                                    >
                                        {post.displayName}
                                    </ListItemIcon>

                                    <Box>{post.getCreatedAtJstTime()}</Box>
                                    {isEdited && (
                                        <Box>
                                            （編集済{" "}
                                            {`${post.getUpdatedAtJstDate()} ${post.getUpdatedAtJstTime()}`}
                                            ）
                                        </Box>
                                    )}
                                </Stack>

                                <Typography sx={{ color: "#d1cec5", whiteSpace: "pre-line" }}>
                                    {post.content}
                                </Typography>
                            </Box>
                        </Stack>

                        {post.userId === loginUser.userId && (
                            <IconButton
                                onClick={(e) => handleMenuIconOnClick(e.currentTarget, post)}
                                className={styles.menuIcon}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </ListItem>
                );
            })}

            {openMenu && (
                <Menu
                    open={openMenu}
                    anchorEl={menuAnchorEl}
                    actions={[
                        {
                            label: "編集",
                            fire: () => {
                                setOpenUpdatePostDialog(true);
                            },
                        },
                        {
                            label: "削除",
                            fire: () => {
                                setOpenDeletePostDialog(true);
                            },
                        },
                    ]}
                    onClose={() => setMenuAnchorEl(null)}
                />
            )}

            {openUpdatePostDialog && (
                <InputDialog
                    open={openUpdatePostDialog}
                    title={"ポスト編集"}
                    content={"ポストを編集してください"}
                    label={"更新内容"}
                    btnText={"更新"}
                    onSubmit={onUpdatePost}
                    onClose={() => setOpenUpdatePostDialog(false)}
                    editMode
                />
            )}
            {openDeletePostDialog && (
                <ConfirmDialog
                    open={openDeletePostDialog}
                    title={"確認"}
                    content={"選択したポストを削除しますか?"}
                    onAgree={onDeletePost}
                    onClose={() => setOpenDeletePostDialog(false)}
                />
            )}
        </>
    );
};

export default PostDetail;
