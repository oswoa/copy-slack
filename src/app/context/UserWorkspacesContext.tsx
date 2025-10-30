"use client";

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";
import { HttpStatusCode } from "axios";

import { Workspace } from "../common/Workspace";
import { useCurrentUser } from "./CurrentUserContext";
import { GetWorkspaceListApiResponse } from "../api/workspaces/route";

const UserWorkspacesContext = createContext<Workspace[] | undefined>(undefined);
const UserWorkspacesUpdateContext = createContext<
    Dispatch<SetStateAction<Workspace[]>> | undefined
>(undefined);

type UserWorkspacesProviderProps = {
    children: ReactNode;
};
export const UserWorkspacesProvider = ({ children }: UserWorkspacesProviderProps) => {
    const currentUser = useCurrentUser();
    const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);

    const fetchUserWorkspaces = async () => {
        const res = await fetch("/api/workspaces");
        if (res.status !== HttpStatusCode.Ok) {
            return;
        }

        const resData: GetWorkspaceListApiResponse = await res.json();
        const targetWorkspaces = resData.workspaces?.filter(
            (workspace) => workspace.userId === currentUser.id
        );
        if (!targetWorkspaces) {
            return;
        }

        setUserWorkspaces(
            targetWorkspaces.map(
                (workspace) =>
                    new Workspace(
                        workspace.workspaceId,
                        workspace.userId,
                        workspace.workspaceName,
                        workspace.channels
                    )
            )
        );
    };

    useEffect(() => {
        if (currentUser.id === "") {
            return;
        }
        fetchUserWorkspaces();
    }, [currentUser]);

    return (
        <UserWorkspacesContext.Provider value={userWorkspaces}>
            <UserWorkspacesUpdateContext.Provider value={setUserWorkspaces}>
                {children}
            </UserWorkspacesUpdateContext.Provider>
        </UserWorkspacesContext.Provider>
    );
};

export const useUserWorkspaces = () => {
    const ctx = useContext(UserWorkspacesContext);
    if (!ctx) {
        throw new Error("useUserWorkspaces must be used within a UserWorkspacesProvider");
    }
    return ctx;
};

export const useUserWorkspacesUpdate = () => {
    const ctx = useContext(UserWorkspacesUpdateContext);
    if (!ctx) {
        throw new Error("useUserWorkspacesUpdate must be used within a UserWorkspacesProvider");
    }
    return ctx;
};
