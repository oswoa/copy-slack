import { AuthRepository } from "@/repositories/AuthRepository";
import { AuthDatabase } from "@/infrastructures/AuthDatabase";
import { AuthService } from "@/services/AuthService";
import { WorkspaceDatabase } from "@/infrastructures/WorkspaceDatabase";
import { WorkspaceRepository } from "@/repositories/WorkspaceRepository";
import { WorkspaceService } from "@/services/WorkspaceService";
import { ChannelDatabase } from "@/infrastructures/ChannelDatabase";
import { ChannelRepository } from "@/repositories/ChannelRepository";
import { ChannelService } from "@/services/ChannelService";
import { PostDatabase } from "@/infrastructures/PostDatabase";
import { PostRepository } from "@/repositories/PostRepository";
import { PostService } from "@/services/PostService";
import { UserDatabase } from "@/infrastructures/UserDatabase";
import { UserRepository } from "@/repositories/UserRepository";
import { UserService } from "@/services/UserService";
import { ProfileDatabase } from "@/infrastructures/ProfileDatabase";
import { ProfileRepository } from "@/repositories/ProfileRepository";
import { ProfileService } from "@/services/ProfileService";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントの作成
export const prisma = new PrismaClient({
    omit: {
        // password, tokenはデフォルトで返さないようにする
        user: {
            password: true,
            token: true,
        },
    },
});

// Profileサービスの作成
const profileDb = new ProfileDatabase();
const profileRepository = new ProfileRepository(profileDb);
export const profileService = new ProfileService(profileRepository);

// Postサービスの作成
const postDb = new PostDatabase();
const postRepository = new PostRepository(postDb);
export const postService = new PostService(postRepository);

// Channelサービスの作成
const channelDb = new ChannelDatabase();
const channelRepository = new ChannelRepository(channelDb);
export const channelService = new ChannelService(channelRepository);

// Workspaceサービスの作成
const workspaceDb = new WorkspaceDatabase();
const workspaceRepository = new WorkspaceRepository(workspaceDb);
export const workspaceService = new WorkspaceService(workspaceRepository);

// Authサービスの作成
const authDb = new AuthDatabase();
const authRepository = new AuthRepository(authDb);
export const authService = new AuthService(authRepository, workspaceRepository, channelRepository);

// Userサービスの作成
const userDb = new UserDatabase();
const userRepository = new UserRepository(userDb);
export const userService = new UserService(userRepository);
