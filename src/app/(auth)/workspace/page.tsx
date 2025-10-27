"use client";

import Link from "next/link";

import WorkspaceSwitcher from "@/app/(auth)/workspace/components/WorkspaceSwitcher";
import { useCurrentUser } from "@/app/context/CurrentUserContext";

// TODO: ダイナミックルートでworkspaceにアクセスするようにする

const Workspace = () => {
    const currentUser = useCurrentUser();

    return (
        <>
            <div>id: {currentUser?.id}</div>
            <div>email: {currentUser?.email}</div>
            <div>token: {currentUser?.token}</div>

            <div>
                <WorkspaceSwitcher />
            </div>

            <Link href={"/sample"}>Sampleへ遷移</Link>
        </>
    );
};

export default Workspace;
