import { build } from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const configFile = path.resolve(rootDir, 'vite.config.widgets.ts')
const distWidgetsDir = path.resolve(rootDir, 'dist/public/widgets')
const publicWidgetsDir = path.resolve(rootDir, 'public/widgets')

async function syncWidgetsDirectory() {
	try {
		await fs.access(distWidgetsDir)
	} catch {
		console.warn(
			`[widgets] waiting for build output at ${path.relative(rootDir, distWidgetsDir)}`,
		)
		return
	}

	await fs.rm(publicWidgetsDir, { recursive: true, force: true })
	await fs.mkdir(publicWidgetsDir, { recursive: true })
	await fs.cp(distWidgetsDir, publicWidgetsDir, { recursive: true })
	console.log(
		`[widgets] synced assets to ${path.relative(rootDir, publicWidgetsDir)} at ${new Date().toLocaleTimeString()}`,
	)
}

async function startWidgetWatch() {
	console.log('[widgets] starting Vite watch build...')
	const watcher = await build({
		configFile,
		build: {
			watch: {},
		},
	})

	if (!('on' in watcher)) {
		console.error('[widgets] failed to start watcher (unexpected build output)')
		return
	}

	watcher.on('event', async (event) => {
		switch (event.code) {
			case 'BUNDLE_END': {
				try {
					await syncWidgetsDirectory()
					console.log(
						`[widgets] rebuild completed in ${event.duration ?? 0}ms`,
					)
				} catch (error) {
					console.error('[widgets] failed to sync widgets output:', error)
				} finally {
					await event.result?.close()
				}
				break
			}
			case 'ERROR': {
				console.error('[widgets] build error encountered:', event.error)
				break
			}
			default:
		}
	})

	const shutdown = async () => {
		console.log('\n[widgets] shutting down watcher...')
		await watcher.close()
		process.exit(0)
	}

	process.once('SIGINT', shutdown)
	process.once('SIGTERM', shutdown)
}

startWidgetWatch().catch((error) => {
	console.error('[widgets] failed to start watch mode:', error)
	process.exit(1)
})
