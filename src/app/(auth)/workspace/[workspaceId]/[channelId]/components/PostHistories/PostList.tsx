"use client";

import { Post } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";

import { Box, IconButton, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { jstTimeString } from "@/app/common/util";
import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import { DeletePostApiResponse } from "@/app/api/posts/[postId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { getSocket } from "@/app/constants/socket";

import { useCurrentUser } from "@/app/context/CurrentUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import styles from "../../page.module.css";

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

    const [selectedPostId, setSelectedPostId] = useState<number>();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, postId: number) => {
        setAenuAnchorEl(e);
        setSelectedPostId(postId);
    };

    const handleMenuOnDelete = async () => {
        setOpenConfirmDialog(true);
    };

    const handleMenuOnEdit = async () => {
        setOpenConfirmDialog(true);
    };

    const onDelete = async () => {
        try {
            const res = await fetch(`/api/posts/${selectedPostId}`, {
                method: "DELETE",
            });
            const data: DeletePostApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedPost = data.post;
            if (!deletedPost) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const filteredDisplayPostList = postList.filter(
                (post) => post.postId !== deletedPost.postId
            );
            setPostList(filteredDisplayPostList);
            socket.emit("delete-message", deletedPost);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_POST,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_POST
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
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
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Stack direction={"row"} sx={{ alignItems: "center" }}>
                                <ListItemIcon
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: "#f8f8f8",
                                    }}
                                >
                                    {post.userId}
                                </ListItemIcon>

                                <Box sx={{ fontSize: 14 }}>{jstTimeString(createdAt)}</Box>
                                {isEdited ? <Box>（編集済み）</Box> : null}
                            </Stack>

                            <Typography sx={{ color: "#d1cec5", whiteSpace: "pre-line" }}>
                                {post.content}
                            </Typography>
                        </Box>

                        {post.userId === currentUser.userId ? (
                            <IconButton
                                onClick={(e) => handleMenuIconOnClick(e.currentTarget, post.postId)}
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
                            label: "削除",
                            fire: () => {
                                handleMenuOnDelete();
                            },
                        },
                        {
                            label: "編集",
                            fire: () => {
                                handleMenuOnEdit();
                            },
                        },
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}

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
