"use client";

import { Chat } from "@/app/common/Chat";
import ChatList from "./ChatList";
import { Box, Divider, List, Typography } from "@mui/material";

type ChatHistoriesProps = {
    chatHistories: Chat[];
};

const ChatHistories = ({ chatHistories }: ChatHistoriesProps) => {
    const mappedByDateChatHistory = new Map<string, Chat[]>();

    chatHistories.forEach((chat) => {
        const dateKey = chat.createdAt.toLocaleDateString();
        if (!mappedByDateChatHistory.has(dateKey)) {
            mappedByDateChatHistory.set(dateKey, []);
        }
        mappedByDateChatHistory.get(dateKey)?.push(chat);
    });

    const groupedChatHistory = mappedByDateChatHistory.entries().toArray();

    return (
        <List>
            {groupedChatHistory.map(([key, chats]) => {
                return (
                    <Box key={key}>
                        <Divider sx={{ borderBottom: "1px solid", borderColor: "#35373b" }}>
                            <Typography>{key}</Typography>
                        </Divider>

                        <ChatList chats={chats} />
                    </Box>
                );
            })}
        </List>
    );
};

export default ChatHistories;
