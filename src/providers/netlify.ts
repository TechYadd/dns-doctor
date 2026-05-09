import { ExpectedRecord } from "../types.js";

export function netlifyExpectedRecords(args: {
  netlifySite: string;
}): ExpectedRecord[] {
  const site = normalizeNetlifySite(args.netlifySite);

  return [
    { type: "A", host: "@", value: "75.2.60.5" },
    { type: "A", host: "@", value: "99.83.190.102" },
    { type: "CNAME", host: "www", value: site }
  ];
}

function normalizeNetlifySite(site: string): string {
  const trimmed = site.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return trimmed.replace(/\.$/, "");
}

