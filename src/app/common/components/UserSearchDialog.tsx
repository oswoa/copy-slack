"use client";

import { GetUserListApiResponse } from "@/app/api/users/route";
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
import { ErrorDetail } from "../ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { useErrToast } from "@/app/context/ToastContext";
import { User } from "@/model/User";
import { HttpStatusCode } from "axios";

export type UserSearchDialogProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (user: User) => void;
    setSelectedUser: (user: User) => void;
    currentUserId: string;
};

const UserSearchDialog = ({
    open,
    onClose,
    onSubmit,
    setSelectedUser,
    currentUserId,
}: UserSearchDialogProps) => {
    const [users, setUsers] = useState<User[]>();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const fetchUsers = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const value = e.target.value;
            if (value === "") {
                return;
            }

            const res = await fetch(`/api/users?displayName=${e.target.value}`);
            const data: GetUserListApiResponse = await res.json();

            const errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                onClose();
                return;
            }

            // ログインユーザを除いたユーザ一覧を保存しておく
            // TODO: 既に所属してるユーザは除外
            const userList = data.userList.filter((user) => user.userId !== currentUserId);
            setUsers(userList);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            onClose();
        }
    };

    const debounced = useDebouncedCallback(fetchUsers, 1000);

    const onClick = (user: User) => {
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
