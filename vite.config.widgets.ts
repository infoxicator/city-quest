import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'

// Automatically detect all .tsx files and directories with index.tsx in worker/widgets as build entries
const entriesDir = path.resolve(__dirname, 'src/widgets')
const entries = Object.fromEntries(
	fs.readdirSync(entriesDir).flatMap((item) => {
		const itemPath = path.join(entriesDir, item)
		const stat = fs.statSync(itemPath)

		// If it's a .tsx file, use it directly
		if (stat.isFile() && item.endsWith('.tsx')) {
			return [[path.basename(item, '.tsx'), itemPath]]
		}

		// If it's a directory with an index.tsx, use that
		if (stat.isDirectory()) {
			const indexPath = path.join(itemPath, 'index.tsx')
			if (fs.existsSync(indexPath)) {
				return [[item, indexPath]]
			}
		}

		return []
	}),
)

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		react(),
	],
	build: {
		outDir: 'dist/public',
		assetsDir: 'widgets',
		rollupOptions: {
			input: entries,
			output: {
				entryFileNames: 'widgets/[name].js',
				chunkFileNames: 'widgets/[name].js',
				assetFileNames: 'widgets/[name][extname]',
				format: 'es',
			},
			preserveEntrySignatures: 'exports-only', // Preserve exports even if they appear unused
		},
	},
})
