"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { User } from "../common/User";

type LoginUserContextProps = {
    loginUser?: User;
    setLoginUser: Dispatch<SetStateAction<User | undefined>>;
};
const LoginUserContext = createContext<LoginUserContextProps | undefined>(undefined);

type LoginUserProviderProps = {
    children: ReactNode;
};

export const LoginUserProvider = ({ children }: LoginUserProviderProps) => {
    const [loginUser, setLoginUser] = useState<User>();
    return (
        <LoginUserContext.Provider value={{ loginUser, setLoginUser }}>
            {children}
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
