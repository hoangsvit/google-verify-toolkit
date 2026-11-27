import { readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
const browser = process.argv[2];
if (!['chrome','edge','opera','firefox'].includes(browser)) throw Error('Unsupported browser');
const root = resolve('.output', browser + '-mv3');
const manifest = JSON.parse(readFileSync(resolve(root,'manifest.json'),'utf8'));
if (manifest.manifest_version !== 3 || !manifest.version || !manifest.name || !manifest.action?.default_popup) throw Error('Invalid extension manifest');
const panel = manifest.side_panel?.default_path ?? manifest.sidebar_action?.default_panel;
if (browser !== 'opera' && !panel) throw Error('Missing side panel');
const assets = [panel,manifest.action.default_popup, ...Object.values(manifest.icons ?? {}), manifest.background?.service_worker, ...(manifest.background?.scripts ?? [])].filter(Boolean);
for (const asset of assets) {
  const path = resolve(root, asset);
  if (!path.startsWith(root + sep) || !statSync(path).isFile()) throw Error('Missing or invalid extension asset: ' + asset);
}
console.log('Validated ' + browser + ' manifest and referenced assets');
