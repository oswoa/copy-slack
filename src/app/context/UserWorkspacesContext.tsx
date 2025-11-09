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
import { Workspace } from "@prisma/client";

import { GetWorkspaceListApiResponse } from "../api/workspaces/route";

import { ErrorDetail } from "../common/ErrorDetail";

import { useCurrentUser } from "./CurrentUserContext";

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
        if (currentUser.userId === "") {
            return;
        }

        const res = await fetch(`/api/workspaces?ownerId=${currentUser.userId}`);
        const resData: GetWorkspaceListApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
        if (!errorDetail.success) {
            return;
        }
        const targetWorkspaces = resData.workspaces;
        if (!targetWorkspaces) {
            return;
        }
        setUserWorkspaces(targetWorkspaces);
    };

    useEffect(() => {
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
