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

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { getSocket } from "@/app/contants/socket";

import styles from "../../page.module.css";
import { useCurrentUser } from "@/app/context/CurrentUserContext";
import { useErrToast } from "@/app/context/ToastContext";

type PostListProps = {
    displayedPostList: Post[];
    setPostList: Dispatch<SetStateAction<Post[]>>;
    allPostList: Post[];
};

const PostList = ({ displayedPostList, setPostList, allPostList }: PostListProps) => {
    const currentUser = useCurrentUser();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();
    const socket = getSocket();

    const [selectedPostId, setSelectedPostId] = useState<number>();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const handleMenuIconOnClick = (e: HTMLElement, postId: number) => {
        setAenuAnchorEl(e);
        setSelectedPostId(postId);
    };

    const handleMenuOnClick = async () => {
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

            const filteredDisplayPostList = allPostList.filter(
                (post) => post.postId !== deletedPost.postId
            );
            setPostList(filteredDisplayPostList);
            socket.emit("delete-message", deletedPost);
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
            {displayedPostList.map((post) => {
                const createdAt = new Date(post.createdAt);

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
                                handleMenuOnClick();
                            },
                        },
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}

            <ConfirmDialog
                open={openConfirmDialog}
                title={"確認"}
                content={"選択したポストを削除しますか?"}
                onAgree={onDelete}
                onClose={() => setOpenConfirmDialog(false)}
            />
        </>
    );
};

export default PostList;
