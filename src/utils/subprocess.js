import { spawn } from 'node:child_process'
import { videoAttrs } from './videoAttrs.js'


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


export async function ffmpegWithProgress(input, args, onProgress) {
	await assertUserHasFFmpeg()
	const µsDuration = (await videoAttrs(input)).duration * 1_000_000

	const p = spawn('ffmpeg',
		['-v', 'error', '-nostats', '-progress', 'pipe:1', ...args],
		{ stdio: ['inherit', 'pipe', 'pipe'] })

	p.stderr.pipe(process.stderr)
	p.stdout.on('data', chunk => {
		const text = chunk.toString()
		if (text.includes('progress=end'))
			onProgress(1)
		else {
			const m = text.match(/out_time_us=(\d+)/)
			onProgress(Number(m[1]) / µsDuration)
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


export async function runSilently(program, args) {
	return new Promise((resolve, reject) => {
		const stdout = []
		const stderr = []

		const p = spawn(program, args)
		p.stdout.on('data', chunk => { stdout.push(chunk) })
		p.stderr.on('data', chunk => { stderr.push(chunk) })

		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve({
					stdout: Buffer.concat(stdout).toString(),
					stderr: Buffer.concat(stderr).toString(),
				})
			else
				reject(new Error(`${program} failed with code ${code}\n${Buffer.concat(stderr).toString()}`))
		})
	})
}


export async function run(program, args) {
	return new Promise((resolve, reject) => {
		const p = spawn(program, args, { stdio: ['inherit', 'pipe', 'pipe'] })
		p.stdout.pipe(process.stdout)
		p.stderr.pipe(process.stderr)
		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve()
			else
				reject(new Error(`${program} failed with code ${code}`))
		})
	})
}

