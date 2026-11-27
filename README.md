# Google Verify Toolkit

A modern browser extension for Google account verification guidance and local diagnostics. Independent project; not affiliated with Google.

## Features
- Overview, Diagnostics and Settings with animated beUI buttons.
- English and Vietnamese, light/dark/system themes.
- On-demand detection of visible QR, SMS and voice options on Google Accounts.
- Side Panel on Chrome, Edge and Firefox (browser support varies; Opera uses the popup).
- Detect visible QR labels on headings and graphics, and the official “Try another way” option.
- Per-tab badge counts detected methods after a manual scan and resets on navigation.
- Guided verification instructions in English and Vietnamese.
- Copy a redacted diagnostic report. No backend or account credentials.

Detection is heuristic: a method not detected is not necessarily unavailable. The extension does not change the verification flow or guarantee that any method is offered.

## Usage
Open the Google Accounts page, invoke the extension from the browser toolbar, and select Check current page. If an alternative is shown, select it on Google's page. The extension does not click verification controls or decode QR payloads. Side panels use the same on-demand inspection; if access is unavailable after navigation, invoke the toolbar popup again. Badge counts are not account verification status.

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

## Pull request build previews
Every PR targeting dev or main builds Chrome, Edge, Opera and Firefox. A single bot comment on same-repository PRs shows the current build status and, after all checks pass, a separate ZIP download for each browser. For fork PRs, download from the Actions run's Artifacts section instead.
Extract the downloaded artifact once and load the folder containing manifest.json. Chrome builds also support Brave and Vivaldi; Firefox previews are unsigned, for temporary loading via about:debugging. Artifacts are retained for 7 days. GitHub sign-in may be required.

## Privacy
Uses activeTab and scripting for an explicit scan of the active tab and storage for theme/language only. No network request is made by the scan. No QR payload, OTP, cookie, token, full URL or page text is recorded or exported. Google handles verification on its own site.

## UI
WXT + React + TypeScript + Tailwind CSS + beUI. The beUI Button is adapted from [starc007/ui-components](https://github.com/starc007/ui-components); optional sound integration is omitted. See licenses/beui.LICENSE.

## Branches
feature/* or fix/* -> dev -> main. CI checks types, tests and builds for Chrome, Edge, Opera and Firefox.
