# Google Verify Toolkit

A modern browser extension for Google account verification guidance and local diagnostics. Independent project; not affiliated with Google.

## Features
- Overview, Diagnostics and Settings with animated beUI buttons.
- English and Vietnamese, light/dark/system themes.
- On-demand detection of visible QR, SMS and voice options on Google Accounts.
- Copy a redacted diagnostic report. No backend or account credentials.

Detection is heuristic: a method not detected is not necessarily unavailable. The extension does not change the verification flow or guarantee that any method is offered.

## Development
Requires Node.js 22+ and pnpm 10.

```bash
corepack enable
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm build:firefox
pnpm zip
```

For Chrome/Edge/Brave, enable developer mode on the extensions page and load the unpacked .output/chrome-mv3 directory after building. Firefox build is available for temporary testing; signing/distribution is separate.

## Privacy
Uses activeTab and scripting for an explicit scan of the active tab and storage for theme/language only. No network request is made by the scan. No QR payload, OTP, cookie, token, full URL or page text is recorded or exported. Google handles verification on its own site.

## UI
WXT + React + TypeScript + Tailwind CSS + beUI. The beUI Button is adapted from [starc007/ui-components](https://github.com/starc007/ui-components); optional sound integration is omitted. See licenses/beui.LICENSE.

## Branches
feature/* or fix/* -> dev -> main. CI checks types, tests and builds for Chrome and Firefox.
