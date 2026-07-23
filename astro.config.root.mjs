// @ts-check
import { defineConfig } from 'astro/config';

// PaloNexus marketing root (palonexus.ai). Static output, no adapter, no Starlight —
// This build uses the shared src/ tree and landing collection. The docs build adds
// Starlight and keeps its /docs base; the two Workers remain separate during migration.
// Local dev: `npm run dev:root` -> http://localhost:4321/
export default defineConfig({
	site: 'https://palonexus.ai',
	outDir: './dist-root',
});
