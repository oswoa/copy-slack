import { AuthRepository } from "@/repositories/AuthRepository";
import { AuthDatabase } from "@/infrustructures/AuthDatabase";
import { AuthService } from "@/services/AuthService";
import { WorkspaceDatabase } from "@/infrustructures/WorkspaceDatabase";
import { WorkspaceRepository } from "@/repositories/WorkspaceRepository";
import { WorkspaceService } from "@/services/WorkspaceService";
import { ChannelDatabase } from "@/infrustructures/ChannelDatabase";
import { ChannelRepository } from "@/repositories/ChannelRepository";
import { ChannelService } from "@/services/ChannelService";
import { PostDatabase } from "@/infrustructures/PostDatabase";
import { PostRepository } from "@/repositories/PostRepository";
import { PostService } from "@/services/PostService";
import { UserDatabase } from "@/infrustructures/UserDatabase";
import { UserRepository } from "@/repositories/UserRepository";
import { UserService } from "@/services/UserService";

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
export const authService = new AuthService(authRepository);

// Userサービスの作成
const userDb = new UserDatabase();
const userRepository = new UserRepository(userDb);
export const userService = new UserService(userRepository);
