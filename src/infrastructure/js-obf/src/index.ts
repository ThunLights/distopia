import JavaScriptObfuscator from "javascript-obfuscator";

// Single shared entry point for every "ship JS to an untrusted client" code path in this
// monorepo (today: infra-verify's pluginLoader obfuscating a VerifyClientPlugin's browser
// script) -- one place to tune obfuscation strength instead of each call site picking its own
// options and drifting apart.
export function obfuscate(code: string): string {
  return JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
  }).getObfuscatedCode();
}
