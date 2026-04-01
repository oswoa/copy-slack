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
import { User } from "@/model/User";

const CurrentUserContext = createContext<User | undefined>(undefined);
const CurrentUserUpdateContext = createContext<Dispatch<SetStateAction<User>> | undefined>(
    undefined,
);

type CurrentUserProviderProps = {
    children: ReactNode;
};
export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
    const [isLogined, setIsLogined] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>({
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
        setCurrentUser(
            new User(
                authorizedUser.userId,
                authorizedUser.email,
                authorizedUser.displayName,
                authorizedUser.imageUrl,
            ),
        );
        setIsLogined(true);
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <CurrentUserUpdateContext.Provider value={setCurrentUser}>
                {isLogined && children}
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
