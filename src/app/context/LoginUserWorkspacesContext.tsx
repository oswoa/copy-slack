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
import { useErrToast } from "./ToastContext";
import { useRouter } from "next/navigation";
import Loading from "../loading";
import { PageFactory } from "../constants/pageUrl";

const LoginUserWorkspacesContext = createContext<Workspace[]>([]);
const LoginUserWorkspacesUpdateContext = createContext<
    Dispatch<SetStateAction<Workspace[]>> | undefined
>(undefined);

type LoginUserWorkspacesProviderProps = {
    children: ReactNode;
};
export const LoginUserWorkspacesProvider = ({ children }: LoginUserWorkspacesProviderProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const loginUser = useLoginUser();
    const [loginUserWorkspaces, setLoginUserWorkspaces] = useState<Workspace[]>([]);

    const { setOpenErrToast, setErrToastMsg } = useErrToast();

    const fetchUserWorkspaces = async () => {
        const res = await fetch(`/api/workspaces?ownerId=${loginUser.userId}`);
        const resData: GetWorkspaceListApiResponse = await res.json();

        const errorDetail = ErrorDetail.getFromJson(resData.errorDetail);
        if (!errorDetail.success) {
            setOpenErrToast(true);
            setErrToastMsg(errorDetail.errMsg);
            router.replace(PageFactory.GetErrorURL());
        }
        setLoginUserWorkspaces(
            resData.workspaces.map((workspace) => {
                return new Workspace(
                    workspace.workspaceId,
                    workspace.ownerId,
                    workspace.workspaceName,
                );
            }),
        );
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUserWorkspaces();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <LoginUserWorkspacesContext.Provider value={loginUserWorkspaces}>
            <LoginUserWorkspacesUpdateContext.Provider value={setLoginUserWorkspaces}>
                {children}
            </LoginUserWorkspacesUpdateContext.Provider>
        </LoginUserWorkspacesContext.Provider>
    );
};

export const useLoginUserWorkspaces = () => {
    const ctx = useContext(LoginUserWorkspacesContext);
    if (!ctx) {
        throw new Error("useLoginUserWorkspaces must be used within a LoginUserWorkspacesProvider");
    }
    return ctx;
};

export const useLoginUserWorkspacesUpdate = () => {
    const ctx = useContext(LoginUserWorkspacesUpdateContext);
    if (!ctx) {
        throw new Error(
            "useLoginUserWorkspacesUpdate must be used within a LoginUserWorkspacesProvider",
        );
    }
    return ctx;
};
