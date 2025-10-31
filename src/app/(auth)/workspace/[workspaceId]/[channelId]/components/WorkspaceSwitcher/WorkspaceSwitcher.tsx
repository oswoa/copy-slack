"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";

import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

import { Workspace } from "@/app/common/Workspace";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import Toast from "@/app/common/components/Toast";

import WorkspaceList from "./WorkspaceList";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";
import { useRouter } from "next/navigation";

const WorkspaceSwitcher = () => {
    // const [toastOpen, setToastOpen] = useState(false);
    // const [toastErrMsg, setToastErrMsg] = useState("");
    const router = useRouter();
    const workspaces = useUserWorkspaces();

    const handleListOnClick = (srcPath: string, dstPath: string) => {
        if (srcPath.includes(dstPath)) {
            return;
        }
        router.push(dstPath);
    };

    return (
        <>
            <WorkspaceList workspaces={workspaces} onClick={handleListOnClick} />
        </>
    );
};

export default WorkspaceSwitcher;
