export * from "./auth";
export * from "./gen/distopia/bot/v1/bot_pb";
export * from "./gen/distopia/schedulemanager/v1/scheduler_pb";
export * from "./gen/distopia/searchengine/v1/search_pb";
// VerifyService is generated in lib/distopia instead of here -- see its proto file's own
// comment for why -- and re-exported from there so in-monorepo consumers of "infra-rpc"
// (presentation-verify, presentation-web) don't need to know which package actually owns it.
export {
  VerifyService,
  type RequestContext,
  type SubmitRequest,
  type SubmitResponse,
  type GetClientScriptRequest,
  type GetClientScriptResponse,
} from "distopia";
