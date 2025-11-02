"use client";

import { Box, ListItem, ListItemIcon, Stack, Typography } from "@mui/material";
import { Chat } from "@/app/common/Chat";

type ChatListProps = {
    chats: Chat[];
};

const ChatList = ({ chats }: ChatListProps) => {
    return (
        <>
            {chats.map((chat) => {
                return (
                    <ListItem key={chat.id}>
                        <Box sx={{ mb: 1 }}>
                            <Stack direction={"row"} sx={{ mb: 0.5, alignItems: "center" }}>
                                <ListItemIcon
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: "#f8f8f8",
                                    }}
                                >
                                    {chat.userId}
                                </ListItemIcon>

                                <Box sx={{ fontSize: 14 }}>
                                    {chat.createdAt.toLocaleTimeString()}
                                </Box>
                            </Stack>

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
