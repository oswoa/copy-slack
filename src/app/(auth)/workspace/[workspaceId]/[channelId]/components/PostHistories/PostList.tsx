"use client";

import { Post } from "@prisma/client";
import { useState } from "react";

import { Box, IconButton, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { jstTimeString } from "@/app/common/util";
import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import { DeletePostApiResponse } from "@/app/api/posts/[postId]/route";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import Toast from "@/app/common/components/Toast";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import styles from "../../page.module.css";

type PostListProps = {
    displayedPostList: Post[];
    setPostList: (postList: Post[]) => void;
    allPostList: Post[];
};

const PostList = ({ displayedPostList, setPostList, allPostList }: PostListProps) => {
    const [selectedPostId, setSelectedPostId] = useState<number>();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
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
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const deletedPost = data.post;
            if (!deletedPost) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const filteredDisplayPostList = allPostList.filter(
                (post) => post.postId !== deletedPost.postId
            );
            setPostList(filteredDisplayPostList);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
            return;
        } finally {
            setOpenConfirmDialog(false);
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

                        <IconButton
                            onClick={(e) => handleMenuIconOnClick(e.currentTarget, post.postId)}
                            className={styles.menuIcon}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </ListItem>
                );
            })}
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
            <ConfirmDialog
                open={openConfirmDialog}
                title={"確認"}
                content={"選択したポストを削除しますか?"}
                onAgree={onDelete}
                onClose={() => setOpenConfirmDialog(false)}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default PostList;
