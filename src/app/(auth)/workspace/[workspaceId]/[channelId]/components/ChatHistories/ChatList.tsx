"use client";

import { Box, ListItem, ListItemIcon, Typography } from "@mui/material";
import { Chat } from "@/app/common/Chat";

type ChatListProps = {
    chatHistories: Chat[];
};

const ChatList = ({ chatHistories }: ChatListProps) => {
    return (
        <>
            {chatHistories.map((chat) => {
                return (
                    <ListItem key={chat.id}>
                        <Box>
                            <ListItemIcon>{chat.userId}</ListItemIcon>
                            <Typography>{chat.content}</Typography>
                        </Box>
                    </ListItem>
                );
            })}
        </>
    );
};

export default ChatList;
