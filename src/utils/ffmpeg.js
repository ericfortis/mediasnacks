import { spawn } from 'node:child_process'
import { printProgress } from './printProgress.js'
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

	p.stderr.pipe(process.stderr)
	p.stdout.on('data', chunk => {
		const text = chunk.toString()
		if (text.includes('progress=end'))
			onProgress(1)
		else {
			const m = text.match(/out_time_us=(\d+)/)
			onProgress(Number(m[1]) / µsVideoDuration)
		}
	})

	await new Promise((resolve, reject) => {
		p.on('error', reject)
		p.on('close', code => {
			if (code === 0) resolve()
			else reject(Error(`ffmpeg failed with code ${code}`))
		})
	})
}
