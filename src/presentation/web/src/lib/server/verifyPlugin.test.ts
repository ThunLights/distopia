import { pluginHeaders } from "./verifyPlugin";
import { describe, expect, it } from "vitest";

describe("pluginHeaders", () => {
  it("forwards ordinary headers", () => {
    const headers = new Headers({ "user-agent": "test-agent", "accept-language": "ja" });
    expect(pluginHeaders(headers)).toEqual({
      "user-agent": "test-agent",
      "accept-language": "ja",
    });
  });

  it("strips cookie and authorization regardless of case", () => {
    const headers = new Headers({
      Cookie: "session=secret",
      Authorization: "Bearer secret",
      "User-Agent": "test-agent",
    });
    expect(pluginHeaders(headers)).toEqual({ "user-agent": "test-agent" });
  });
});
