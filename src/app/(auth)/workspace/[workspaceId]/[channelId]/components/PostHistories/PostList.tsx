"use client";

import { Post } from "@prisma/client";

import { Box, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";

type PostListProps = {
    postList: Post[];
};

const PostList = ({ postList }: PostListProps) => {
    return (
        <>
            {postList.map((post) => {
                const createdAt = new Date(post.createdAt);
                // const updatedAt = new Date(post.updatedAt);

                return (
                    <ListItem key={post.postId}>
                        <Box sx={{ mb: 1 }}>
                            <Stack direction={"row"} sx={{ mb: 0.5, alignItems: "center" }}>
                                <ListItemIcon
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: "#f8f8f8",
                                    }}
                                >
                                    {post.userId}
                                </ListItemIcon>

                                <Box sx={{ fontSize: 14 }}>{createdAt.toLocaleDateString()}</Box>
                            </Stack>

                            <Typography sx={{ color: "#d1cec5", whiteSpace: "pre-line" }}>
                                {post.content}
                            </Typography>
                        </Box>
                    </ListItem>
                );
            })}
        </>
    );
};

export default PostList;
