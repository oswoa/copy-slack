"use client";

import { GetUserListApiResponse } from "@/app/api/users/route";
import { SafeUser } from "@/app/context/CurrentUserContext";
import {
    Dialog,
    Button,
    TextField,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
} from "@mui/material";

import { ChangeEvent, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export type UserSearchDialogProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (user: SafeUser) => void;
    setSelectedUser: (user: SafeUser) => void;
    currentUserId: string;
};

const UserSearchDialog = ({
    open,
    onClose,
    onSubmit,
    setSelectedUser,
    currentUserId,
}: UserSearchDialogProps) => {
    const [users, setUsers] = useState<SafeUser[]>();

    const fetchUsers = async (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            return;
        }

        const res = await fetch(`/api/users?displayName=${e.target.value}`);
        const data: GetUserListApiResponse = await res.json();

        // ログインユーザを除いたユーザ一覧を保存しておく
        // TODO: 既に所属してるユーザは除外
        const userList = data.userList.filter((user) => user.userId !== currentUserId);
        setUsers(userList);
    };

    const debounced = useDebouncedCallback(fetchUsers, 1000);

    const onClick = (user: SafeUser) => {
        setSelectedUser(user);
        onSubmit(user);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth keepMounted={false}>
            <DialogTitle>ユーザ検索</DialogTitle>

            <DialogContent>
                <DialogContentText>ユーザ名を入力してください</DialogContentText>
                <TextField
                    type="text"
                    required
                    id="userId"
                    label={"ユーザ名"}
                    margin="normal"
                    fullWidth
                    variant="standard"
                    onChange={debounced}
                />
                <List
                    sx={{
                        lineHeight: "2rem",
                        maxHeight: "calc(2rem * 5)",
                        overflowY: "auto",
                    }}
                    disablePadding
                >
                    {users?.map((user) => (
                        <ListItem
                            key={user.userId}
                            onClick={() => onClick(user)}
                            sx={{
                                border: "2px solid #ccc",
                                borderRadius: "4px",
                                mb: 0.8,
                                pl: 1,
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: "#f0f0f0",
                                },
                            }}
                            disableGutters
                        >
                            {user.displayName}
                        </ListItem>
                    ))}
                </List>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserSearchDialog;
