# Engineering guide
- Branch workflow: feature/* or fix/* -> dev -> main. Do not push feature changes directly to main.
- Use WXT, React, TypeScript, Tailwind and beUI components. Keep third-party licenses.
- Inspect only the active Google Accounts tab on explicit user action. Never read or store credentials, QR payloads, OTPs, session identifiers, phone numbers, or page text in reports.
- Do not spoof devices, intercept authentication traffic or override Google verification methods. Use official account flows.
- Run pnpm typecheck, pnpm test, pnpm build and pnpm build:firefox before merging.
