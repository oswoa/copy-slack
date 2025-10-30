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

const CurrentWorkspaceContext = createContext<Workspace | undefined>(undefined);
const CurrentWorkspaceUpdateContext = createContext<
    Dispatch<SetStateAction<Workspace>> | undefined
>(undefined);

type CurrentWorkspaceProviderProps = {
    children: ReactNode;
};
export const CurrentWorkspaceProvider = ({ children }: CurrentWorkspaceProviderProps) => {
    const currentUser = useCurrentUser();
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(
        new Workspace("", "", "", [])
    );

    const fetchCurrentWorkspace = async () => {
        const res = await fetch("/api/workspaces");
        if (res.status !== HttpStatusCode.Ok) {
            return;
        }

        const resData: GetWorkspaceListApiResponse = await res.json();
        const target = resData.workspaces?.find((workspace) => workspace.userId === currentUser.id);
        if (!target) {
            return;
        }

        setCurrentWorkspace(
            new Workspace(target.workspaceId, target.userId, target.workspaceName, target.channels)
        );
    };

    useEffect(() => {
        if (currentUser.id === "") {
            return;
        }
        fetchCurrentWorkspace();
    }, [currentUser]);

    return (
        <CurrentWorkspaceContext.Provider value={currentWorkspace}>
            <CurrentWorkspaceUpdateContext.Provider value={setCurrentWorkspace}>
                {children}
            </CurrentWorkspaceUpdateContext.Provider>
        </CurrentWorkspaceContext.Provider>
    );
};

export const useCurrentWorkspace = () => {
    const ctx = useContext(CurrentWorkspaceContext);
    if (!ctx) {
        throw new Error("useCurrentWorkspace must be used within a CurrentWorkspaceProvider");
    }
    return ctx;
};

export const useCurrentWorkspaceUpdate = () => {
    const ctx = useContext(CurrentWorkspaceUpdateContext);
    if (!ctx) {
        throw new Error("useCurrentWorkspaceUpdate must be used within a CurrentWorkspaceProvider");
    }
    return ctx;
};
