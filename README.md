# DNS Doctor

A tiny CLI that diagnoses your DNS setup for common static hosting providers (starting with **Netlify**) and prints the exact records you should have, plus what's currently wrong.

This is useful when:
- your custom domain shows “doesn't appear to be served by Netlify”
- HTTPS/SSL won't provision
- GoDaddy/Namecheap/Cloudflare DNS records are messy and you want a clean checklist

## Features
- Checks `A`, `AAAA`, and `CNAME` records via DNS-over-HTTPS
- Netlify preset (apex `@` A-records + `www` CNAME to your `*.netlify.app`)
- Human-readable output + optional JSON output
- Exit codes for CI scripts

## Requirements
- Node.js 18+

## Install (local)

```bash
npm install
npm run build
```

## Usage

### Netlify (most common)

```bash
node dist/index.js --provider netlify --domain moayed-musa.dev --netlify-site musical-croquembouche-ecc808.netlify.app
```

### JSON output

```bash
node dist/index.js --provider netlify --domain moayed-musa.dev --netlify-site musical-croquembouche-ecc808.netlify.app --json
```

## Example output (human)

```
DNS Doctor - netlify
Domain: moayed-musa.dev

Expected:
  A     @   75.2.60.5
  A     @   99.83.190.102
  CNAME www musical-croquembouche-ecc808.netlify.app

Observed (Cloudflare DoH):
  A     @   75.2.60.5, 99.83.190.102
  AAAA  @   (none)
  CNAME www musical-croquembouche-ecc808.netlify.app

[OK] Looks good. If SSL still fails, wait for propagation and retry verification.
```

## Publish to GitHub
- Create a new repository on GitHub (e.g. `dns-doctor`)
- Copy this folder contents into it
- Commit and push

## License
MIT
