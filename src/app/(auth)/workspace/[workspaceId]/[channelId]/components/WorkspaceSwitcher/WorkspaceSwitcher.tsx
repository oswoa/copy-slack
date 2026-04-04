"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    Avatar,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import WorkspaceList from "./WorkspaceList";

import {
    GetChannelListApiResponse,
    RegisterChannelApiRequest,
    RegisterChannelApiResponse,
} from "@/app/api/channels/route";
import {
    RegisterWorkspaceApiRequest,
    RegisterWorkspaceApiResponse,
} from "@/app/api/workspaces/route";
import { DeleteWorkspaceApiResponse } from "@/app/api/workspaces/[workspaceId]/route";

import InputDialog, { InputDialogText } from "@/app/common/components/InputDialog";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import Menu from "@/app/common/components/Menu";
import ConfirmDialog from "@/app/common/components/ConfirmDialog";
import Tooltip from "@/app/common/components/Tooltip";
import { SuccessDetail } from "@/app/common/SuccessDetail";

import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { getSocket } from "@/app/constants/socket";
import { SUCCESS_CODES } from "@/app/constants/successCode";
import { SUCCESS_MESSAGES } from "@/app/constants/successMessages";

import { useUserWorkspaces, useUserWorkspacesUpdate } from "@/app/context/UserWorkspacesContext";
import { useErrToast, useSuccessToast } from "@/app/context/ToastContext";

import workspaceStyles from "./WorkspaceList.module.css";
import pageStyles from "../../page.module.css";
import { User } from "@/model/User";
import { HttpStatusCode } from "axios";
import { Workspace } from "@/model/Workspace";

type WorkspaceSwitcherProps = {
    loginUser: User;
    workspaceId: string;
    maxNotCollapsedWorkspaceNum: number;
};

const WorkspaceSwitcher = ({
    loginUser,
    workspaceId,
    maxNotCollapsedWorkspaceNum,
}: WorkspaceSwitcherProps) => {
    const router = useRouter();
    const userWorkspaces = useUserWorkspaces();
    const userWorkspacesUpdate = useUserWorkspacesUpdate();
    const socket = getSocket();

    const { setErrToastOpen, setErrToastMsg } = useErrToast();
    const { setSuccessToastOpen, setSuccessToastMsg } = useSuccessToast();

    const [menuAnchorEl, setAenuAnchorEl] = useState<HTMLElement | null>(null);
    const openMenu = Boolean(menuAnchorEl);

    const [openInputDialog, setOpenInputDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [collapseExtended, setCollapseExtended] = useState(false);
    const [isDeletable, setIsDeletable] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
    const [notCollapsedWorkspaces, setNotCollapsedWorkspaces] = useState<Workspace[]>([]);
    const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Workspace[]>([]);

    const handleListOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath.includes(dstPath)) {
            return;
        }
        router.push(dstPath);
    };

    const onInputDialogOpen = () => setOpenInputDialog(true);
    const onInputDialogClose = () => setOpenInputDialog(false);
    const onInputDialogSubmit = async (dialogFormInput: InputDialogText) => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース登録
            const registerWorkspaceName = dialogFormInput.text || "workspace name";
            const registerWorkspaceReq: RegisterWorkspaceApiRequest = {
                userId: loginUser.userId,
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
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_CREATED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_CREATED_WORKSPACE,
            );
            userWorkspacesUpdate([
                ...userWorkspaces,
                new Workspace(
                    workspaceData.workspace!.workspaceId,
                    workspaceData.workspace!.ownerId,
                    workspaceData.workspace!.workspaceName,
                ),
            ]);
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
        } finally {
            onInputDialogClose();
        }
    };

    const handleMenuIconOnClick = (e: HTMLElement) => {
        setAenuAnchorEl(e);
    };

    const handleMenuOnClick = async () => {
        setOpenConfirmDialog(true);
    };

    const onDelete = async () => {
        let errorDetail: ErrorDetail;

        try {
            // ワークスペース削除
            const deleteRes = await fetch(`/api/workspaces/${workspaceId}`, {
                method: "DELETE",
            });
            const workspaceResponse: DeleteWorkspaceApiResponse = await deleteRes.json();

            errorDetail = ErrorDetail.getFromJson(workspaceResponse.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }

            const deletedWorkspace = new Workspace(
                workspaceResponse.workspace!.workspaceId,
                workspaceResponse.workspace!.ownerId,
                workspaceResponse.workspace!.workspaceName,
            );

            const existWorkspaceList = userWorkspaces.filter(
                (workspace) => workspace.workspaceId !== deletedWorkspace.workspaceId,
            );
            if (existWorkspaceList.length <= 0) {
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                    ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                    HttpStatusCode.BadRequest,
                );
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            userWorkspacesUpdate(existWorkspaceList);

            // ワークスペースの削除により遷移が発生するため、削除したワークスペースに所属しているチャンネルの情報を取得する
            const dstWorkspace = existWorkspaceList[0];
            const fetchRes = await fetch(`/api/channels?workspaceId=${dstWorkspace.workspaceId}`);
            const channelResponse: GetChannelListApiResponse = await fetchRes.json();

            errorDetail = ErrorDetail.getFromJson(channelResponse.errorDetail);
            if (!errorDetail.success) {
                setErrToastOpen(true);
                setErrToastMsg(errorDetail.errMsg);
                return;
            }
            socket.emit("delete-workspace", deletedWorkspace);

            const successDetail = new SuccessDetail(
                SUCCESS_CODES.SUCCESS_CLIENT_DELETED_WORKSPACE,
                SUCCESS_MESSAGES.SUCCESS_CLIENT_DELETED_WORKSPACE,
            );
            setSuccessToastOpen(true);
            setSuccessToastMsg(successDetail.msg);

            const dstChannel = channelResponse.channels[0];
            const dstPath = `/workspace/${dstWorkspace.workspaceId}/${dstChannel.channelId}`;
            router.replace(dstPath);
        } catch (_) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_UNKNOWN,
                ERROR_MESSAGES.ERROR_CLIENT_UNKNOWN,
                HttpStatusCode.BadRequest,
            );
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            return;
        }
    };

    const confirmWorkspaceDeletetable = () => {
        if (userWorkspaces.length === 1) {
            return false;
        }
        if (currentWorkspace?.ownerId !== loginUser.userId) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (userWorkspaces.length <= 0) {
            return;
        }

        const extractedWorkspace = userWorkspaces.find(
            (workspace) => workspace.workspaceId === workspaceId,
        );
        setCurrentWorkspace(extractedWorkspace);

        const isDeletable = confirmWorkspaceDeletetable();
        setIsDeletable(isDeletable);
    }, [userWorkspaces, currentWorkspace]);

    useEffect(() => {
        if (userWorkspaces.length <= 0) {
            return;
        }

        let notCollapsedWorkspaces: Workspace[] = [];
        let collapsedWorkspaces: Workspace[] = [];

        // 表示するワークスペースの数に制限を掛け、Collapseで畳む
        if (maxNotCollapsedWorkspaceNum < userWorkspaces.length) {
            notCollapsedWorkspaces = userWorkspaces.slice(0, maxNotCollapsedWorkspaceNum);
            collapsedWorkspaces = userWorkspaces.slice(maxNotCollapsedWorkspaceNum);
        } else {
            notCollapsedWorkspaces = userWorkspaces;
        }

        setNotCollapsedWorkspaces(notCollapsedWorkspaces);
        setCollapsedWorkspaces(collapsedWorkspaces);
    }, [userWorkspaces]);

    return (
        <>
            <List disablePadding>
                <WorkspaceList workspaces={notCollapsedWorkspaces} onClick={handleListOnClick} />

                {0 < collapsedWorkspaces.length ? (
                    <>
                        <IconButton
                            color={"info"}
                            onClick={() => setCollapseExtended(!collapseExtended)}
                            sx={{ width: "100%" }}
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

                {/* ワークスペース追加ボタン */}
                <Tooltip key={"addWorkspaceButton"} title={"ワークスペースを作成する"}>
                    <ListItem
                        className={`
                            ${pageStyles.selected}
                            ${workspaceStyles.workspaceItem}
                        `}
                        onClick={onInputDialogOpen}
                        disablePadding
                        sx={{ pl: 1 }}
                    >
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar sx={{ padding: "3px" }}>
                                    <AddIcon color={"action"} />
                                </Avatar>
                            </ListItemAvatar>
                        </ListItemButton>
                    </ListItem>
                </Tooltip>

                {/* その他ボタン */}
                {isDeletable ? (
                    <Tooltip key={"etc"} title={"その他"}>
                        <ListItem
                            className={workspaceStyles.workspaceItem}
                            disablePadding
                            sx={{ justifyContent: "center" }}
                        >
                            <IconButton
                                onClick={(e) => handleMenuIconOnClick(e.currentTarget)}
                                className={pageStyles.menuIcon}
                            >
                                <MoreVertIcon fontSize="large" />
                            </IconButton>
                        </ListItem>
                    </Tooltip>
                ) : null}
            </List>
            {openMenu && (
                <Menu
                    open={openMenu}
                    anchorEl={menuAnchorEl}
                    actions={[
                        {
                            label: "削除",
                            fire: () => {
                                handleMenuOnClick();
                            },
                        },
                        // TODO: ワークスペース名の変更処理を追加
                    ]}
                    onClose={() => setAenuAnchorEl(null)}
                />
            )}
            {openInputDialog ? (
                <InputDialog
                    open={openInputDialog}
                    title={"新規作成"}
                    content={"ワークスペース名を入力して下さい"}
                    label={"ワークスペース名"}
                    btnText={"作成"}
                    onSubmit={onInputDialogSubmit}
                    onClose={onInputDialogClose}
                />
            ) : null}
            {openConfirmDialog ? (
                <ConfirmDialog
                    open={openConfirmDialog}
                    title={"確認"}
                    content={"現在のワークスペースを削除しますか?"}
                    onAgree={onDelete}
                    onClose={() => setOpenConfirmDialog(false)}
                />
            ) : null}
        </>
    );
};

export default WorkspaceSwitcher;
