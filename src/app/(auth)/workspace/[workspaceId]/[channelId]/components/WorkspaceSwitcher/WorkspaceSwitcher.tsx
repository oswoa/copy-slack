"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Workspace } from "@prisma/client";

import {
    Avatar,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import WorkspaceList from "./WorkspaceList";

import { RegisterChannelApiRequest, RegisterChannelApiResponse } from "@/app/api/channels/route";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";

import InputDialog, { DialogFormInput } from "@/app/common/components/InputDialog";
import Toast from "@/app/common/components/Toast";
import { ErrorDetail } from "@/app/common/ErrorDetail";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";
import { useCurrentUser } from "@/app/context/CurrentUserContext";

const WorkspaceSwitcher = () => {
    const router = useRouter();
    const userWorkspaces = useUserWorkspaces();
    const userWorkspacesUpdate = useUserWorkspacesUpdate();
    const currentUser = useCurrentUser();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastErrMsg, setToastErrMsg] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [collapseExtended, setCollapseExtended] = useState(false);

    const handleListOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath.includes(dstPath)) {
            return;
        }
        router.push(dstPath);
    };

    const onDialogOpen = () => setDialogOpen(true);
    const onDialogClose = () => setDialogOpen(false);
    const onDialogSubmit = async (dialogFormInput: DialogFormInput) => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース登録
            const registerWorkspaceName = dialogFormInput.text || "workspace name";
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                userId: currentUser.userId,
                workspaceName: registerWorkspaceName,
            };
            const registerWorkspaceRes = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerWorkspaceReq }),
            });
            const workspaceData: RegisterWorkspaceApiResponse = await registerWorkspaceRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdWorkspace = workspaceData.workspace;
            if (!createdWorkspace) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            // チャネル登録
            const registerChannelReq: RegisterChannelApiRequest = {
                workspaceId: createdWorkspace.workspaceId,
            };
            const registerChannelRes = await fetch("/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerChannelReq }),
            });
            const channelData: RegisterChannelApiResponse = await registerChannelRes.json();

            errorDetail = ErrorDetail.getFromJson(channelData.errorDetail);
            if (!errorDetail.success) {
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            const createdChannel = channelData.channel;
            if (!createdChannel) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
                );
                setToastOpen(true);
                setToastErrMsg(errorDetail.errMsg);
                return;
            }

            userWorkspacesUpdate([...userWorkspaces, createdWorkspace]);
        } catch (_) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN
            );
            setToastOpen(true);
            setToastErrMsg(errorDetail.errMsg);
        } finally {
            onDialogClose();
        }
    };

    // 表示するワークスペースの数に制限を掛け、Collapseで畳む
    const maxNotCollapsedWorkspaces = 5;
    let notCollapsedWorkspaces: Workspace[] = [];
    let collapsedWorkspaces: Workspace[] = [];

    if (maxNotCollapsedWorkspaces < userWorkspaces.length) {
        notCollapsedWorkspaces = userWorkspaces.slice(0, maxNotCollapsedWorkspaces);
        collapsedWorkspaces = userWorkspaces.slice(maxNotCollapsedWorkspaces);
    } else {
        notCollapsedWorkspaces = userWorkspaces;
    }

    return (
        <>
            <List disablePadding>
                <WorkspaceList workspaces={notCollapsedWorkspaces} onClick={handleListOnClick} />

                {0 < collapsedWorkspaces.length ? (
                    <>
                        <IconButton
                            color={"info"}
                            onClick={() => setCollapseExtended(!collapseExtended)}
                            sx={{ width: "80%" }}
                        >
                            <ExpandMoreIcon
                                sx={{
                                    transform: collapseExtended ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                }}
                            />
                        </IconButton>
                        <Collapse in={collapseExtended} unmountOnExit>
                            <WorkspaceList
                                workspaces={collapsedWorkspaces}
                                onClick={handleListOnClick}
                            />
                        </Collapse>
                    </>
                ) : null}

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
                    <ListItem onClick={onDialogOpen} disablePadding sx={{ pl: 1 }}>
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar sx={{ padding: "3px" }}>
                                    <AddIcon color={"action"} />
                                </Avatar>
                            </ListItemAvatar>
                        </ListItemButton>
                    </ListItem>
                </Tooltip>
            </List>
            <InputDialog
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
