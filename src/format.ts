import { CheckResult, DnsRecordType, ExpectedRecord } from "./types.js";

export function formatHuman(result: CheckResult): string {
  const lines: string[] = [];

  lines.push(`DNS Doctor - ${result.provider}`);
  lines.push(`Domain: ${result.domain}`);
  lines.push("");
  lines.push("Expected:");
  for (const r of result.expected) {
    lines.push(`  ${pad(r.type, 5)} ${pad(r.host, 4)} ${r.value}`);
  }

  lines.push("");
  lines.push("Observed (Cloudflare DoH):");
  lines.push(`  ${pad("A", 5)} ${pad("@", 4)} ${formatList(result.observed.apex.A ?? [])}`);
  lines.push(`  ${pad("AAAA", 5)} ${pad("@", 4)} ${formatList(result.observed.apex.AAAA ?? [])}`);
  lines.push(`  ${pad("CNAME", 5)} ${pad("www", 4)} ${formatList(result.observed.www.CNAME ?? [])}`);

  lines.push("");

  if (result.ok) {
    lines.push("[OK] Looks good.");
  } else {
    lines.push("[FAIL] Issues found:");
    for (const i of result.issues) lines.push(`- ${i}`);
  }

  lines.push("");
  lines.push("Fix steps:");
  for (const s of result.fix) lines.push(`- ${s}`);

  return lines.join("\n");
}

export function expectedAsTable(records: ExpectedRecord[]): string {
  const header = ["Type", "Host", "Value"].map((s) => pad(s, 6)).join(" ");
  const rows = records.map((r) => [r.type, r.host, r.value].map((s) => pad(s, 6)).join(" "));
  return [header, ...rows].join("\n");
}

function pad(value: string, n: number): string {
  return value.length >= n ? value : value + " ".repeat(n - value.length);
}

function formatList(list: string[]): string {
  return list.length === 0 ? "(none)" : list.join(", ");
}

export function isSupportedType(t: string): t is DnsRecordType {
  return t === "A" || t === "AAAA" || t === "CNAME";
}
