"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import Toast from "../common/components/Toast";

const ErrorToastContext = createContext<
    | {
          setErrToastOpen: Dispatch<SetStateAction<boolean>>;
          setErrToastMsg: Dispatch<SetStateAction<string>>;
      }
    | undefined
>(undefined);

const SuccessToastContext = createContext<
    | {
          setSuccessToastOpen: Dispatch<SetStateAction<boolean>>;
          setSuccessToastMsg: Dispatch<SetStateAction<string>>;
      }
    | undefined
>(undefined);

type ToastProviderProps = {
    children: ReactNode;
};
export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [errOpen, setErrOpen] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    const [successOpen, setSuccessOpen] = useState(false);
    const [successMsg, setSuccesssMsg] = useState("");

    const errToast = {
        setErrToastOpen: setErrOpen,
        setErrToastMsg: setErrMsg,
    };

    const successToast = {
        setSuccessToastOpen: setSuccessOpen,
        setSuccessToastMsg: setSuccesssMsg,
    };

    return (
        <ErrorToastContext.Provider value={errToast}>
            <SuccessToastContext.Provider value={successToast}>
                {children}
                <Toast msg={errMsg} severity={"error"} open={errOpen} setOpen={setErrOpen} />
                <Toast
                    msg={successMsg}
                    severity={"success"}
                    open={successOpen}
                    setOpen={setSuccessOpen}
                />
            </SuccessToastContext.Provider>
        </ErrorToastContext.Provider>
    );
};

export const useErrToast = () => {
    const ctx = useContext(ErrorToastContext);
    if (!ctx) {
        throw new Error("useErrToast must be used within a ToastProvider");
    }
    return ctx;
};

export const useSuccessToast = () => {
    const ctx = useContext(SuccessToastContext);
    if (!ctx) {
        throw new Error("useSuccessToast must be used within a ToastProvider");
    }
    return ctx;
};
