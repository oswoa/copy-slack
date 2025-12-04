import { Button } from "@mui/material";
import React, { useState } from "react";

import { RegisterWorkspaceUserApiResponse } from "@/app/api/workspaces/[workspaceId]/[userId]/route";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import Toast from "@/app/common/components/Toast";
import UserSearchDialog from "@/app/common/components/UserSearchDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { getSocket } from "@/app/contants/socket";

import { useCurrentUser, SafeUser } from "@/app/context/CurrentUserContext";
import { Workspace } from "@prisma/client";

type InviteUserProps = {
    currentWorkspace: Workspace;
};

const InviteUser = ({ currentWorkspace }: InviteUserProps) => {
    const socket = getSocket();
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");

    const [selectedUser, setSelectedUser] = useState<SafeUser | undefined>(undefined);

    const currentUser = useCurrentUser();

    const onInvite = async () => {
        let errorDetail: ErrorDetail;

        try {
            const res = await fetch(
                `/api/workspaces/${currentWorkspace.workspaceId}/${selectedUser?.userId}`,
                {
                    method: "POST",
                }
            );
            const data: RegisterWorkspaceUserApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }
            socket.emit("invite-workspace", selectedUser, currentWorkspace);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        }
    };

    return (
        <>
            <Button variant="contained" color="secondary" onClick={() => setSearchDialogOpen(true)}>
                ユーザを招待
            </Button>
            {searchDialogOpen ? (
                <UserSearchDialog
                    open={searchDialogOpen}
                    onClose={() => setSearchDialogOpen(false)}
                    onSubmit={() => setConfirmDialogOpen(true)}
                    setSelectedUser={setSelectedUser}
                    currentUserId={currentUser.userId}
                />
            ) : null}
            <ConfirmDialog
                open={confirmDialogOpen}
                title={"ユーザの招待"}
                content={"選択したユーザをワークスペースに招待します"}
                onAgree={onInvite}
                onClose={() => setConfirmDialogOpen(false)}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />
        </>
    );
};

export default InviteUser;
