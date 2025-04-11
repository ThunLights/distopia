import pkg from "../../../package.json";
import { config } from "$lib/server/config";

export const VERSION = pkg.version;

export const LoginUrl = config.oauth;
