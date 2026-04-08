"use client";

import { Dispatch, SetStateAction } from "react";
import { Box, Divider, List, Typography } from "@mui/material";

import PostDetail from "./PostDetail";
import { Post } from "@/model/Post";

type PostListProps = {
    postList: Post[];
    setPostList: Dispatch<SetStateAction<Post[]>>;
};

const PostList = ({ postList, setPostList }: PostListProps) => {
    const mappedPostListGroupedByPostedDate = new Map<string, Post[]>();

    postList.forEach((post) => {
        const postedDate = post.getCreatedAtJstDate();
        if (!mappedPostListGroupedByPostedDate.has(postedDate)) {
            mappedPostListGroupedByPostedDate.set(postedDate, []);
        }
        mappedPostListGroupedByPostedDate.get(postedDate)?.push(post);
    });

    const postListGroupedByPostedDate = mappedPostListGroupedByPostedDate.entries().toArray();

    return (
        <List>
            {postListGroupedByPostedDate?.map(([key, groupedPostList]) => {
                return (
                    <Box key={key}>
                        <Divider sx={{ borderBottom: "1px solid", borderColor: "#35373b" }}>
                            <Typography>{key}</Typography>
                        </Divider>

                        <PostDetail
                            groupedPostList={groupedPostList}
                            basePostList={postList}
                            setBasePostList={setPostList}
                        />
                    </Box>
                );
            })}
        </List>
    );
};

export default PostList;
