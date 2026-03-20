import { AuthRepository } from "@/repositories/AuthRepository";
import { AuthDatabase } from "@/infrustructures/AuthDatabase";
import { AuthService } from "@/services/AuthService";
import { WorkspaceDatabase } from "@/infrustructures/WorkspaceDatabase";
import { WorkspaceRepository } from "@/repositories/WorkspaceRepository";
import { WorkspaceService } from "@/services/WorkspaceService";
import { ChannelDatabase } from "@/infrustructures/ChannelDatabase";
import { ChannelRepository } from "@/repositories/ChannelRepository";
import { ChannelService } from "@/services/ChannelService";

// Channelサービスの作成
const channelDb = new ChannelDatabase();
const channelRepository = new ChannelRepository(channelDb);
const channelService = new ChannelService(channelRepository);

// Workspaceサービスの作成
const workspaceDb = new WorkspaceDatabase();
const workspaceRepository = new WorkspaceRepository(workspaceDb);
const workspaceService = new WorkspaceService(workspaceRepository);

// Authサービスの作成
const authDb = new AuthDatabase();
const authRepository = new AuthRepository(authDb);
export const authService = new AuthService(authRepository, workspaceService, channelService);
