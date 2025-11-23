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
import { ErrorDetail } from "../common/ErrorDetail";
import { User } from "@prisma/client";

export type SafeUser = Omit<User, "email" | "password" | "token" | "createdAt" | "updatedAt">;
export type UserProfile = Omit<User, "password" | "token" | "createdAt" | "updatedAt">;

const CurrentUserContext = createContext<UserProfile | undefined>(undefined);
const CurrentUserUpdateContext = createContext<Dispatch<SetStateAction<UserProfile>> | undefined>(
    undefined
);

type CurrentUserProviderProps = {
    children: ReactNode;
};
export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
    const [currentUser, setCurrentUser] = useState<UserProfile>({
        userId: "",
        displayName: "",
        email: "",
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
        const userProfile: UserProfile = {
            userId: authorizedUser.userId,
            email: authorizedUser.email,
            displayName: authorizedUser.displayName,
        };
        setCurrentUser(userProfile);
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
