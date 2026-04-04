import { LoginUserProvider } from "@/app/context/LoginUserContext";
import { UserWorkspacesProvider } from "@/app/context/UserWorkspacesContext";

import "@/app/page.module.css";
import "./workspace/[workspaceId]/[channelId]/page.module.css";

export default function WorkspaceComponentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LoginUserProvider>
            <UserWorkspacesProvider>{children}</UserWorkspacesProvider>
        </LoginUserProvider>
    );
}
