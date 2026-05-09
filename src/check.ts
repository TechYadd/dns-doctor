import { resolveDnsJson } from "./doh.js";
import { netlifyExpectedRecords } from "./providers/netlify.js";
import { CheckResult, DnsRecordType, ExpectedRecord, ObservedRecordSet } from "./types.js";

export async function check(args: {
  provider: "netlify";
  domain: string;
  netlifySite?: string;
}): Promise<CheckResult> {
  const domain = normalizeDomain(args.domain);
  const provider = args.provider;

  const expected = getExpected(provider, args);

  const [apexA, apexAAAA, wwwCname] = await Promise.all([
    resolveDnsJson({ name: domain, type: "A" }),
    resolveDnsJson({ name: domain, type: "AAAA" }),
    resolveDnsJson({ name: `www.${domain}`, type: "CNAME" })
  ]);

  const observedApex: ObservedRecordSet = {
    A: apexA,
    AAAA: apexAAAA
  };
  const observedWww: ObservedRecordSet = {
    CNAME: wwwCname
  };

  const issues: string[] = [];
  const fix: string[] = [];

  const expectedApexA = expected.filter((r) => r.host === "@" && r.type === "A").map((r) => r.value);
  const expectedWwwCname = expected.find((r) => r.host === "www" && r.type === "CNAME")?.value;

  if (!arrayContainsSameSet(apexA, expectedApexA)) {
    issues.push(
      `Apex A records mismatch. Expected: ${expectedApexA.join(", ")}. Observed: ${formatList(apexA)}.`
    );
    fix.push(`In your DNS provider, set two A records for @ to: ${expectedApexA.join(" and ")}.`);
  }

  if (apexAAAA.length > 0) {
    issues.push(`Apex AAAA record(s) detected: ${formatList(apexAAAA)}. This can break Netlify verification.`);
    fix.push(`Remove AAAA records for @ unless you intentionally configured IPv6 for this site.`);
  }

  if (!expectedWwwCname) {
    issues.push("Internal error: missing expected www CNAME.");
  } else if (!wwwCname.map(normalizeHost).includes(normalizeHost(expectedWwwCname))) {
    issues.push(
      `www CNAME mismatch. Expected: ${expectedWwwCname}. Observed: ${formatList(wwwCname)}.`
    );
    fix.push(`Set CNAME for www to: ${expectedWwwCname}.`);
  }

  if (issues.length === 0) {
    fix.push("If SSL still fails, wait for DNS propagation (can take time) and retry verification in Netlify.");
  } else {
    fix.push("After changes, wait for propagation and click “Retry DNS verification” in Netlify.");
  }

  return {
    ok: issues.length === 0,
    domain,
    provider,
    expected,
    observed: {
      apex: observedApex,
      www: observedWww
    },
    issues,
    fix
  };
}

function getExpected(provider: "netlify", args: { netlifySite?: string }): ExpectedRecord[] {
  if (provider === "netlify") {
    if (!args.netlifySite) {
      throw new Error("Missing required flag: --netlify-site");
    }
    return netlifyExpectedRecords({ netlifySite: args.netlifySite });
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function arrayContainsSameSet(a: string[], b: string[]): boolean {
  const sa = new Set(a.map((v) => v.trim()));
  const sb = new Set(b.map((v) => v.trim()));
  if (sa.size !== sb.size) return false;
  for (const v of sa) if (!sb.has(v)) return false;
  return true;
}

function formatList(list: string[]): string {
  return list.length === 0 ? "(none)" : list.join(", ");
}

