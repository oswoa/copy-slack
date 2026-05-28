"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import Toast from "../common/components/Toast";

const ErrorToastContext = createContext<
    | {
          setOpenErrToast: Dispatch<SetStateAction<boolean>>;
          setErrToastMsg: Dispatch<SetStateAction<string>>;
      }
    | undefined
>(undefined);

const SuccessToastContext = createContext<
    | {
          setOpenSuccessToast: Dispatch<SetStateAction<boolean>>;
          setSuccessToastMsg: Dispatch<SetStateAction<string>>;
      }
    | undefined
>(undefined);

type ToastProviderProps = {
    children: ReactNode;
};
export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [errOpenErrToast, setOpenErrToast] = useState(false);
    const [errToastMsg, setErrToastMsg] = useState("");

    const [openSuccessToast, setOpenSuccessToast] = useState(false);
    const [successToastMsg, setSuccessToastMsg] = useState("");

    const errToast = {
        setOpenErrToast,
        setErrToastMsg,
    };

    const successToast = {
        setOpenSuccessToast,
        setSuccessToastMsg,
    };

    return (
        <ErrorToastContext.Provider value={errToast}>
            <SuccessToastContext.Provider value={successToast}>
                {children}
                <Toast
                    msg={errToastMsg}
                    severity={"error"}
                    open={errOpenErrToast}
                    setOpen={setOpenErrToast}
                    autoHideDuration={null}
                />
                <Toast
                    msg={successToastMsg}
                    severity={"success"}
                    open={openSuccessToast}
                    setOpen={setOpenSuccessToast}
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
