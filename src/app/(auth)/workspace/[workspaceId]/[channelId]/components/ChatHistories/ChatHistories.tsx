"use client";

import { Chat } from "@/app/common/Chat";
import ChatList from "./ChatList";
import { List } from "@mui/material";

type ChatHistoriesProps = {
    chatHistories: Chat[];
};

const ChatHistories = ({ chatHistories }: ChatHistoriesProps) => {
    return (
        <List>
            <ChatList chatHistories={chatHistories} />
        </List>
    );
};

export default ChatHistories;
