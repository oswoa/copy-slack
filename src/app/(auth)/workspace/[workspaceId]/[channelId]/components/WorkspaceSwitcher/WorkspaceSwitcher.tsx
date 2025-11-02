"use client";

import { useUserWorkspaces } from "@/app/context/UserWorkspacesContext";
import { useRouter } from "next/navigation";

import WorkspaceList from "./WorkspaceList";

const WorkspaceSwitcher = () => {
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
