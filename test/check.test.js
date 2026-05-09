import test from "node:test";
import assert from "node:assert/strict";

import { check } from "../dist/check.js";

test("netlify check reports AAAA issue when IPv6 present", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = new URL(url);
    const type = u.searchParams.get("type");
    const name = u.searchParams.get("name");

    const json = (answers) => ({
      ok: true,
      status: 200,
      statusText: "OK",
      async json() {
        return { Status: 0, Answer: answers };
      }
    });

    if (type === "A" && name === "example.com") {
      return json([
        { name: "example.com", type: 1, data: "75.2.60.5" },
        { name: "example.com", type: 1, data: "99.83.190.102" }
      ]);
    }
    if (type === "AAAA" && name === "example.com") {
      return json([{ name: "example.com", type: 28, data: "2606:4700::1111" }]);
    }
    if (type === "CNAME" && name === "www.example.com") {
      return json([{ name: "www.example.com", type: 5, data: "mysite.netlify.app." }]);
    }

    return json([]);
  };

  try {
    const result = await check({
      provider: "netlify",
      domain: "example.com",
      netlifySite: "mysite.netlify.app"
    });
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.toLowerCase().includes("aaaa")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

