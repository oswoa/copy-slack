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

import Loading from "@/app/loading";
import { AuthApiResponse } from "../api/auth/route";
import { ErrorDetail } from "../common/ErrorDetail";
import { User } from "@/model/User";
import { useRouter } from "next/navigation";
import { useErrToast } from "./ToastContext";
import { PageFactory } from "../constants/pageUrl";

const LoginUserContext = createContext<User | undefined>(undefined);
const LoginUserUpdateContext = createContext<
    Dispatch<SetStateAction<User | undefined>> | undefined
>(undefined);

type LoginUserProviderProps = {
    children: ReactNode;
};
export const LoginUserProvider = ({ children }: LoginUserProviderProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [loginUser, setLoginUser] = useState<User | undefined>();

    const { setErrToastOpen, setErrToastMsg } = useErrToast();

    const fetchLoginUser = async () => {
        const authRes = await fetch("/api/auth");
        const authData: AuthApiResponse = await authRes.json();

        const errorDetail = ErrorDetail.getFromJson(authData.errorDetail);
        if (!errorDetail.success) {
            setErrToastOpen(true);
            setErrToastMsg(errorDetail.errMsg);
            router.replace(PageFactory.GetErrorURL());
        }
        setLoginUser(
            new User(
                authData.user!.userId,
                authData.user!.email,
                authData.user!.displayName,
                authData.user!.imageUrl,
            ),
        );
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLoginUser();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <LoginUserContext.Provider value={loginUser}>
            <LoginUserUpdateContext.Provider value={setLoginUser}>
                {children}
            </LoginUserUpdateContext.Provider>
        </LoginUserContext.Provider>
    );
};

export const useLoginUser = () => {
    const ctx = useContext(LoginUserContext);
    if (!ctx) {
        throw new Error("useLoginUser must be used within a LoginUserProvider");
    }
    return ctx;
};

export const useLoginUserUpdate = () => {
    const ctx = useContext(LoginUserUpdateContext);
    if (!ctx) {
        throw new Error("useLoginUserUpdate must be used within a LoginUserProvider");
    }
    return ctx;
};
