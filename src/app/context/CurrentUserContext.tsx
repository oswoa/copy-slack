"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
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
