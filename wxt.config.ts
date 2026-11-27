import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Google Verify Toolkit',
    description: 'Local Google account verification guidance and diagnostics.',
    permissions: ['activeTab', 'scripting', 'storage'],
    icons: { 128: 'icon.svg' },
    action: { default_title: 'Google Verify Toolkit' },
  },
  vite: () => ({ plugins: [tailwindcss()] }),
});
