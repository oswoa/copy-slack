"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uuidv7 } from "uuidv7";

import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import WorkspaceList from "./WorkspaceList";

import Dialog, { DialogFormInput } from "@/app/common/components/Dialog";
import Toast from "@/app/common/components/Toast";

import { Workspace } from "@/app/common/Workspace";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";

import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";
import { useCurrentUser } from "@/app/context/CurrentUserContext";

/*
    TODO: ワークスペーススイッチャーに下記機能を追加
    // 1. ホバーしたワークスペースにツールチップでワークスペース名を表示
    2. 増えすぎると画面にはみ出すため、アコーディオンなのかスクロール制御を入れる
*/

const WorkspaceSwitcher = () => {
    const router = useRouter();
    const userWorkspaces = useUserWorkspaces();
    const userWorkspacesUpdate = useUserWorkspacesUpdate();
    const currentUser = useCurrentUser();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleListOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath.includes(dstPath)) {
            return;
        }
        router.push(dstPath);
    };

    const onDialogOpen = () => setDialogOpen(true);
    const onDialogClose = () => setDialogOpen(false);

    const onDialogSubmit = async (dialogFormInput: DialogFormInput) => {
        try {
            const workspaceName = dialogFormInput.text || "workspace name";
            const registerChannel = "general";

            // ワークスペース登録
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                workspaceId: uuidv7(),
                userId: currentUser.id,
                workspaceName,
                channels: [registerChannel],
            };
            const registerWorkspaceRes = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerWorkspaceReq }),
            });
            const workspaceData: RegisterWorkspaceApiResponse = await registerWorkspaceRes.json();

            if (registerWorkspaceRes.status !== HttpStatusCode.Created) {
                let errorDetail = ErrorDetail.getFromJson(workspaceData.errorDetail);
                if (!errorDetail) {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                        ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                    );
                }
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdWorkspace = Workspace.getFromJson(workspaceData.workspace);
            if (!createdWorkspace) {
                const errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            userWorkspacesUpdate([...userWorkspaces, createdWorkspace]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN()
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        } finally {
            onDialogClose();
        }
    };

    return (
        <>
            <List>
                <WorkspaceList workspaces={userWorkspaces} onClick={handleListOnClick} />

                <Tooltip
                    key={"addWorkspaceButton"}
                    title={"ワークスペースを作成する"}
                    placement={"right"}
                    slotProps={{
                        tooltip: {
                            sx: {
                                fontSize: ".8rem",
                            },
                        },
                    }}
                >
                    <ListItem onClick={onDialogOpen} disablePadding>
                        <ListItemAvatar>
                            <ListItemButton divider>
                                <Avatar sx={{ padding: "3px" }}>
                                    <AddIcon />
                                </Avatar>
                            </ListItemButton>
                        </ListItemAvatar>
                    </ListItem>
                </Tooltip>
            </List>
            <Dialog
                open={dialogOpen}
                title={"新規作成"}
                content={"ワークスペース名を入力して下さい"}
                label={"ワークスペース名"}
                btnText={"作成"}
                onSubmit={onDialogSubmit}
                onClose={onDialogClose}
            />
            <Toast msg={toastErrMsg} severity={"error"} open={toastOpen} setOpen={setToastOpen} />;
        </>
    );
};

export default WorkspaceSwitcher;
