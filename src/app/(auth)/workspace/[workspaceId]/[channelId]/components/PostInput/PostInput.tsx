"use client";

import { useState, KeyboardEvent, FormEvent } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

type ChatInputProps = {
    onSend: (msg: string) => void;
};

const PostInput = ({ onSend }: ChatInputProps) => {
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
                bgcolor: "#222529",
                padding: 1,
                border: "1px solid #565856",
                borderRadius: 2,
            }}
        >
            <TextField
                multiline
                rows={3}
                value={text}
                onChange={handleOnChange}
                onKeyDown={handleOnKeyDown}
                placeholder="メッセージを入力…（Shift + Enterで送信）"
                variant="standard"
                fullWidth
                sx={{
                    mr: 1,
                    // TextField内の文字色を変更：https://qiita.com/tashinoso/items/ea6938b33d1a1cd926c8
                    "& .MuiInputBase-input": {
                        color: "#fff",
                    },
                }}
            />
            <IconButton
                type="submit"
                size="medium"
                sx={{
                    color: "#FFF",
                    bgcolor: "#007a5a",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#007a5a" },
                }}
                disabled={text.trim() === ""}
            >
                <SendIcon />
            </IconButton>
        </Box>
    );
};

export default PostInput;
