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
import { Prisma, PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ISaveImage } from "@/infrastructures/ISaveImage";
import { LocalStorage } from "@/infrastructures/LocalStorage";
import { S3 } from "@/infrastructures/S3";

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
export type AppPrismaClient = typeof prisma;
export type TransactionClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

// S3クライアントの作成
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
    },
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    forcePathStyle: process.env.NODE_ENV === "development",
});

// Profileサービスの作成
let storage: ISaveImage;
if (process.env.NODE_ENV === "development") {
    storage = new LocalStorage();
} else {
    storage = new S3();
}
const profileDb = new ProfileDatabase(storage);
const profileRepository = new ProfileRepository(profileDb);
export const profileService = new ProfileService(prisma, profileRepository);

// Postサービスの作成
const postDb = new PostDatabase();
const postRepository = new PostRepository(postDb);
export const postService = new PostService(prisma, postRepository);

// Channelサービスの作成
const channelDb = new ChannelDatabase();
const channelRepository = new ChannelRepository(channelDb);
export const channelService = new ChannelService(prisma, channelRepository);

// Workspaceサービスの作成
const workspaceDb = new WorkspaceDatabase();
const workspaceRepository = new WorkspaceRepository(workspaceDb);
export const workspaceService = new WorkspaceService(prisma, workspaceRepository);

// Authサービスの作成
const authDb = new AuthDatabase();
const authRepository = new AuthRepository(authDb);
export const authService = new AuthService(
    prisma,
    authRepository,
    workspaceRepository,
    channelRepository,
);

// Userサービスの作成
const userDb = new UserDatabase();
const userRepository = new UserRepository(userDb);
export const userService = new UserService(prisma, userRepository);
