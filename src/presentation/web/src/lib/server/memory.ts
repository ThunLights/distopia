import type { AppState } from "app-core/AppState";
import { Friend } from "repo-memory/Friend";
import { GuildEdit } from "repo-memory/GuildEdit";
import { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import { JWTKey } from "repo-memory/JWTKey";
import { MessageCreate } from "repo-memory/MessageCreate";
import { OAuth2Guilds } from "repo-memory/OAuth2Guilds";
import { OAuth2PKCE } from "repo-memory/OAuth2PKCE";
import { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import { UserJWTVerifyKey } from "repo-memory/UserJWTVerifyKey";
import { UserOAuth2 } from "repo-memory/UserOAuth2";
import { VoiceChannelMember } from "repo-memory/VoiceChannelMember";
import { ButtonLateLimit } from "repo-memory/latelimit/ButtonLateLimit";
import { ChatInputCommandLateLimit } from "repo-memory/latelimit/ChatInputCommandLateLimit";
import { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";

export const memory: AppState["memory"] = {
  latelimit: {
    messageCreate: new MessageCreateLateLimit(),
    bump: new GuildBumpLateLimit(),
    button: new ButtonLateLimit(),
    chatInputCommand: new ChatInputCommandLateLimit(),
  },
  friend: new Friend(),
  guildEdit: new GuildEdit(),
  guildMemberAdd: new GuildMemberAdd(),
  jwtKey: new JWTKey(),
  messageCreate: new MessageCreate(),
  oauth2PKCE: new OAuth2PKCE(),
  oauth2Guilds: new OAuth2Guilds(),
  unJoinedGuild: new UnJoinedGuild(),
  userJWTVerifyKey: new UserJWTVerifyKey(),
  userOAuth2: new UserOAuth2(),
  voiceChannelMember: new VoiceChannelMember(),
};
