import { parse } from 'node:path'
import { runSilently } from './subprocess.js'


export async function mimeFor(filePath) {
	return process.platform === 'win32'
		? await windowsMime(filePath)
		: (await runSilently('file', ['--mime-type', '--brief', filePath])).stdout.trim()
}

async function windowsMime(filePath) { // TODO test on windows
	const ext = parse(filePath).ext.toLowerCase()
	try {
		const { stdout } = await runSilently('reg', ['query', `HKEY_CLASSES_ROOT\\${ext}`, '/v', 'Content Type'])
		const match = stdout.match(/Content Type\s+REG_SZ\s+(\S+)/)
		if (match)
			return match[1]
	}
	catch {}
	return 'application/octet-stream'
}
