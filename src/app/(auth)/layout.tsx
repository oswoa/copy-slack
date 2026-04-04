import { LoginUserProvider } from "@/app/context/LoginUserContext";
import { LoginUserWorkspacesProvider } from "@/app/context/LoginUserWorkspacesContext";

import "@/app/page.module.css";
import "./workspace/[workspaceId]/[channelId]/page.module.css";

export default function WorkspaceComponentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LoginUserProvider>
            <LoginUserWorkspacesProvider>{children}</LoginUserWorkspacesProvider>
        </LoginUserProvider>
    );
}
