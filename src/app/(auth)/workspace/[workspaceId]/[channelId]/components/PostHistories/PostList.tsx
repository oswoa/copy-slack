"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { Avatar, Box, IconButton, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { jstTimeString } from "@/app/common/util";
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
import { getSocket } from "@/app/constants/socket";

import { useCurrentUser } from "@/app/context/CurrentUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import styles from "../../page.module.css";
import { HttpStatusCode } from "axios";
import { Post } from "@/model/Post";

type PostListProps = {
    groupedByKeyPostList: Post[];
    postList: Post[];
    setPostList: Dispatch<SetStateAction<Post[]>>;
};

const PostList = ({ groupedByKeyPostList, postList, setPostList }: PostListProps) => {
    const currentUser = useCurrentUser();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();
    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();
    const socket = getSocket();

    const [selectedUserPost, setSelectedUserPost] = useState<Post>();
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, post: Post) => {
        setAenuAnchorEl(e);
        setSelectedUserPost(post);
    };

    const handleMenuOnDelete = async () => {
        setOpenConfirmDialog(true);
    };

    const handleMenuOnEdit = async () => {
        setInputDialogOpen(true);
    };

    const onDelete = async () => {
        try {
            const res = await fetch(`/api/posts/${selectedUserPost?.postId}`, {
                method: "DELETE",
            });
            const data: DeletePostApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedPost = new Post(
                data.post!.postId,
                data.post!.channelId,
                data.post!.userId,
                data.post!.content || "",
                data.post!.createdAt,
                data.post!.updatedAt,
                data.post!.displayName,
                data.post!.imgUrl,
            );
            const existPostList = postList.filter((post) => post.postId !== deletedPost.postId);
            setPostList(existPostList);
            socket.emit("delete-message", deletedPost.postId);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_POST,
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
            return;
        }
    };

    const onDialogSubmit = async (dialogFormInput: InputDialogText) => {
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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const editedPost = new Post(
                data.post!.postId,
                data.post!.channelId,
                data.post!.userId,
                data.post!.content || "",
                data.post!.createdAt,
                data.post!.updatedAt,
                data.post!.displayName,
                data.post!.imgUrl,
            );

            const editedPostList = postList.map((post) => {
                if (post.postId === editedPost.postId) {
                    return editedPost;
                }
                return post;
            });
            setPostList(editedPostList);
            socket.emit("edit-message", editedPost);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_UPDATED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_UPDATED_POST,
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
            return;
        }
    };

    return (
        <>
            {groupedByKeyPostList.map((post) => {
                const createdAt = new Date(post.createdAt);
                const updatedAt = new Date(post.updatedAt);
                const isEdited = createdAt < updatedAt;

                return (
                    <ListItem
                        key={post.postId}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Stack direction={"row"} gap={1} sx={{ alignItems: "flex-start" }}>
                            <Box paddingTop={0.8}>
                                {/* プロフィール画像はページのリロード or チャネルの変更で更新されるものとする */}
                                <Avatar
                                    src={post.imgUrl || ""}
                                    sx={{ width: 40, height: 40, borderRadius: 2 }}
                                />
                            </Box>

                            <Box>
                                <Stack direction={"row"} sx={{ alignItems: "center" }}>
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

                                    <Box sx={{ fontSize: 14 }}>{jstTimeString(createdAt)}</Box>
                                    {isEdited ? <Box>（編集済み）</Box> : null}
                                </Stack>

                                <Typography sx={{ color: "#d1cec5", whiteSpace: "pre-line" }}>
                                    {post.content}
                                </Typography>
                            </Box>
                        </Stack>

                        {post.userId === currentUser.userId ? (
                            <IconButton
                                onClick={(e) => handleMenuIconOnClick(e.currentTarget, post)}
                                className={styles.menuIcon}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        ) : null}
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
                                handleMenuOnEdit();
                            },
                        },
                        {
                            label: "削除",
                            fire: () => {
                                handleMenuOnDelete();
                            },
                        },
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}

            {inputDialogOpen ? (
                <InputDialog
                    open={inputDialogOpen}
                    title={"ポスト編集"}
                    content={"ポストを編集してください"}
                    label={"更新内容"}
                    btnText={"更新"}
                    onSubmit={onDialogSubmit}
                    onClose={() => setInputDialogOpen(false)}
                    editMode
                />
            ) : null}
            {openConfirmDialog ? (
                <ConfirmDialog
                    open={openConfirmDialog}
                    title={"確認"}
                    content={"選択したポストを削除しますか?"}
                    onAgree={onDelete}
                    onClose={() => setOpenConfirmDialog(false)}
                />
            ) : null}
        </>
    );
};

export default PostList;
