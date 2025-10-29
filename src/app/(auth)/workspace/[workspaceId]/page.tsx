"use client";

import Link from "next/link";

import WorkspaceSwitcher from "@/app/(auth)/workspace/[workspaceId]/components/WorkspaceSwitcher";
import { useCurrentUser } from "@/app/context/CurrentUserContext";
import { useCurrentWorkspace } from "@/app/context/CurrentWorkspaceContext";

const Workspace = () => {
    const currentUser = useCurrentUser();
    const currentWorkspace = useCurrentWorkspace();

    return (
        <>
            <h2>User Info</h2>
            <div>id: {currentUser.id}</div>
            <div>email: {currentUser.email}</div>
            <div>token: {currentUser.token}</div>

            <h2>Workspace Info</h2>
            <div>id: {currentWorkspace.workspaceId}</div>
            <div>email: {currentWorkspace.workspaceName}</div>
            <div>token: {currentWorkspace.channels}</div>

            <div>
                <WorkspaceSwitcher />
            </div>

            <Link href={"/sample"}>Sampleへ遷移</Link>
        </>
    );
};

export default Workspace;
