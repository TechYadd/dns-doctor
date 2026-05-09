#!/usr/bin/env node
import { check } from "./check.js";
import { formatHuman } from "./format.js";

type Args = {
  provider?: string;
  domain?: string;
  netlifySite?: string;
  json?: boolean;
  help?: boolean;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.provider || !args.domain) {
    process.stdout.write(helpText());
    process.exitCode = args.help ? 0 : 2;
    return;
  }

  try {
    if (args.provider !== "netlify") {
      throw new Error(`Unsupported provider: ${args.provider}. Use: netlify`);
    }

    const result = await check({
      provider: "netlify",
      domain: args.domain,
      netlifySite: args.netlifySite
    });

    if (args.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } else {
      process.stdout.write(formatHuman(result) + "\n");
    }

    process.exitCode = result.ok ? 0 : 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`dns-doctor error: ${msg}\n`);
    process.stderr.write(helpText());
    process.exitCode = 2;
  }
}

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--json") {
      out.json = true;
      continue;
    }
    const [k, vInline] = a.split("=", 2);
    const v = vInline ?? argv[i + 1];

    if (k === "--provider") {
      out.provider = v;
      if (!vInline) i++;
      continue;
    }
    if (k === "--domain") {
      out.domain = v;
      if (!vInline) i++;
      continue;
    }
    if (k === "--netlify-site") {
      out.netlifySite = v;
      if (!vInline) i++;
      continue;
    }
  }
  return out;
}

function helpText(): string {
  return `
dns-doctor

Usage:
  dns-doctor --provider netlify --domain <your-domain> --netlify-site <your-site.netlify.app>

Examples:
  dns-doctor --provider netlify --domain moayed-musa.dev --netlify-site musical-croquembouche-ecc808.netlify.app
  dns-doctor --provider netlify --domain moayed-musa.dev --netlify-site musical-croquembouche-ecc808.netlify.app --json

Exit codes:
  0 = OK
  1 = Issues found
  2 = Usage / network / unexpected error
`;
}

main();
