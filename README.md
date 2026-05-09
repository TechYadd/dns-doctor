# DNS Doctor

[![CI](https://github.com/TechYadd/dns-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/TechYadd/dns-doctor/actions/workflows/ci.yml)

DNS Doctor is a small CLI that diagnoses DNS issues for **Netlify custom domains** and prints the exact records you should have, plus what's currently wrong.

This is useful when:
- your custom domain shows “doesn't appear to be served by Netlify”
- HTTPS/SSL won't provision
- GoDaddy/Namecheap/Cloudflare DNS records are messy and you want a clean checklist

## Quick start (copy/paste)

```bash
# 1) install dependencies
npm install

# 2) build the CLI
npm run build

# 3) run the check (replace the placeholders)
node dist/index.js --provider netlify --domain <your-domain> --netlify-site <your-site>.netlify.app
```

## Features
- Checks `A`, `AAAA`, and `CNAME` records via DNS-over-HTTPS
- Netlify preset (apex `@` A-records + `www` CNAME to your `*.netlify.app`)
- Human-readable output + optional JSON output
- Exit codes for CI scripts

## Requirements
- Node.js 18+

## Install

Clone the repo, then:

```bash
npm install
npm run build
```

## Usage

### Step 1: Pick your inputs
- `--domain` is your custom domain (example: `example.com`)
- `--netlify-site` is your Netlify site hostname (example: `your-site-name.netlify.app`)

You can find your Netlify site hostname in Netlify under:
Project -> Domain management -> Production domains -> `*.netlify.app`

### Step 2: Run the DNS check

```bash
node dist/index.js --provider netlify --domain <your-domain> --netlify-site <your-site>.netlify.app
```

### Run without building (dev mode)

```bash
npm run dev -- --provider netlify --domain <your-domain> --netlify-site <your-site>.netlify.app
```

### Show help

```bash
node dist/index.js --help
```

### JSON output (for scripts)

```bash
node dist/index.js --provider netlify --domain <your-domain> --netlify-site <your-site>.netlify.app --json
```

### Exit codes
- `0`: DNS looks correct for the provider preset
- `1`: Issues found (records missing/mismatched)
- `2`: Usage error or network/unexpected error

## What it checks (Netlify preset)

Expected records for your custom domain:
- `A @ 75.2.60.5`
- `A @ 99.83.190.102`
- `CNAME www <your-site>.netlify.app`

It also warns if you have `AAAA` records for `@` because they can break verification/SSL for some setups.

## Example output (human)

```
DNS Doctor - netlify
Domain: example.com

Expected:
  A     @   75.2.60.5
  A     @   99.83.190.102
  CNAME www your-site.netlify.app

Observed (Cloudflare DoH):
  A     @   75.2.60.5, 99.83.190.102
  AAAA  @   (none)
  CNAME www your-site.netlify.app

[OK] Looks good. If SSL still fails, wait for propagation and retry verification.
```

## Common fixes it will suggest
- Apex (`@`) A records don't match: set the two Netlify A records
- `www` CNAME doesn't match: point `www` to your `*.netlify.app`
- AAAA present at apex: remove AAAA records for `@` unless you intentionally configured IPv6 for this site

## Notes
- DNS changes can take time to propagate. If `dns-doctor` says your DNS is correct but Netlify still shows an error, wait a bit and retry verification in Netlify.

## Development

```bash
npm test
```

## License
MIT
