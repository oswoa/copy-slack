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

import { GetWorkspaceListApiResponse } from "../api/workspaces/route";
import { ErrorDetail } from "../common/ErrorDetail";
import { useLoginUser } from "./LoginUserContext";
import { Workspace } from "@/model/Workspace";

const UserWorkspacesContext = createContext<Workspace[] | undefined>(undefined);
const UserWorkspacesUpdateContext = createContext<
    Dispatch<SetStateAction<Workspace[]>> | undefined
>(undefined);

type UserWorkspacesProviderProps = {
    children: ReactNode;
};
export const UserWorkspacesProvider = ({ children }: UserWorkspacesProviderProps) => {
    const loginUser = useLoginUser();
    const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);

    const fetchUserWorkspaces = async () => {
        const res = await fetch(`/api/workspaces?ownerId=${loginUser.userId}`);
        const resData: GetWorkspaceListApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
        if (!errorDetail.success) {
            return;
        }
        setUserWorkspaces(
            resData.workspaces.map((workspace) => {
                return new Workspace(
                    workspace.workspaceId,
                    workspace.ownerId,
                    workspace.workspaceName,
                );
            }),
        );
    };

    useEffect(() => {
        fetchUserWorkspaces();
    }, [loginUser]);

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
