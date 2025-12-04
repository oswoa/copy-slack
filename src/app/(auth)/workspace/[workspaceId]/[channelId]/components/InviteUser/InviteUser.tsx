import React, { useState } from "react";
import { Workspace } from "@prisma/client";

import { Button } from "@mui/material";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import UserSearchDialog from "@/app/common/components/UserSearchDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { getSocket } from "@/app/contants/socket";

import { RegisterWorkspaceUserApiResponse } from "@/app/api/workspaces/[workspaceId]/[userId]/route";

import { useCurrentUser, SafeUser } from "@/app/context/CurrentUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

type InviteUserProps = {
    currentWorkspace: Workspace;
};

const InviteUser = ({ currentWorkspace }: InviteUserProps) => {
    const socket = getSocket();
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            socket.emit("invite-workspace", selectedUser, currentWorkspace);
            setSuccessToastOpen(true);
            setSuccessToastMsg("ユーザの招待に成功しました");
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
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
        </>
    );
};

export default InviteUser;
