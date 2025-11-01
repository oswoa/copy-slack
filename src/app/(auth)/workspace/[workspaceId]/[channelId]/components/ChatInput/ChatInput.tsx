"use client";

import { useState, KeyboardEvent } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type ChatInputProps = {
    onSend: (msg: string) => void;
};

const ChatInput = ({ onSend }: ChatInputProps) => {
    const [text, setText] = useState("");

    const sendMessage = () => {
        const trimmedMsg = text.trim();
        if (!trimmedMsg) {
            return;
        }
        onSend(trimmedMsg);
        setText("");
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
            }}
            sx={{
                display: "flex",
                borderRadius: 2,
                padding: 1,
                bgcolor: "background.paper",
            }}
        >
            <TextField
                multiline
                rows={3}
                value={text}
                onChange={handleOnChange}
                onKeyDown={handleOnKeyDown}
                placeholder="メッセージを入力…（Shift + Enterで送信）"
                variant="outlined"
                fullWidth
                sx={{ mr: 1 }}
            />
            <IconButton size="small" type="submit" color="primary" disabled={text.trim() === ""}>
                <SendIcon />
                送信
            </IconButton>
        </Box>
    );
};

export default ChatInput;
