import { DnsJsonResponse, DnsRecordType } from "./types.js";

const CLOUDFLARE_DOH_JSON = "https://cloudflare-dns.com/dns-query";

const TYPE_TO_NUM: Record<DnsRecordType, number> = {
  A: 1,
  AAAA: 28,
  CNAME: 5
};

export async function resolveDnsJson(args: {
  name: string;
  type: DnsRecordType;
}): Promise<string[]> {
  const url = new URL(CLOUDFLARE_DOH_JSON);
  url.searchParams.set("name", args.name);
  url.searchParams.set("type", args.type);

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/dns-json"
    }
  });

  if (!res.ok) {
    throw new Error(`DoH request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as DnsJsonResponse;
  if (typeof json?.Status !== "number") {
    throw new Error("Unexpected DoH response");
  }

  const expectedTypeNum = TYPE_TO_NUM[args.type];
  const answers = Array.isArray(json.Answer) ? json.Answer : [];

  return answers
    .filter((a) => a && a.type === expectedTypeNum && typeof a.data === "string")
    .map((a) => normalizeRecordData(args.type, a.data));
}

function normalizeRecordData(type: DnsRecordType, data: string): string {
  if (type === "CNAME") {
    return data.replace(/\.$/, "");
  }
  return data;
}

