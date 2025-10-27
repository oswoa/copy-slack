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

import { User } from "../common/User";

const CurrentUserContext = createContext<User | undefined>(undefined);
const CurrentUserUpdateContext = createContext<Dispatch<SetStateAction<User>> | undefined>(
    undefined
);

type CurrentUserProviderProps = {
    children: ReactNode;
};
export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User>(new User("", "", ""));

    const fetchCurrentUser = async () => {
        const res = await fetch("/api/auth");
        if (res.status !== HttpStatusCode.Ok) {
            return;
        }

        const resData = await res.json();
        const user = User.getUserFromJson(resData.user);
        if (!user) {
            return;
        }
        setCurrentUser(new User(user.id, user.email, user.token));
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
