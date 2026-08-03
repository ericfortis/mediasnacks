import os from 'node:os'
import { spawn } from 'node:child_process'
import { printProgress, showCursor } from './printProgress.js'
import { videoAttrs } from './videoAttrs.js'
import { runSilently } from './subprocess.js'


async function assertUserHasFFmpeg() {
	try {
		await runSilently('ffmpeg', ['-version'])
		await runSilently('ffprobe', ['-version'])
	}
	catch {
		throw new Error('ffmpeg not found. Please install ffmpeg.')
	}
}


export async function ffmpeg(args) {
	await assertUserHasFFmpeg()
	return runSilently('ffmpeg', args)
}


export async function ffmpegWithProgress(input, args, onProgress = printProgress) {
	await assertUserHasFFmpeg()
	const µsVideoDuration = 1e6 * (await videoAttrs(input)).duration

	const p = spawn('ffmpeg', [
		'-v', 'error',
		'-nostats',
		'-progress', 'pipe:1',
		...args
	], { stdio: ['inherit', 'pipe', 'pipe'] })

	const startTime = performance.now()
	p.stdout.on('data', chunk => {
		const text = chunk.toString()
		const msElapsed = performance.now() - startTime
		if (text.includes('progress=continue')) {
			const m = text.match(/out_time_us=(\d+)/)
			const progress = Number(m[1]) / µsVideoDuration
			const msETA = msElapsed * (1 - progress) / progress
			onProgress(progress, msElapsed, msETA)
		}
		else
			onProgress(1, msElapsed, 0)
	})
	process.on('SIGINT', () => {
		p?.kill('SIGINT')
		showCursor()
		console.log('\nAborted')
		process.exit(128 + os.constants.signals.SIGINT)
	})
	p.stderr.pipe(process.stderr)

	await new Promise((resolve, reject) => {
		p.on('error', reject)
		p.on('close', code => {
			if (code === 0) resolve()
			else reject(Error(`ffmpeg failed with code ${code}`))
		})
	})
}
