-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "slackToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "workspaceId"),
    CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("workspaceId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workspace" (
    "workspaceId" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "channelId" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("workspaceId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "postId" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("channelId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profile" (
    "profileId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slackToken_key" ON "User"("slackToken");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_workspaceId_channelName_key" ON "Channel"("workspaceId", "channelName");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
