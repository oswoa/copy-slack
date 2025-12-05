"use client";

import { Dispatch, SetStateAction } from "react";
import { Box, Divider, List, Typography } from "@mui/material";

import PostList from "./PostList";
import { jstDateString } from "@/app/common/util";
import { UserPost } from "@/app/api/posts/route";

type PostsProps = {
    postList: UserPost[];
    setPostList: Dispatch<SetStateAction<UserPost[]>>;
};

const PostHistories = ({ postList, setPostList }: PostsProps) => {
    const mappedPostList = new Map<string, UserPost[]>();

    postList.forEach((post) => {
        const date = new Date(post.createdAt);
        const dateKey = jstDateString(date);
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

                        <PostList
                            groupedByKeyPostList={groupedByKeyPostList}
                            postList={postList}
                            setPostList={setPostList}
                        />
                    </Box>
                );
            })}
        </List>
    );
};

export default PostHistories;
