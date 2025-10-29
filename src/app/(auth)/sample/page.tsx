"use client";

import { useCurrentWorkspace } from "@/app/context/CurrentWorkspaceContext";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Sample = () => {
    const router = useRouter();
    const currentWorkspace = useCurrentWorkspace();

    const onClick = () => {
        router.push(`/workspace/${currentWorkspace.workspaceId}`);
    };

    return (
        <div>
            <Button variant="contained" onClick={onClick}>
                Workspaceへ遷移
            </Button>
        </div>
    );
};

export default Sample;
