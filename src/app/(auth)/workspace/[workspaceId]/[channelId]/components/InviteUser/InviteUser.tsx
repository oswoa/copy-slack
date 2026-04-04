import React, { useState } from "react";
import { Workspace } from "@prisma/client";

import { Button } from "@mui/material";

import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import UserSearchDialog from "@/app/common/components/UserSearchDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";
import { getSocket } from "@/app/constants/socket";

import { useLoginUser } from "@/app/context/LoginUserContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";
import { User } from "@/model/User";
import { HttpStatusCode } from "axios";
import { InviteUserApiResponse } from "@/app/api/workspaces/[workspaceId]/[userId]/route";

type InviteUserProps = {
    currentWorkspace: Workspace;
};

const InviteUser = ({ currentWorkspace }: InviteUserProps) => {
    const socket = getSocket();
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();
    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    const loginUser = useLoginUser();

    const onInvite = async () => {
        let errorDetail: ErrorDetail;
        try {
            const res = await fetch(
                `/api/workspaces/${currentWorkspace.workspaceId}/${selectedUser?.userId}`,
                {
                    method: "POST",
                },
            );
            const data: InviteUserApiResponse = await res.json();

            errorDetail = ErrorDetail.getFromJson(data.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            socket.emit("invite-workspace", selectedUser, currentWorkspace);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_INVITED_USER,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_INVITED_USER,
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
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
                    loginUserId={loginUser.userId}
                />
            ) : null}
            {confirmDialogOpen ? (
                <ConfirmDialog
                    open={confirmDialogOpen}
                    title={"ユーザの招待"}
                    content={"選択したユーザをワークスペースに招待します"}
                    onAgree={onInvite}
                    onClose={() => setConfirmDialogOpen(false)}
                />
            ) : null}
        </>
    );
};

export default InviteUser;
