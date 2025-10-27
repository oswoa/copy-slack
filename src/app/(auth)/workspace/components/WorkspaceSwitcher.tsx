"use client";

import { Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import WorkspaceList from "./WorkspaceList";

import { Workspace } from "@/app/common/Workspace";

const WorkspaceSwitcher = () => {
    const [open, setOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        const response: Workspace[] = [
            new Workspace("1", "user1"),
            new Workspace("2", "user2"),
            new Workspace("3", "user3"),
            new Workspace("4", "user4"),
            new Workspace("5", "user5"),
            new Workspace("6", "user6"),
        ];
        setWorkspaces(response);
    }, []);

    return (
        <>
            <ViewSidebarIcon fontSize="medium" color="action" onClick={() => setOpen(!open)} />

            <hr />

            <Drawer open={open} onClose={() => setOpen(!open)}>
                <WorkspaceList workspaces={workspaces} />
            </Drawer>
        </>
    );
};

export default WorkspaceSwitcher;
