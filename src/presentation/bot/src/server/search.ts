import { createRemoteSearchEngine } from "app-core/remote";

const { SEARCHENGINE_RPC_URL, SEARCHENGINE_RPC_TOKEN } = process.env;
if (!SEARCHENGINE_RPC_URL || !SEARCHENGINE_RPC_TOKEN) {
  throw new Error("SEARCHENGINE_RPC_URL and SEARCHENGINE_RPC_TOKEN are required");
}

// Needed for the bot's own guild-profile-editing commands (AppCore's Guild.save/loadSearchEngine).
export const searchEngine = createRemoteSearchEngine({
  url: SEARCHENGINE_RPC_URL,
  token: SEARCHENGINE_RPC_TOKEN,
});
