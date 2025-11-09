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

import { AuthApiResponse } from "../api/auth/route";
import { User } from "@prisma/client";
import { ErrorDetail } from "../common/ErrorDetail";

const CurrentUserContext = createContext<Omit<User, "password" | "token"> | undefined>(undefined);
const CurrentUserUpdateContext = createContext<
    Dispatch<SetStateAction<Omit<User, "password" | "token">>> | undefined
>(undefined);

type CurrentUserProviderProps = {
    children: ReactNode;
};
export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
    const [currentUser, setCurrentUser] = useState<Omit<User, "password" | "token">>({
        userId: "",
        email: "",
        displayName: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const fetchCurrentUser = async () => {
        const authRes = await fetch("/api/auth");
        const authData: AuthApiResponse = await authRes.json();

        const errorDetail = ErrorDetail.getFromJson(authData.errorDetail);
        if (!errorDetail.success) {
            return;
        }
        const authorizedUser = authData.user;
        if (!authorizedUser) {
            return;
        }
        setCurrentUser(authorizedUser);
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <CurrentUserUpdateContext.Provider value={setCurrentUser}>
                {children}
            </CurrentUserUpdateContext.Provider>
        </CurrentUserContext.Provider>
    );
};

export const useCurrentUser = () => {
    const ctx = useContext(CurrentUserContext);
    if (!ctx) {
        throw new Error("useCurrentUser must be used within a CurrentUserProvider");
    }
    return ctx;
};

export const useCurrentUserUpdate = () => {
    const ctx = useContext(CurrentUserUpdateContext);
    if (!ctx) {
        throw new Error("useCurrentUserUpdate must be used within a CurrentUserProvider");
    }
    return ctx;
};
