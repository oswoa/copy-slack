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
                            <ListItemIcon sx={{ color: "#f8f8f8", mb: 0.5 }}>
                                {chat.userId}
                            </ListItemIcon>
                            <Typography sx={{ color: "#d1cec5", whiteSpace: "pre-line" }}>
                                {chat.content}
                            </Typography>
                        </Box>
                    </ListItem>
                );
            })}
        </>
    );
};

export default ChatList;
