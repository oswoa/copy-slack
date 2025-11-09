"use client";

import { Post } from "@prisma/client";
import PostList from "./PostList";
import { Box, Divider, List, Typography } from "@mui/material";

type PostsProps = {
    postList: Post[];
};

const PostHistories = ({ postList }: PostsProps) => {
    const mappedPostList = new Map<string, Post[]>();

    postList.forEach((post) => {
        const date = new Date(post.createdAt);
        const dateKey = date.toLocaleDateString();
        if (!mappedPostList.has(dateKey)) {
            mappedPostList.set(dateKey, []);
        }
        mappedPostList.get(dateKey)?.push(post);
    });

    const groupedPostList = mappedPostList.entries().toArray();

    return (
        <List>
            {groupedPostList.map(([key, groupedByKeyPostList]) => {
                return (
                    <Box key={key}>
                        <Divider sx={{ borderBottom: "1px solid", borderColor: "#35373b" }}>
                            <Typography>{key}</Typography>
                        </Divider>

                        <PostList postList={groupedByKeyPostList} />
                    </Box>
                );
            })}
        </List>
    );
};

export default PostHistories;
